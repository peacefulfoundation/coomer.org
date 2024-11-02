import Markdown from '@/markdown/ethos.mdx';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ethos',
  description: 'the ethos of the project.',
};

export default function Ethos() {
  return <Markdown />;
}
