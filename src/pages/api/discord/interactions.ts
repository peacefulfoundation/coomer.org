import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import {
  verifyDiscordSignature,
  InteractionType,
  InteractionResponseType,
  updateDiscordMessage,
  createApprovalResultEmbed,
} from '@/lib/discord-bot';

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const db = createDb(env.DB);

  // Verify Discord signature
  const { valid, body } = await verifyDiscordSignature(
    context.request.clone(),
    env.DISCORD_PUBLIC_KEY
  );

  if (!valid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Handle PING (Discord verification)
  if (interaction.type === InteractionType.PING) {
    return new Response(
      JSON.stringify({ type: InteractionResponseType.PONG }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Handle button interactions
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data.custom_id as string;
    const [action, commentId] = customId.split(':');

    if (!commentId || (action !== 'approve_comment' && action !== 'reject_comment')) {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Invalid interaction',
            flags: 64, // Ephemeral
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the comment
    const comment = await db.query.comment.findFirst({
      where: eq(schema.comment.id, commentId),
    });

    if (!comment) {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Comment not found',
            flags: 64,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (comment.status !== 'pending') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `This comment has already been ${comment.status}`,
            flags: 64,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const approved = action === 'approve_comment';
    const reviewerName = interaction.member?.user?.username || 'Unknown';
    const reviewerId = interaction.member?.user?.id || null;

    // Update the comment status
    await db
      .update(schema.comment)
      .set({
        status: approved ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      })
      .where(eq(schema.comment.id, commentId));

    // Update the Discord message to show the result
    if (comment.discordMessageId) {
      const originalEmbed = interaction.message.embeds[0];
      const updatedMessage = createApprovalResultEmbed(
        originalEmbed,
        approved,
        reviewerName
      );

      await updateDiscordMessage(
        interaction.channel_id,
        interaction.message.id,
        env.DISCORD_BOT_TOKEN,
        updatedMessage
      );
    }

    // Respond with update to the message
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          embeds: [
            {
              ...interaction.message.embeds[0],
              color: approved ? 0x00FF00 : 0xFF0000,
              title: approved ? '✅ Comment Approved' : '❌ Comment Rejected',
              fields: [
                ...interaction.message.embeds[0].fields,
                {
                  name: approved ? 'Approved By' : 'Rejected By',
                  value: reviewerName,
                  inline: true,
                },
              ],
            },
          ],
          components: [], // Remove buttons
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Unknown interaction type
  return new Response(
    JSON.stringify({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Unknown interaction type',
        flags: 64,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
