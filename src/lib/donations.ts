// Donation visibility duration based on amount (in days)
// Higher donations = longer visibility
export function calculateVisibilityDays(amount: number): number {
  if (amount >= 50) return 365; // 1 year
  if (amount >= 25) return 180; // 6 months
  if (amount >= 10) return 90;  // 3 months
  if (amount >= 5) return 30;   // 1 month
  if (amount >= 3) return 14;   // 2 weeks
  return 7; // 1 week minimum
}

export function calculateVisibleUntil(amount: number): Date {
  const days = calculateVisibilityDays(amount);
  const visibleUntil = new Date();
  visibleUntil.setDate(visibleUntil.getDate() + days);
  return visibleUntil;
}

// Check if a comment is still visible based on donation amount and time
export function isCommentVisible(visibleUntil: Date): boolean {
  return new Date() < visibleUntil;
}

// Calculate opacity for fading effect (comments fade as they approach expiry)
export function calculateCommentOpacity(visibleUntil: Date, createdAt: Date): number {
  const now = new Date().getTime();
  const created = createdAt.getTime();
  const expires = visibleUntil.getTime();
  
  const totalDuration = expires - created;
  const elapsed = now - created;
  const remaining = expires - now;
  
  if (remaining <= 0) return 0;
  
  // Start fading when 75% of time has passed
  const fadeThreshold = totalDuration * 0.75;
  if (elapsed < fadeThreshold) return 1;
  
  // Linear fade from 1 to 0.3 in the last 25% of time
  const fadeProgress = (elapsed - fadeThreshold) / (totalDuration - fadeThreshold);
  return Math.max(0.3, 1 - (fadeProgress * 0.7));
}

// Ko-fi webhook payload interface
export interface KofiWebhookPayload {
  verification_token: string;
  message_id: string;
  timestamp: string;
  type: 'Donation' | 'Subscription' | 'Commission' | 'Shop Order';
  is_public: boolean;
  from_name: string;
  message: string | null;
  amount: string;
  url: string;
  email: string | null;
  currency: string;
  is_subscription_payment: boolean;
  is_first_subscription_payment: boolean;
  kofi_transaction_id: string;
  shop_items: unknown[] | null;
  tier_name: string | null;
  shipping: unknown | null;
}

export function parseKofiWebhook(data: string): KofiWebhookPayload {
  return JSON.parse(data) as KofiWebhookPayload;
}

// Intent expiry time (30 minutes)
export const INTENT_EXPIRY_MS = 30 * 60 * 1000;

export function createIntentExpiresAt(): Date {
  return new Date(Date.now() + INTENT_EXPIRY_MS);
}
