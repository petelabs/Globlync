
import { NextResponse } from 'next/server';
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
 * Handles account deletion feedback reporting.
 * Sends data to globlync+accountdeletion@gmail.com (simulated via log/admin check)
 */
export async function POST(req: Request) {
  try {
    const { email, uid, reasons, description } = await req.json();

    console.log(`[DELETION FEEDBACK] User ${email} (UID: ${uid}) has deleted their account.`);
    console.log(`Reasons: ${reasons.join(', ')}`);
    console.log(`Description: ${description || 'No additional details provided.'}`);

    // In a production environment with an SMTP server or SendGrid, 
    // you would trigger the actual email to globlync+accountdeletion@gmail.com here.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 });
  }
}
