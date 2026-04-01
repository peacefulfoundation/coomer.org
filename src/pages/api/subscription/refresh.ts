import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { verifyKofiMembership } from '@/lib/discord';

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

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

  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (user.lastRoleCheck) {
    const timeSinceLastCheck = Date.now() - user.lastRoleCheck.getTime();
    if (timeSinceLastCheck < COOLDOWN_MS) {
      const remainingMs = COOLDOWN_MS - timeSinceLastCheck;
      const remainingMins = Math.ceil(remainingMs / 60000);
      return new Response(
        JSON.stringify({
          error: `Please wait ${remainingMins} minutes before refreshing again`,
          cooldownRemaining: remainingMs,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  const account = await db.query.account.findFirst({
    where: eq(schema.account.userId, session.user.id),
  });

  if (!account?.accessToken) {
    return new Response(
      JSON.stringify({ error: 'Discord account not linked' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const isKofiMember = await verifyKofiMembership(
      account.accessToken,
      env.DISCORD_GUILD_ID,
      env.DISCORD_KOFI_ROLE_ID
    );

    await db
      .update(schema.user)
      .set({
        isKofiMember,
        lastRoleCheck: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, session.user.id));

    return new Response(
      JSON.stringify({
        success: true,
        isKofiMember,
        message: isKofiMember
          ? 'You have access to video memes!'
          : 'You are not currently a Ko-fi member',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error refreshing subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify membership' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
