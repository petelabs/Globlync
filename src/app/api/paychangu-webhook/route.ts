
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
 * Dynamically assigns Pro Tiers based on payment amount.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const headersList = await headers();
    const signature = headersList.get('x-paychangu-signature');
    const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify Signature
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid signature for PayChangu webhook');
      // For security, still return 200 so PayChangu doesn't keep retrying bad signatures
      return NextResponse.json({ message: 'Signature mismatch' });
    }

    // Extract data (handling nested payloads)
    const data = body.data || body;
    const status = data.status;
    const amount = parseFloat(data.amount || "0");
    const customerEmail = data.customer?.email || data.email;

    if ((status === 'success' || body.event === 'payment.success') && customerEmail) {
      // Find worker by email
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.warn(`No Globlync profile found for email: ${customerEmail}`);
        return NextResponse.json({ message: 'User not found' });
      }

      const userDoc = q.docs[0];
      const userData = userDoc.data();

      /**
       * Tier Logic
       */
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
        tierName = "Trial Pro";
        days = 2;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const newBenefit = {
        type: tierName,
        expiresAt: expiryDate.toISOString(),
        amountPaid: amount,
        paidAt: new Date().toISOString()
      };

      // Update user status
      const existingBenefits = userData.activeBenefits || [];
      await userDoc.ref.update({
        isPro: true,
        activeBenefits: [...existingBenefits, newBenefit],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Add notification
      const notifRef = db.collection('workerProfiles').doc(userDoc.id).collection('notifications');
      await notifRef.add({
        type: 'app',
        message: `Payment Verified! You've been upgraded to ${tierName} for ${days} days. Expires: ${expiryDate.toLocaleDateString()}.`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Successfully upgraded ${customerEmail} to ${tierName}`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'Event ignored' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
