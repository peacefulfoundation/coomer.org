import { runtimeEnv } from '@/config/env';
import createMDX from '@next/mdx';

import type { NextConfig } from 'next';

const cdnUrl = new URL(runtimeEnv.CDN_URL);

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: cdnUrl.hostname,
      },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
