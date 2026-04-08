import type { APIRoute } from 'astro';

import { createDb } from '@/lib/db';
import { verifyDiscordSignature, InteractionType, InteractionResponseType } from '@/lib/services/discord';

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const db = createDb(env.DB);

  const { valid, body } = await verifyDiscordSignature(context.request.clone(), env.DISCORD_PUBLIC_KEY);

  if (!valid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const interaction = JSON.parse(body);

  if (interaction.type === InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data.custom_id as string;
    const [action, commentId] = customId.split(':');

    if (!['approve', 'reject'].includes(action) || !commentId) {
      return new Response(JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Invalid action', flags: 64 },
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const comment = await db
      .selectFrom('comment')
      .selectAll()
      .where('id', '=', commentId)
      .executeTakeFirst();

    if (!comment) {
      return new Response(JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Comment not found', flags: 64 },
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (comment.status !== 'pending') {
      return new Response(JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Comment already ${comment.status}`, flags: 64 },
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const approved = action === 'approve';
    const reviewerName = interaction.member?.user?.username || 'Unknown';
    const reviewerId = interaction.member?.user?.id || null;

    await db
      .updateTable('comment')
      .set({
        status: approved ? 'approved' : 'rejected',
        reviewed_at: Date.now(),
        reviewed_by: reviewerId,
      })
      .where('id', '=', commentId)
      .execute();

    const originalEmbed = interaction.message.embeds[0];

    return new Response(JSON.stringify({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: [{
          ...originalEmbed,
          color: approved ? 0x00FF00 : 0xFF0000,
          title: approved ? '✅ Comment Approved' : '❌ Comment Rejected',
          fields: [
            ...originalEmbed.fields,
            {
              name: approved ? 'Approved By' : 'Rejected By',
              value: reviewerName,
              inline: true,
            },
          ],
        }],
        components: [],
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
