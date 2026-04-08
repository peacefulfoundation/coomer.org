import type { APIRoute } from 'astro';

import { getImagePostById, listImagePosts } from '@/lib/services/posts';

export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const requestUrl = new URL(context.request.url);
  const id = requestUrl.searchParams.get('id');
  const limit = requestUrl.searchParams.get('limit');
  const cursor = requestUrl.searchParams.get('cursor');

  try {
    if (id) {
      const post = await getImagePostById(env.IMAGES_BUCKET, requestUrl, id);

      if (!post) {
        return new Response(JSON.stringify({ error: 'Post not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ posts: [post] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await listImagePosts(env.IMAGES_BUCKET, requestUrl, limit, cursor);

    if (data.posts.length === 0) {
      return new Response(JSON.stringify({ error: 'No objects found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        posts: data.posts,
        cursor: data.cursor,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to fetch posts from R2:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
