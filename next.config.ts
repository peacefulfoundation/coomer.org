import { runtimeEnv } from '@/config/env';

import type { NextConfig } from 'next';

const cdnUrl = new URL(runtimeEnv.CDN_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: cdnUrl.hostname,
      },
    ],
  },
};

export default nextConfig;
