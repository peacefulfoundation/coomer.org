import { runtimeEnv } from '@/config/env';

import type { NextConfig } from 'next';

const workerURL = new URL(runtimeEnv.WORKER_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: workerURL.hostname,
      },
    ],
  },
};

export default nextConfig;
