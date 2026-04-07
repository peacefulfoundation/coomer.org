import { defineMiddleware } from 'astro:middleware';

import { createAuth, getSessionUserId } from '@/lib/auth';
import { createDb } from '@/lib/db';

const STATIC_ASSET_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
  '.css',
  '.js',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (
    pathname.startsWith('/_astro/') ||
    STATIC_ASSET_EXTENSIONS.some((extension) => pathname.endsWith(extension))
  ) {
    return next();
  }

  context.locals.user = null;

  
  const env = context.locals.runtime.env;
  const auth = createAuth(env);

  try {
    const session = await auth.api.getSession({ headers: context.request.headers });
    const userId = getSessionUserId(session);

    if (session?.user && userId) {
      const db = createDb(env.DB);
      const user = await db
        .selectFrom('user')
        .selectAll()
        .where('id', '=', userId)
        .executeTakeFirst();

      if (user) {
        context.locals.user = user;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
  }

  return next();
});
