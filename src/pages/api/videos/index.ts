import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { createDb } from '@/db';
import * as schema from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { createMuxClient, listVideoAssets, getSignedPlaybackUrl } from '@/lib/mux';

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

  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });

  if (!user?.isKofiMember) {
    return new Response(
      JSON.stringify({ error: 'Ko-fi membership required' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const url = new URL(context.request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const cursor = url.searchParams.get('cursor') || undefined;

  try {
    const mux = createMuxClient(env.MUX_TOKEN_ID, env.MUX_TOKEN_SECRET);
    const { assets, nextCursor } = await listVideoAssets(mux, limit, cursor);

    const videosWithSignedUrls = await Promise.all(
      assets.map(async (asset) => ({
        ...asset,
        signedUrl: await getSignedPlaybackUrl(
          asset.playbackId,
          env.MUX_SIGNING_KEY_ID,
          env.MUX_SIGNING_KEY_PRIVATE
        ),
      }))
    );

    return new Response(
      JSON.stringify({
        videos: videosWithSignedUrls,
        cursor: nextCursor,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch videos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
