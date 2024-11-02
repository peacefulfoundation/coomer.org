import Markdown from '@/markdown/not-an-nft.mdx';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'not an nft',
  description: 'nfts: no frickin thanks',
};

export default function NotAnNFT() {
  return <Markdown />;
}
