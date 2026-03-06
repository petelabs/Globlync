
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin securely using Environment Variables
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
 * Uses a double-verification system: 
 * 1. Signature check (if webhook secret is present)
 * 2. API Verification fallback (using Secret Key)
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const headersList = await headers();
    
    // Extract data from the payload
    const data = body.data || body;
    const txRef = data.tx_ref || data.reference || data.id;
    const customerEmail = data.customer?.email || data.email;
    const amount = parseFloat(data.amount || "0");

    console.log(`[Webhook] Received payment notification for ${customerEmail}. Reference: ${txRef}`);

    let isVerified = false;

    // A. Try Signature Verification
    const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;
    const signature = headersList.get('x-paychangu-signature');

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const expectedSignature = hmac.update(rawBody).digest('hex');
      if (signature === expectedSignature) {
        isVerified = true;
        console.log('[Webhook] Signature verification successful.');
      }
    }

    // B. Fallback: API Verification (Using Secret Key from API Keys section)
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    if (!isVerified && secretKey && txRef) {
      console.log('[Webhook] Attempting API verification fallback via PayChangu API...');
      try {
        const verifyRes = await fetch(`https://api.paychangu.com/payment-verification/${txRef}`, {
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Accept': 'application/json'
          }
        });
        const verifyData = await verifyRes.json();
        
        if (verifyData.status === 'success' && (verifyData.data?.status === 'success' || verifyData.data?.status === 'completed')) {
          isVerified = true;
          console.log('[Webhook] API verification successful.');
        } else {
          console.warn('[Webhook] API verification failed:', verifyData.message);
        }
      } catch (err) {
        console.error('[Webhook] API verification error:', err);
      }
    }

    if (!isVerified) {
      console.warn('[Webhook] Could not verify payment source. Transaction ignored.');
      return NextResponse.json({ message: 'Verification failed' }, { status: 401 });
    }

    /**
     * Step 2: Update User Status based on Amount Paid
     */
    if (customerEmail) {
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.warn(`[Webhook] No profile found for email: ${customerEmail}`);
        return NextResponse.json({ message: 'User not found' });
      }

      const userDoc = q.docs[0];
      const userData = userDoc.data();

      // Professional Tier Logic
      let tierName = "Standard Pro";
      let days = 7;

      if (amount >= 700) {
        tierName = "Gold Pro";
        days = 30;
      } else if (amount >= 500) {
        tierName = "Silver Pro";
        days = 15;
      } else if (amount >= 250) {
        tierName = "Standard Pro";
        days = 7;
      } else {
        // Micro-payment safety net
        tierName = "Trial Pro";
        days = 2;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const newBenefit = {
        type: tierName,
        expiresAt: expiryDate.toISOString(),
        amountPaid: amount,
        paidAt: new Date().toISOString(),
        txRef: txRef
      };

      const existingBenefits = userData.activeBenefits || [];
      await userDoc.ref.update({
        isPro: true,
        activeBenefits: [...existingBenefits, newBenefit],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Notify the user in-app
      const notifRef = db.collection('workerProfiles').doc(userDoc.id).collection('notifications');
      await notifRef.add({
        type: 'app',
        message: `Payment Verified! You've been upgraded to ${tierName} for ${days} days. Amount: MWK ${amount}. Expiry: ${expiryDate.toLocaleDateString()}.`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Webhook] Upgraded ${customerEmail} to ${tierName}`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'No email found' });
  } catch (error: any) {
    console.error('[Webhook Error]:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
