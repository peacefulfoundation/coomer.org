import type { APIRoute } from 'astro';
import { eq, and, isNull } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { createAuth } from '@/lib/auth';

// GET: Get pending donations (donations without comments yet)
export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const db = createDb(env.DB);

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get donations for this user that don't have comments yet
  const donations = await db.query.donation.findMany({
    where: eq(schema.donation.userId, session.user.id),
  });

  // Get existing comments for these donations
  const donationIds = donations.map(d => d.id);
  const existingComments = await db.query.comment.findMany({
    where: donationIds.length > 0 
      ? eq(schema.comment.userId, session.user.id)
      : undefined,
  });

  const commentedDonationIds = new Set(existingComments.map(c => c.donationId));

  // Filter to only pending donations (no comment yet)
  const pendingDonations = donations
    .filter(d => !commentedDonationIds.has(d.id) && d.postId !== 'unassigned')
    .map(d => ({
      id: d.id,
      postId: d.postId,
      amount: d.amount,
      currency: d.currency,
      createdAt: d.createdAt.toISOString(),
    }));

  return new Response(JSON.stringify({ donations: pendingDonations }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
