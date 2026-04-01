import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { 
  sendDiscordMessage, 
  createApprovalMessage,
  type CommentApprovalData 
} from '@/lib/discord-bot';

// POST: Submit a comment for a donation
export const POST: APIRoute = async (context) => {
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

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { donationId, content } = body;

  if (!donationId || typeof donationId !== 'string') {
    return new Response(JSON.stringify({ error: 'Donation ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Comment content is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (content.length > 500) {
    return new Response(JSON.stringify({ error: 'Comment must be 500 characters or less' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify the donation exists and belongs to this user
  const donation = await db.query.donation.findFirst({
    where: eq(schema.donation.id, donationId),
  });

  if (!donation) {
    return new Response(JSON.stringify({ error: 'Donation not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (donation.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: 'This donation does not belong to you' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if comment already exists for this donation
  const existingComment = await db.query.comment.findFirst({
    where: eq(schema.comment.donationId, donationId),
  });

  if (existingComment) {
    return new Response(JSON.stringify({ error: 'A comment already exists for this donation' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get user details for Discord message
  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create the comment
  const commentId = crypto.randomUUID();
  const now = new Date();

  await db.insert(schema.comment).values({
    id: commentId,
    donationId,
    userId: session.user.id,
    postId: donation.postId,
    content: content.trim(),
    status: 'pending',
    createdAt: now,
  });

  // Send to Discord for approval
  const postUrl = `${env.SITE_URL}/${donation.postId}`;
  
  const approvalData: CommentApprovalData = {
    commentId,
    postId: donation.postId,
    postUrl,
    userId: session.user.id,
    discordUsername: user.discordUsername || user.name,
    discordAvatar: user.image,
    amount: donation.amount,
    currency: donation.currency,
    content: content.trim(),
    siteUrl: env.SITE_URL,
  };

  const discordMessage = createApprovalMessage(approvalData);
  
  const sentMessage = await sendDiscordMessage(
    env.DISCORD_APPROVAL_CHANNEL_ID,
    env.DISCORD_BOT_TOKEN,
    discordMessage
  );

  if (sentMessage) {
    // Store the Discord message ID for later updates
    await db
      .update(schema.comment)
      .set({ discordMessageId: sentMessage.id })
      .where(eq(schema.comment.id, commentId));
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
