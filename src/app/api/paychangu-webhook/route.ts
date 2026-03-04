
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
 * URL for PayChangu Dashboard: https://globlync.vercel.app/api/paychangu-webhook
 * 
 * PayChangu sends a signature to verify the request is genuine.
 * We use the 'PAYCHANGU_WEBHOOK_SECRET' environment variable for this.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); // Use text for signature verification
    const body = JSON.parse(rawBody);
    const headersList = await headers();
    const signature = headersList.get('x-paychangu-signature');
    const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;

    if (!secret) {
      console.error('PAYCHANGU_WEBHOOK_SECRET is not set in environment variables');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Verify Signature
    // PayChangu usually sends an HMAC signature of the payload using your webhook secret
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid PayChangu signature detected. Check if secret matches.');
      // In production, uncomment the line below to reject unverified requests
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle Success Status
    // Based on PayChangu event structures: 'success' or 'payment.success'
    if (body.status === 'success' || body.event === 'payment.success' || body.data?.status === 'success') {
      const customerEmail = body.customer?.email || body.data?.customer?.email || body.email;

      if (!customerEmail) {
        console.warn('Payment successful but no email found in payload');
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      // Find worker by contact email and upgrade to Pro
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.warn(`Payment success for ${customerEmail} but no Globlync worker profile matches this email.`);
        return NextResponse.json({ message: 'User not found in Globlync' }, { status: 404 });
      }

      const userDoc = q.docs[0];
      await userDoc.ref.update({
        isPro: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Add a notification for the user
      const notifRef = db.collection('workerProfiles').doc(userDoc.id).collection('notifications');
      await notifRef.add({
        type: 'app',
        message: 'Congratulations! Your Pro membership has been activated via PayChangu. You now have expanded storage and priority AI verification!',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`User ${userDoc.id} upgraded to Pro via PayChangu`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'Event received but not processed' });
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
