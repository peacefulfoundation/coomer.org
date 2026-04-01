import type { APIRoute } from 'astro';
import { eq, and, gt, desc } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { parseKofiWebhook, calculateVisibleUntil } from '@/lib/donations';

// POST: Ko-fi webhook endpoint
export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const db = createDb(env.DB);

  // Ko-fi sends data as form-urlencoded with a 'data' field containing JSON
  const formData = await context.request.formData();
  const dataField = formData.get('data');

  if (!dataField || typeof dataField !== 'string') {
    console.error('Ko-fi webhook: Missing data field');
    return new Response('Missing data', { status: 400 });
  }

  let payload;
  try {
    payload = parseKofiWebhook(dataField);
  } catch (error) {
    console.error('Ko-fi webhook: Failed to parse payload', error);
    return new Response('Invalid payload', { status: 400 });
  }

  // Verify the webhook token
  if (payload.verification_token !== env.KOFI_VERIFICATION_TOKEN) {
    console.error('Ko-fi webhook: Invalid verification token');
    return new Response('Unauthorized', { status: 401 });
  }

  // Only process donations (not subscriptions or shop orders for this feature)
  if (payload.type !== 'Donation') {
    // Still return 200 to acknowledge receipt
    return new Response('OK', { status: 200 });
  }

  const amount = parseFloat(payload.amount);
  const kofiEmail = payload.email?.toLowerCase() || null;

  // Try to find a matching user and intent
  // First, try to match by email
  let user = null;
  let intent = null;

  if (kofiEmail) {
    user = await db.query.user.findFirst({
      where: eq(schema.user.email, kofiEmail),
    });
  }

  if (user) {
    // Find the most recent unexpired intent for this user
    intent = await db.query.donationIntent.findFirst({
      where: and(
        eq(schema.donationIntent.userId, user.id),
        eq(schema.donationIntent.completed, false),
        gt(schema.donationIntent.expiresAt, new Date())
      ),
      orderBy: [desc(schema.donationIntent.createdAt)],
    });
  }

  // If no intent found, we still record the donation but it won't be linked to a post
  // The user can claim it later via the /donate/complete page
  const donationId = crypto.randomUUID();
  const visibleUntil = calculateVisibleUntil(amount);

  await db.insert(schema.donation).values({
    id: donationId,
    visibleUntil,
    intentId: intent?.id || null,
    userId: user?.id || 'anonymous', // We'll handle anonymous donations separately
    postId: intent?.postId || 'unassigned',
    kofiTransactionId: payload.kofi_transaction_id,
    kofiEmail,
    amount,
    currency: payload.currency || 'USD',
    kofiMessage: payload.message || null,
    createdAt: new Date(),
  });

  // Mark intent as completed if found
  if (intent) {
    await db
      .update(schema.donationIntent)
      .set({ completed: true })
      .where(eq(schema.donationIntent.id, intent.id));
  }

  console.log(`Ko-fi donation received: ${amount} ${payload.currency} from ${payload.from_name}`);

  // Ko-fi expects a 200 response
  return new Response('OK', { status: 200 });
};
