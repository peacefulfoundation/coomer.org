import type { APIRoute } from 'astro';
import { eq, and, gt } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { createIntentExpiresAt } from '@/lib/donations';

// POST: Create a donation intent (user wants to donate to a specific post)
export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  const db = createDb(env.DB);

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Please log in with Discord first' }), {
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

  const { postId } = body;

  if (!postId || typeof postId !== 'string') {
    return new Response(JSON.stringify({ error: 'Post ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check for existing unexpired intent for this post
  const existingIntent = await db.query.donationIntent.findFirst({
    where: and(
      eq(schema.donationIntent.userId, session.user.id),
      eq(schema.donationIntent.postId, postId),
      eq(schema.donationIntent.completed, false),
      gt(schema.donationIntent.expiresAt, new Date())
    ),
  });

  if (existingIntent) {
    return new Response(JSON.stringify({
      intentId: existingIntent.id,
      expiresAt: existingIntent.expiresAt.toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create new intent
  const intentId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = createIntentExpiresAt();

  await db.insert(schema.donationIntent).values({
    id: intentId,
    userId: session.user.id,
    postId,
    createdAt: now,
    expiresAt,
    completed: false,
  });

  return new Response(JSON.stringify({
    intentId,
    expiresAt: expiresAt.toISOString(),
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};

// GET: Get the user's current active intent
export const GET: APIRoute = async (context) => {
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

  const url = new URL(context.request.url);
  const postId = url.searchParams.get('postId');

  // Get active intents for this user
  const intents = await db.query.donationIntent.findMany({
    where: and(
      eq(schema.donationIntent.userId, session.user.id),
      eq(schema.donationIntent.completed, false),
      gt(schema.donationIntent.expiresAt, new Date()),
      postId ? eq(schema.donationIntent.postId, postId) : undefined
    ),
  });

  return new Response(JSON.stringify({ intents }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
