
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

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const headersList = await headers();
    
    const data = body.data || body;
    const txRef = data.tx_ref || data.reference || data.id;
    const customerEmail = data.customer?.email || data.email;
    const amount = parseFloat(data.amount || "0");

    console.log(`[PayChangu Webhook] Received event for ${customerEmail}. Amount: ${amount}. Ref: ${txRef}`);

    let isVerified = false;

    // 1. Try Signature Verification
    const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;
    const signature = headersList.get('x-paychangu-signature');

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const expectedSignature = hmac.update(rawBody).digest('hex');
      if (signature === expectedSignature) {
        console.log('[PayChangu Webhook] Signature verified successfully.');
        isVerified = true;
      }
    }

    // 2. Fallback: API Verification
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    if (!isVerified && secretKey && txRef) {
      console.log('[PayChangu Webhook] Signature missing/failed. Attempting API Verification fallback...');
      try {
        const verifyRes = await fetch(`https://api.paychangu.com/payment-verification/${txRef}`, {
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Accept': 'application/json'
          }
        });
        const verifyData = await verifyRes.json();
        
        if (verifyData.status === 'success' && (verifyData.data?.status === 'success' || verifyData.data?.status === 'completed')) {
          console.log('[PayChangu Webhook] API Verification successful.');
          isVerified = true;
        }
      } catch (err) {
        console.error('[PayChangu Webhook] API verification error:', err);
      }
    }

    if (!isVerified) {
      console.error('[PayChangu Webhook] Payment could not be verified. Rejecting.');
      return NextResponse.json({ message: 'Verification failed' }, { status: 401 });
    }

    // 3. Activate Pro VIP
    if (customerEmail) {
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.error(`[PayChangu Webhook] No Globlync profile found for email: ${customerEmail}`);
        return NextResponse.json({ message: 'User not found' });
      }

      const userDoc = q.docs[0];
      const userData = userDoc.data();

      let tierName = "Pro Member";
      let days = 30;

      // Handle Malawian Kwacha specific amounts
      if (amount === 100) {
        tierName = "Trial Pro (MWK)";
        days = 2;
      } else if (amount === 500) {
        tierName = "Pro Member (MWK)";
        days = 30;
      } else if (amount === 1000) {
        tierName = "Pro Max (MWK)";
        days = 35; 
      } else {
        // Handle Global USD amounts (rough checks for fixed links)
        if (amount >= 2.0) tierName = "Gold Pro";
        else if (amount >= 1.3) tierName = "Silver Pro";
        else if (amount >= 0.6) tierName = "Bronze Pro";
        days = 30;
      }

      // Check for 24h Launch Bonus (+7 Days)
      const signupDate = userData.createdAt?.toDate() || new Date(userData.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - signupDate.getTime();
      const isWithin24h = diffMs < (24 * 60 * 60 * 1000);

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

      const existingBenefits = userData.activeBenefits || [];
      await userDoc.ref.update({
        isPro: true,
        activeBenefits: [...existingBenefits, newBenefit],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const notifRef = userDoc.ref.collection('notifications');
      await notifRef.add({
        type: 'app',
        message: `${tierName} Activated! ${isWithin24h ? 'Early Bird Bonus Applied! ' : ''}You have ${days} days of VIP access. Expiry: ${expiryDate.toLocaleDateString()}.`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[PayChangu Webhook] ${tierName} activated for ${customerEmail} until ${expiryDate.toISOString()}`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'No email found' });
  } catch (error: any) {
    console.error('[PayChangu Webhook] Internal Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
