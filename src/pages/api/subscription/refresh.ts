import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { verifyKofiMembership } from '@/lib/services/discord';

const COOLDOWN_MS = 60 * 60 * 1000;

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const db = createDb(env.DB);

  const session = await auth.api.getSession({ headers: context.request.headers });
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('id', '=', session.user.id)
    .executeTakeFirst();

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (user.last_role_check && Date.now() - user.last_role_check < COOLDOWN_MS) {
    const remainingMs = COOLDOWN_MS - (Date.now() - user.last_role_check);
    const minutes = Math.ceil(remainingMs / 60000);
    return new Response(JSON.stringify({
      error: `Please wait ${minutes} minutes before refreshing again`,
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const account = await db
    .selectFrom('account')
    .select(['access_token'])
    .where('user_id', '=', session.user.id)
    .where('provider_id', '=', 'discord')
    .executeTakeFirst();

  if (!account?.access_token) {
    return new Response(JSON.stringify({ error: 'Discord account not linked' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const isKofiMember = await verifyKofiMembership(
      account.access_token,
      env.DISCORD_GUILD_ID,
      env.DISCORD_KOFI_ROLE_ID
    );

    await db
      .updateTable('user')
      .set({
        is_kofi_member: isKofiMember ? 1 : 0,
        last_role_check: Date.now(),
        updated_at: Date.now(),
      })
      .where('id', '=', session.user.id)
      .execute();

    return new Response(JSON.stringify({
      success: true,
      isKofiMember,
      message: isKofiMember ? 'You have access to video memes!' : 'You are not currently a Ko-fi member',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error refreshing subscription:', error);
    return new Response(JSON.stringify({ error: 'Failed to check membership' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
