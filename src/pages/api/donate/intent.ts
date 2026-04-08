import type { APIRoute } from 'astro';

import { createAuth, getSessionUserId } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { createIntentExpiresAt } from '@/lib/services/donations';

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

  let body: { postId?: string };
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { postId } = body;

  if (!postId) {
    return new Response(JSON.stringify({ error: 'Post ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const intentId = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = createIntentExpiresAt();

  await db.insertInto('donation_intent').values({
    id: intentId,
    user_id: userId,
    post_id: postId,
    created_at: now,
    expires_at: expiresAt.getTime(),
    completed: 0,
  }).execute();

  return new Response(JSON.stringify({
    intentId,
    expiresAt: expiresAt.toISOString(),
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = async (context) => {
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

  const intents = await db
    .selectFrom('donation_intent')
    .selectAll()
    .where('user_id', '=', userId)
    .where('completed', '=', 0)
    .where('expires_at', '>', Date.now())
    .orderBy('created_at', 'desc')
    .execute();

  return new Response(JSON.stringify({ intents }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
