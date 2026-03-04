
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin for secure server-side updates
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * PayChangu Webhook Handler
 * Professional Logic: Determines Pro Tier and Duration based on the amount paid.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const headersList = await headers();
    const signature = headersList.get('x-paychangu-signature');
    const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;

    if (!secret) {
      console.error('PAYCHANGU_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Verify Signature
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid PayChangu signature detected.');
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract status and data
    const status = body.status || body.data?.status;
    const amount = parseFloat(body.amount || body.data?.amount || "0");
    const customerEmail = body.customer?.email || body.data?.customer?.email || body.email;

    if ((status === 'success' || body.event === 'payment.success') && customerEmail) {
      // Find worker by email
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.warn(`Payment for ${customerEmail} - No profile found.`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const userDoc = q.docs[0];
      const userData = userDoc.data();

      // Professional Tier Logic based on Amount
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
        // Minimum tier for small payments
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

      // Update user with the new benefit
      const existingBenefits = userData.activeBenefits || [];
      await userDoc.ref.update({
        isPro: true,
        activeBenefits: [...existingBenefits, newBenefit],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Add a personalized notification
      const notifRef = db.collection('workerProfiles').doc(userDoc.id).collection('notifications');
      await notifRef.add({
        type: 'app',
        message: `Payment Received! You've been upgraded to ${tierName} for ${days} days. Your benefits expire on ${expiryDate.toLocaleDateString()}.`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`User ${userDoc.id} upgraded to ${tierName} for ${amount} MWK`);
      return NextResponse.json({ status: 'success', tier: tierName });
    }

    return NextResponse.json({ message: 'Event received but not processed' });
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
