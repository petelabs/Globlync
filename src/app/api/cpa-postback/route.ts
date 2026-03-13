import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
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

// Trusted IP from CPALead for security
const CPALEAD_IP = "4.69.179.33";

/**
 * CPA Postback Handler with IP Whitelisting
 * This route is called by the CPA network (CPALead) when a task is completed.
 * Expected params: ?uid=[subid]&amount=[payout]
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const headersList = await headers();
  
  // 1. IP Whitelisting Check (Fraud Prevention)
  const forwardedFor = headersList.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

  if (clientIp !== CPALEAD_IP) {
    console.warn(`[CPA Postback] Blocked request from unauthorized IP: ${clientIp}. Expected: ${CPALEAD_IP}`);
    // During initial setup, if you see blocks, confirm the IP hasn't changed.
    return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 });
  }
  
  // 2. Extract CPALead Macros
  const uid = searchParams.get('uid');
  const amountStr = searchParams.get('amount') || "0";
  const amount = parseFloat(amountStr);

  console.log(`[CPA Postback] Ping received. UID: ${uid}, Payout: ${amountStr}`);

  // We check for literal placeholders to avoid errors during CPALead's "Test Postback" pings
  if (!uid || uid === "{subid}" || uid === "[subid]" || uid === "12345") {
    console.log('[CPA Postback] Placeholder or test UID received. Sending Success signal to CPALead tool.');
    return new Response("1", { status: 200 }); 
  }

  try {
    const userRef = db.collection('workerProfiles').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.warn(`[CPA Postback] User ${uid} not found in Firestore. This might be a CPALead test or a deleted user.`);
      // We return "1" anyway to stop CPALead from retrying a non-existent user forever
      return new Response("1", { status: 200 });
    }

    const userData = userDoc.data() || {};
    
    // Conversion Logic: $1 Earned = 100 Credits for User
    const creditsEarned = Math.max(0, Math.round(amount * 100)); 
    
    if (creditsEarned === 0) {
      console.warn(`[CPA Postback] Zero credits earned for user ${uid}. Amount was: ${amountStr}`);
      return new Response("1", { status: 200 }); 
    }

    const currentCredits = (userData.rewardCredits || 0) + creditsEarned;

    let isAutoActivated = false;
    let newBenefits = userData.activeBenefits || [];

    // AUTO-VIP Logic: 100 total credits = 30 days Pro
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
        ? `Success! You earned ${creditsEarned} Credits and reached the 100-Credit milestone. 30 Days of Pro VIP is now active!` 
        : `Task Complete! You earned ${creditsEarned} Credits. Reach 100 total credits to unlock Pro VIP for free.`,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[CPA Postback] Success for user ${uid}. Earned: ${creditsEarned}. Balance: ${remainingCredits}. Auto-VIP: ${isAutoActivated}`);
    
    // CPALead expects a "1" string to acknowledge success
    return new Response("1", { status: 200 });
  } catch (error) {
    console.error('[CPA Postback] Internal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
