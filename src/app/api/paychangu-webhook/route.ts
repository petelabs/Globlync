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

    console.log(`[Webhook] Received payment for ${customerEmail}. Amount: ${amount}. Ref: ${txRef}`);

    let isVerified = false;

    const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;
    const signature = headersList.get('x-paychangu-signature');

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const expectedSignature = hmac.update(rawBody).digest('hex');
      if (signature === expectedSignature) {
        isVerified = true;
      }
    }

    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    if (!isVerified && secretKey && txRef) {
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
        }
      } catch (err) {
        console.error('[Webhook] API verification error:', err);
      }
    }

    if (!isVerified) {
      return NextResponse.json({ message: 'Verification failed' }, { status: 401 });
    }

    if (customerEmail) {
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        return NextResponse.json({ message: 'User not found' });
      }

      const userDoc = q.docs[0];
      const userData = userDoc.data();

      // All Global Plans are now unified to 30 Days
      let tierName = "Pro VIP";
      let days = 30;

      if (amount >= 2.5) {
        tierName = "Gold Pro";
      } else if (amount >= 1.5) {
        tierName = "Silver Pro";
      } else if (amount >= 0.5) {
        tierName = "Bronze Pro";
      } else {
        tierName = "Standard Pro";
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

      const notifRef = userDoc.ref.collection('notifications');
      await notifRef.add({
        type: 'app',
        message: `${tierName} Activated! You now have full access for ${days} days. Expiry: ${expiryDate.toLocaleDateString()}.`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'No email found' });
  } catch (error: any) {
    console.error('[Webhook] Internal Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
