import type { APIRoute } from 'astro';


export const GET: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const requestUrl = new URL(context.request.url);
  const key = requestUrl.searchParams.get('key');

  if (!key) {
    return new Response('Missing key', { status: 400 });
  }

  try {
    const object = await env.IMAGES_BUCKET.get(key);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'image/png');
    }

    if (object.httpEtag) {
      headers.set('ETag', object.httpEtag);
    }

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Failed to fetch image from R2:', error);
    return new Response('Failed to fetch image', { status: 500 });
  }
};
