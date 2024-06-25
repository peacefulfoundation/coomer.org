import { withContentCollections } from '@content-collections/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
};

export default withContentCollections(nextConfig);
