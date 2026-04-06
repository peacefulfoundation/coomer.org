import { defineMiddleware } from 'astro:middleware';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { verifyKofiMembership } from '@/lib/services/discord';

const ROLE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

export const onRequest = defineMiddleware(async (context, next) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const db = createDb(env.DB);

  try {
    const session = await auth.api.getSession({ headers: context.request.headers });

    if (session?.user) {
      const user = await db
        .selectFrom('user')
        .selectAll()
        .where('id', '=', session.user.id)
        .executeTakeFirst();

      if (user) {
        const shouldCheckRoles =
          !user.last_role_check ||
          Date.now() - user.last_role_check > ROLE_CHECK_INTERVAL;

        if (shouldCheckRoles) {
          const account = await db
            .selectFrom('account')
            .select(['access_token'])
            .where('user_id', '=', session.user.id)
            .where('provider_id', '=', 'discord')
            .executeTakeFirst();

          if (account?.access_token) {
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
                .where('id', '=', user.id)
                .execute();

              context.locals.user = { ...user, is_kofi_member: isKofiMember ? 1 : 0 };
            } catch (error) {
              console.error('Error checking roles:', error);
              context.locals.user = user;
            }
          } else {
            context.locals.user = user;
          }
        } else {
          context.locals.user = user;
        }
      }

      context.locals.session = session.session as any;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch (error) {
    console.error('Middleware error:', error);
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
