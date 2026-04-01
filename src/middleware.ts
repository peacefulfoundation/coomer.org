import { defineMiddleware } from 'astro:middleware';
import { eq } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { verifyKofiMembership } from '@/lib/discord';

export const onRequest = defineMiddleware(async (context, next) => {
  const env = context.locals.runtime.env;
  
  if (!env) {
    return next();
  }

  const auth = createAuth(env);

  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (session?.user) {
      const db = createDb(env.DB);
      
      const user = await db.query.user.findFirst({
        where: eq(schema.user.id, session.user.id),
      });

      if (user) {
        const shouldCheckRoles =
          !user.lastRoleCheck ||
          Date.now() - user.lastRoleCheck.getTime() > 24 * 60 * 60 * 1000;

        if (shouldCheckRoles) {
          const account = await db.query.account.findFirst({
            where: eq(schema.account.userId, session.user.id),
          });

          if (account?.accessToken) {
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

              context.locals.user = { ...user, isKofiMember };
            } catch (error) {
              console.error('Error checking roles in middleware:', error);
              context.locals.user = user;
            }
          } else {
            context.locals.user = user;
          }
        } else {
          context.locals.user = user;
        }
      }

      context.locals.session = session.session;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
