import type { APIRoute } from 'astro';

import { createDb } from '@/lib/db';
import { calculateCommentOpacity } from '@/lib/services/donations';

export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const { postId } = context.params;
  const db = createDb(env.DB);

  if (!postId) {
    return new Response(JSON.stringify({ error: 'Post ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = Date.now();

  const comments = await db
    .selectFrom('comment')
    .innerJoin('donation', 'comment.donation_id', 'donation.id')
    .innerJoin('user', 'comment.user_id', 'user.id')
    .select([
      'comment.id',
      'comment.content',
      'comment.created_at',
      'donation.amount',
      'donation.currency',
      'donation.visible_until',
      'user.name',
      'user.discord_username',
      'user.image',
    ])
    .where('comment.post_id', '=', postId)
    .where('comment.status', '=', 'approved')
    .where('donation.visible_until', '>', now)
    .orderBy('donation.amount', 'desc')
    .orderBy('comment.created_at', 'desc')
    .execute();

  const visibleComments = comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    createdAt: new Date(comment.created_at).toISOString(),
    amount: comment.amount,
    currency: comment.currency,
    opacity: calculateCommentOpacity(
      new Date(comment.visible_until),
      new Date(comment.created_at)
    ),
    user: {
      name: comment.discord_username || comment.name,
      image: comment.image,
    },
    visibleUntil: new Date(comment.visible_until).toISOString(),
  }));

  return new Response(JSON.stringify({ comments: visibleComments }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
