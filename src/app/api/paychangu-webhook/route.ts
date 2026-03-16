
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : undefined;

  admin.initializeApp({
    credential: serviceAccount 
      ? admin.credential.cert(serviceAccount) 
      : admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * PayChangu Webhook Handler
 * Standard: https://globlync.vercel.app/api/paychangu-webhook
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const headersList = await headers();
    
    // PayChangu sends data in different formats depending on event type
    const data = body.data || body;
    const txRef = data.tx_ref || data.reference || data.id;
    const customerEmail = data.customer?.email || data.email;
    const amount = parseFloat(data.amount || "0");

    console.log(`[PayChangu Webhook] Event received for ${customerEmail}. Amount: ${amount}. Ref: ${txRef}`);

    let isVerified = false;

    // 1. Verify via Signature (Secure)
    const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;
    const signature = headersList.get('x-paychangu-signature');

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const expectedSignature = hmac.update(rawBody).digest('hex');
      if (signature === expectedSignature) {
        console.log('[PayChangu Webhook] Signature verified.');
        isVerified = true;
      } else {
        console.warn('[PayChangu Webhook] Signature mismatch. Check PAYCHANGU_WEBHOOK_SECRET.');
      }
    }

    // 2. Fallback: Manual API Verification (Bulletproof)
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    if (!isVerified && secretKey && txRef) {
      console.log('[PayChangu Webhook] Falling back to API verification...');
      try {
        const verifyRes = await fetch(`https://api.paychangu.com/payment-verification/${txRef}`, {
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Accept': 'application/json'
          }
        });
        const verifyData = await verifyRes.json();
        
        if (verifyData.status === 'success' && (verifyData.data?.status === 'success' || verifyData.data?.status === 'completed')) {
          console.log('[PayChangu Webhook] API Manual verification SUCCESS.');
          isVerified = true;
        } else {
          console.warn('[PayChangu Webhook] API Manual verification FAILED:', verifyData.message);
        }
      } catch (err) {
        console.error('[PayChangu Webhook] API verification error:', err);
      }
    }

    if (!isVerified) {
      console.error('[PayChangu Webhook] Verification failed for Ref:', txRef);
      // We return 200 anyway to stop PayChangu from retrying if we've logged it
      return NextResponse.json({ message: 'Verification failed' }, { status: 200 });
    }

    // 3. Process the VIP Activation
    if (customerEmail) {
      const usersRef = db.collection('workerProfiles');
      // CRITICAL: We find the user by contactEmail. If they paid with a different email, this fails.
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.error(`[PayChangu Webhook] No matching Globlync profile for email: ${customerEmail}. Automation stopped.`);
        return NextResponse.json({ message: 'User not found' });
      }

      const userDoc = q.docs[0];
      const userData = userDoc.data();

      // Determine Tier & Days
      let tierName = "Pro Member";
      let days = 30;

      // Logic based on your specific plans
      if (amount >= 1000) { tierName = "Pro Max (MWK)"; days = 35; }
      else if (amount >= 500) { tierName = "Pro Member (MWK)"; days = 30; }
      else if (amount >= 100) { tierName = "Trial Pro (MWK)"; days = 2; }
      else {
        if (amount >= 2.5) tierName = "Gold Pro";
        else if (amount >= 1.5) tierName = "Silver Pro";
        else if (amount >= 0.5) tierName = "Bronze Pro";
        days = 30;
      }

      // 24h Early Bird Bonus (+7 Days)
      const signupDate = userData.createdAt?.toDate() || new Date(userData.createdAt);
      const isWithin24h = (new Date().getTime() - signupDate.getTime()) < (24 * 60 * 60 * 1000);

      if (isWithin24h) {
        days += 7;
        tierName += " (+7 Bonus Days)";
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const newBenefit = {
        type: tierName,
        expiresAt: expiryDate.toISOString(),
        amountPaid: amount,
        paidAt: new Date().toISOString(),
        txRef: txRef,
        isBonusApplied: isWithin24h
      };

      await userDoc.ref.update({
        isPro: true,
        activeBenefits: admin.firestore.FieldValue.arrayUnion(newBenefit),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Notify User
      await userDoc.ref.collection('notifications').add({
        type: 'app',
        message: `${tierName} Activated! You have ${days} days of VIP access. Expiry: ${expiryDate.toLocaleDateString()}.`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[PayChangu Webhook] Success: ${tierName} activated for ${customerEmail}`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'No email found in data' });
  } catch (error: any) {
    console.error('[PayChangu Webhook] Fatal Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
