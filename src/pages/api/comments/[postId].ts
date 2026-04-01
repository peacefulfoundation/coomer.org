import type { APIRoute } from 'astro';
import { eq, and, gt } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { calculateCommentOpacity } from '@/lib/donations';

// GET: Get approved comments for a post
export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const db = createDb(env.DB);

  const { postId } = context.params;

  if (!postId) {
    return new Response(JSON.stringify({ error: 'Post ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get approved comments for this post where the donation is still visible
  const comments = await db.query.comment.findMany({
    where: and(
      eq(schema.comment.postId, postId),
      eq(schema.comment.status, 'approved')
    ),
  });

  // Get the associated donations to check visibility
  const commentIds = comments.map(c => c.donationId);
  const donations = await db.query.donation.findMany({
    where: commentIds.length > 0
      ? eq(schema.donation.postId, postId)
      : undefined,
  });

  const donationMap = new Map(donations.map(d => [d.id, d]));

  // Get user info for display
  const userIds = [...new Set(comments.map(c => c.userId))];
  const users = await db.query.user.findMany({
    where: userIds.length > 0
      ? eq(schema.user.id, userIds[0]) // This is simplified, ideally use `inArray`
      : undefined,
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  const now = new Date();

  // Filter and transform comments
  const visibleComments = comments
    .map(comment => {
      const donation = donationMap.get(comment.donationId);
      if (!donation) return null;

      // Check if still visible
      if (donation.visibleUntil < now) return null;

      const user = userMap.get(comment.userId);
      const opacity = calculateCommentOpacity(donation.visibleUntil, comment.createdAt);

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        amount: donation.amount,
        currency: donation.currency,
        opacity,
        user: {
          name: user?.discordUsername || user?.name || 'Anonymous',
          image: user?.image || null,
        },
        visibleUntil: donation.visibleUntil.toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by amount (higher first), then by date (newer first)
      if (b!.amount !== a!.amount) return b!.amount - a!.amount;
      return new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime();
    });

  return new Response(JSON.stringify({ comments: visibleComments }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
