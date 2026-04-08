import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('imageUrl');
  const filename = url.searchParams.get('filename');

  if (!imageUrl || !filename) {
    return new Response('Missing imageUrl or filename', { status: 400 });
  }

  try {
    const resolvedImageUrl = new URL(imageUrl, request.url);
    const response = await fetch(resolvedImageUrl);

    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const body = response.body;

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download failed', { status: 500 });
  }
};
