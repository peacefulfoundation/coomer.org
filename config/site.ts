import { NavItem } from '@/types';

import { Metadata } from 'next';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  metadata: {
    title: {
      default: "oh gosh i'm gonna...",
      template: '%s | coomer.org',
    },
    icons: {
      icon: '/favicon.png',
    },
    authors: [{ name: 'anon', url: 'https://peacefulfoundation.org/' }],
  } as Metadata,
  name: 'coomer.org',
  description: 'curated coomer memes',
  headerLinks: [
    {
      name: 'not an nft',
      url: '/not-an-nft',
    },
    {
      name: 'ethos',
      url: '/ethos',
    },
  ] as NavItem[],
  footerLinks: {
    left: [] as NavItem[],
    right: [
      {
        name: 'quiteasily',
        url: 'https://quiteasily.org/',
      },
      {
        name: 'easypeasy',
        url: 'https://easypeasymethod.org/',
      },
    ] as NavItem[],
  },
};
