import Mux from '@mux/mux-node';

export interface MuxAsset {
  id: string;
  playbackId: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
}

export function createMuxClient(tokenId: string, tokenSecret: string) {
  return new Mux({
    tokenId,
    tokenSecret,
  });
}

export async function listVideoAssets(
  mux: Mux,
  limit: number = 10,
  cursor?: string
): Promise<{ assets: MuxAsset[]; nextCursor: string | null }> {
  const params: { limit: number; page?: number } = { limit };
  
  if (cursor) {
    params.page = parseInt(cursor, 10);
  }

  const response = await mux.video.assets.list(params);
  
  const assets: MuxAsset[] = response.data
    .filter((asset) => asset.status === 'ready' && asset.playback_ids?.length)
    .map((asset) => {
      const playbackId = asset.playback_ids![0].id;
      return {
        id: asset.id,
        playbackId,
        title: (asset.passthrough as string) || asset.id,
        thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.webp`,
        duration: asset.duration || 0,
        createdAt: asset.created_at || new Date().toISOString(),
      };
    });

  const currentPage = cursor ? parseInt(cursor, 10) : 1;
  const nextCursor = assets.length === limit ? String(currentPage + 1) : null;

  return { assets, nextCursor };
}

export async function generateSignedPlaybackToken(
  playbackId: string,
  signingKeyId: string,
  signingKeyPrivate: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: signingKeyId,
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: playbackId,
    aud: 'v',
    exp: now + expiresInSeconds,
    kid: signingKeyId,
  };

  const base64UrlEncode = (obj: object): string => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;
  
  const privateKeyPem = signingKeyPrivate.includes('-----BEGIN')
    ? signingKeyPrivate
    : `-----BEGIN RSA PRIVATE KEY-----\n${signingKeyPrivate}\n-----END RSA PRIVATE KEY-----`;

  const signature = await signWithRSA(signatureInput, privateKeyPem);
  
  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

async function signWithRSA(input: string, privateKeyPem: string): Promise<string> {
  const pemContents = privateKeyPem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, data);
  
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return signatureBase64;
}

export async function getSignedPlaybackUrl(
  playbackId: string,
  signingKeyId: string,
  signingKeyPrivate: string
): Promise<string> {
  const token = await generateSignedPlaybackToken(
    playbackId,
    signingKeyId,
    signingKeyPrivate
  );
  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
}
