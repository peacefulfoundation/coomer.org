import type { APIRoute } from 'astro';

import { createDb } from '@/lib/db';
import { parseKofiWebhook, calculateVisibleUntil } from '@/lib/services/donations';

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const db = createDb(env.DB);

  const contentType = context.request.headers.get('content-type') || '';
  let rawData: string;

  try {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await context.request.formData();
      rawData = formData.get('data') as string;
    } else {
      rawData = await context.request.text();
    }

    if (!rawData) {
      return new Response('No data', { status: 400 });
    }

    const payload = parseKofiWebhook(rawData);

    if (payload.verification_token !== env.KOFI_VERIFICATION_TOKEN) {
      console.error('Invalid Ko-fi verification token');
      return new Response('Invalid token', { status: 403 });
    }

    if (payload.type !== 'Donation') {
      return new Response('OK', { status: 200 });
    }

    const amount = parseFloat(payload.amount);
    const kofiEmail = payload.email?.toLowerCase() || null;

    let user = null;
    let intent = null;

    if (kofiEmail) {
      user = await db
        .selectFrom('user')
        .selectAll()
        .where('email', '=', kofiEmail)
        .executeTakeFirst();

      if (user) {
        intent = await db
          .selectFrom('donation_intent')
          .selectAll()
          .where('user_id', '=', user.id)
          .where('completed', '=', 0)
          .where('expires_at', '>', Date.now())
          .orderBy('created_at', 'desc')
          .executeTakeFirst();
      }
    }

    const donationId = crypto.randomUUID();
    const visibleUntil = calculateVisibleUntil(amount);

    await db.insertInto('donation').values({
      id: donationId,
      visible_until: visibleUntil.getTime(),
      intent_id: intent?.id || null,
      user_id: user?.id || 'anonymous',
      post_id: intent?.post_id || 'unassigned',
      kofi_transaction_id: payload.kofi_transaction_id,
      kofi_email: kofiEmail,
      amount,
      currency: payload.currency || 'USD',
      kofi_message: payload.message || null,
      created_at: Date.now(),
    }).execute();

    if (intent) {
      await db
        .updateTable('donation_intent')
        .set({ completed: 1 })
        .where('id', '=', intent.id)
        .execute();
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Ko-fi webhook error:', error);
    return new Response('Error', { status: 500 });
  }
};
