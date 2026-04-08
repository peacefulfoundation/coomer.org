export interface ImagePost {
  id: string;
  imageUrl: string;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const POST_KEY_PREFIX = 'coomer-';
const POST_KEY_SUFFIX = '.png';

function normalizeLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function extractPostNumber(value: string): string | null {
  const match = value.match(/\d+/);
  if (!match) {
    return null;
  }

  return match[0].padStart(4, '0');
}

function buildImageUrl(requestUrl: URL, key: string): string {
  const imageUrl = new URL('/api/posts/image', requestUrl);
  imageUrl.searchParams.set('key', key);
  return imageUrl.toString();
}

function mapObjectKeyToPost(key: string, requestUrl: URL): ImagePost {
  const postNumber = extractPostNumber(key) ?? '0000';

  return {
    id: `coomer #${postNumber}`,
    imageUrl: buildImageUrl(requestUrl, key),
  };
}

export function getPostKeyFromId(id: string): string | null {
  const postNumber = extractPostNumber(id);
  if (!postNumber) {
    return null;
  }

  return `${POST_KEY_PREFIX}${postNumber}${POST_KEY_SUFFIX}`;
}

export async function getImagePostById(
  bucket: CloudflareEnv['IMAGES_BUCKET'],
  requestUrl: URL,
  id: string
): Promise<ImagePost | null> {
  const key = getPostKeyFromId(id);
  if (!key) {
    return null;
  }

  const object = await bucket.get(key);
  if (!object) {
    return null;
  }

  return mapObjectKeyToPost(key, requestUrl);
}

export async function listImagePosts(
  bucket: CloudflareEnv['IMAGES_BUCKET'],
  requestUrl: URL,
  limitParam: string | null,
  cursor: string | null
): Promise<{ posts: ImagePost[]; cursor: string | null }> {
  const limit = normalizeLimit(limitParam);
  const response = await bucket.list({
    limit,
    cursor: cursor || undefined,
  });

  return {
    posts: response.objects.map((object: { key: string }) => mapObjectKeyToPost(object.key, requestUrl)),
    cursor: response.truncated ? response.cursor ?? null : null,
  };
}
