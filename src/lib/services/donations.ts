// Visibility duration based on donation amount (in days)
export function calculateVisibilityDays(amount: number): number {
  if (amount >= 50) return 365;
  if (amount >= 25) return 180;
  if (amount >= 10) return 90;
  if (amount >= 5) return 30;
  if (amount >= 3) return 14;
  return 7;
}

export function calculateVisibleUntil(amount: number): Date {
  const days = calculateVisibilityDays(amount);
  const visibleUntil = new Date();
  visibleUntil.setDate(visibleUntil.getDate() + days);
  return visibleUntil;
}

export function isCommentVisible(visibleUntil: Date): boolean {
  return new Date() < visibleUntil;
}

export function calculateCommentOpacity(visibleUntil: Date, createdAt: Date): number {
  const now = Date.now();
  const created = createdAt.getTime();
  const expires = visibleUntil.getTime();
  
  const totalDuration = expires - created;
  const elapsed = now - created;
  const remaining = expires - now;
  
  if (remaining <= 0) return 0;
  
  const fadeThreshold = totalDuration * 0.75;
  if (elapsed < fadeThreshold) return 1;
  
  const fadeProgress = (elapsed - fadeThreshold) / (totalDuration - fadeThreshold);
  return Math.max(0.3, 1 - (fadeProgress * 0.7));
}

// Ko-fi webhook
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

export const INTENT_EXPIRY_MS = 30 * 60 * 1000;

export function createIntentExpiresAt(): Date {
  return new Date(Date.now() + INTENT_EXPIRY_MS);
}
