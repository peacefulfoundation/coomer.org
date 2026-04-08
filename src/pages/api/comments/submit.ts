import type { APIRoute } from 'astro';

import { createAuth, getSessionUserId } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { createApprovalMessage, sendDiscordMessage, type CommentApprovalData } from '@/lib/services/discord';

export const POST: APIRoute = async (context) => {
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

  let body: { donationId?: string; content?: string };
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { donationId, content } = body;

  if (!donationId || !content) {
    return new Response(JSON.stringify({ error: 'Donation ID and content required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (content.length > 500) {
    return new Response(JSON.stringify({ error: 'Comment too long (max 500 characters)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const donation = await db
    .selectFrom('donation')
    .selectAll()
    .where('id', '=', donationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  if (!donation) {
    return new Response(JSON.stringify({ error: 'Donation not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existingComment = await db
    .selectFrom('comment')
    .select(['id'])
    .where('donation_id', '=', donationId)
    .executeTakeFirst();

  if (existingComment) {
    return new Response(JSON.stringify({ error: 'Comment already exists for this donation' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const commentId = crypto.randomUUID();

  await db.insertInto('comment').values({
    id: commentId,
    donation_id: donationId,
    user_id: userId,
    post_id: donation.post_id,
    content: content.trim(),
    status: 'pending',
    created_at: Date.now(),
  }).execute();

  const postUrl = `${env.SITE_URL}/${donation.post_id}`;

  const approvalData: CommentApprovalData = {
    commentId,
    postId: donation.post_id,
    postUrl,
    discordUsername: user.discord_username || user.name,
    discordAvatar: user.image,
    amount: donation.amount,
    currency: donation.currency,
    content: content.trim(),
  };

  const discordMessage = createApprovalMessage(approvalData);

  try {
    const sentMessage = await sendDiscordMessage(
      env.DISCORD_APPROVAL_CHANNEL_ID,
      env.DISCORD_BOT_TOKEN,
      discordMessage
    );

    if (sentMessage) {
      await db
        .updateTable('comment')
        .set({ discord_message_id: sentMessage.id })
        .where('id', '=', commentId)
        .execute();
    }
  } catch (error) {
    console.error('Failed to send Discord message:', error);
  }

  return new Response(JSON.stringify({
    success: true,
    commentId,
    message: 'Comment submitted for approval',
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
