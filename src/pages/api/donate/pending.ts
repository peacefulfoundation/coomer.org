import type { APIRoute } from 'astro';

import { createAuth, getSessionUserId } from '@/lib/auth';
import { createDb } from '@/lib/db';

export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const db = createDb(env.DB);

  const session = await auth.api.getSession({ headers: context.request.headers });
  const userId = getSessionUserId(session);

  if (!session?.user || !userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const donations = await db
    .selectFrom('donation')
    .selectAll()
    .where('user_id', '=', userId)
    .where('post_id', '!=', 'unassigned')
    .execute();

  const existingComments = await db
    .selectFrom('comment')
    .select(['donation_id'])
    .where('user_id', '=', userId)
    .execute();

  const commentedDonationIds = new Set(existingComments.map(c => c.donation_id));

  const pendingDonations = donations
    .filter(d => !commentedDonationIds.has(d.id))
    .map(d => ({
      id: d.id,
      postId: d.post_id,
      amount: d.amount,
      currency: d.currency,
      createdAt: new Date(d.created_at).toISOString(),
    }));

  return new Response(JSON.stringify({ donations: pendingDonations }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
