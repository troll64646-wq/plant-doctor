import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const PRO_PRODUCT_ID = '71d71e93-cf6a-4a4d-af83-efd24b166f39';
const EXPERT_PRODUCT_ID = 'a5e6c962-42b0-4ece-a0fd-a59863098a7b';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify webhook signature
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];
  const body = JSON.stringify(req.body);
  
  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (hmac !== signature) return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-event-name'];
  const data = req.body?.data;
  const attributes = data?.attributes;

  // Only handle subscription created/updated events
  if (!['subscription_created', 'subscription_updated', 'subscription_resumed'].includes(event)) {
    return res.status(200).json({ received: true });
  }

  // Get user UID from custom data passed in checkout URL
  const uid = attributes?.first_subscription_item?.subscription_id
    ? req.body?.meta?.custom_data?.uid
    : null;

  if (!uid) return res.status(200).json({ error: 'No UID in custom data' });

  // Determine tier from product ID
  const variantId = attributes?.variant_id?.toString();
  const productId = attributes?.product_id?.toString();
  
  let tier = 'free';
  if (productId === PRO_PRODUCT_ID || variantId) {
    // Check which product based on order
    const productName = attributes?.product_name?.toLowerCase() || '';
    if (productName.includes('expert')) tier = 'expert';
    else if (productName.includes('pro')) tier = 'pro';
  }

  const status = attributes?.status;
  if (status === 'cancelled' || status === 'expired' || status === 'paused') {
    tier = 'free';
  }

  try {
    await db.collection('users').doc(uid).update({ tier });
    console.log(`Updated user ${uid} to tier ${tier}`);
    res.status(200).json({ success: true, uid, tier });
  } catch (e) {
    console.error('Firestore update failed:', e);
    res.status(500).json({ error: 'Failed to update user' });
  }
}
