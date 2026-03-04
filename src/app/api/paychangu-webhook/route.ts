
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
 * URL: https://globlync.vercel.app/api/paychangu-webhook
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headersList = await headers();
    const signature = headersList.get('x-paychangu-signature');
    const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;

    if (!secret) {
      console.error('PAYCHANGU_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Verify Signature (PayChangu uses HMAC SHA256)
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(JSON.stringify(body)).digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid PayChangu signature detected');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle Success Status
    if (body.status === 'success') {
      const customerEmail = body.customer?.email;

      if (!customerEmail) {
        return NextResponse.json({ error: 'No email found in payment data' }, { status: 400 });
      }

      // Find user by email and update Pro status
      const usersRef = db.collection('workerProfiles');
      const q = await usersRef.where('contactEmail', '==', customerEmail).limit(1).get();

      if (q.empty) {
        console.warn(`Payment successful but no user found with email: ${customerEmail}`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const userDoc = q.docs[0];
      await userDoc.ref.update({
        isPro: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`User ${userDoc.id} upgraded to Pro via PayChangu`);
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ message: 'Status ignored' });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
