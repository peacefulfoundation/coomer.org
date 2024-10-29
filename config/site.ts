import { NavLink } from '@/types';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  title: 'coomer.org',
  description: 'curated coomer memes',
  author: 'anon',
  headerLinks: [
    {
      title: 'not an nft',
      href: '/not-an-nft',
    },
    {
      title: 'ethos',
      href: '/ethos',
    },
  ] as NavLink[],
  footerLinks: {
    left: [] as NavLink[],
    right: [
      {
        title: 'quiteasily',
        href: 'https://quiteasily.org',
      },
      {
        title: 'easypeasy',
        href: 'https://easypeasy.org',
      },
    ] as NavLink[],
  },
};
