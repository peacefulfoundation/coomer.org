import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('imageUrl');
  const filename = searchParams.get('filename');

  if (!imageUrl || !filename) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      const responseText = await imageResponse.text();
      return NextResponse.json(
        {
          error: `Failed to fetch image: ${imageResponse.statusText}`,
          details: responseText,
        },
        { status: imageResponse.status }
      );
    }

    const contentType =
      imageResponse.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await imageResponse.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Download error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
