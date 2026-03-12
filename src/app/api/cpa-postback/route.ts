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
 * CPA Postback Handler
 * This route is called by the CPA network (zWidget/CPALead) when a task is completed.
 * Expected params: ?uid=USER_ID&amount=PAYOUT
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');
  const amount = parseFloat(searchParams.get('amount') || "0");

  if (!uid) {
    return NextResponse.json({ error: 'No UID' }, { status: 400 });
  }

  try {
    const userRef = db.collection('workerProfiles').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`[CPA Postback] User ${uid} not found.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data() || {};
    
    // Conversion: $1 = 100 Credits. 
    // If the payout from network is in dollars (e.g. 0.50), convert to credits.
    // If they already send points, adjust accordingly.
    const creditsEarned = Math.round(amount * 100); 
    const currentCredits = (userData.rewardCredits || 0) + creditsEarned;

    let isAutoActivated = false;
    let newBenefits = userData.activeBenefits || [];

    // AUTO-VIP Logic: If they hit 100 credits, spend 100 and give 30 days Pro.
    let remainingCredits = currentCredits;
    if (remainingCredits >= 100) {
      remainingCredits -= 100;
      isAutoActivated = true;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      newBenefits.push({
        type: "Pro Reward (30 Days)",
        expiresAt: expiryDate.toISOString(),
        amountPaid: 0,
        paidAt: new Date().toISOString(),
        txRef: `CPA-${Date.now()}`,
        isBonusApplied: false
      });
    }

    await userRef.update({
      rewardCredits: remainingCredits,
      isPro: isAutoActivated ? true : (userData.isPro || false),
      activeBenefits: newBenefits,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const notifRef = userRef.collection('notifications');
    await notifRef.add({
      type: 'app',
      message: isAutoActivated 
        ? `Task Complete! You earned ${creditsEarned} Credits and hit the 100-Credit milestone. Pro VIP Activated for 30 Days!` 
        : `Task Complete! You earned ${creditsEarned} Credits. Reach 100 to unlock Pro VIP for free.`,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[CPA Postback] Success for ${uid}. Earned: ${creditsEarned}. Total: ${remainingCredits}`);
    
    // Usually CPA networks expect a "1" or "OK" to acknowledge receipt
    return new Response("1", { status: 200 });
  } catch (error) {
    console.error('[CPA Postback] Internal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
