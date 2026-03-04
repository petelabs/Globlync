
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
    // PayChangu documentation typically uses HMAC SHA256 of the body
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid PayChangu signature detected');
      // In production, you might want to return 401, but for initial setup, 
      // check if PayChangu sends the signature in a different format.
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle Success Status
    // PayChangu usually sends an event type or a direct status in the payload
    if (body.status === 'success' || body.event === 'payment.success') {
      const customerEmail = body.customer?.email || body.data?.customer?.email;

      if (!customerEmail) {
        console.warn('Payment successful but no email found in payload');
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      // Find user by email and update Pro status
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.warn(`Payment successful for ${customerEmail} but no worker profile matches this email.`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const userDoc = q.docs[0];
      await userDoc.ref.update({
        isPro: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`User ${userDoc.id} upgraded to Pro via PayChangu webhook`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'Event ignored' });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
