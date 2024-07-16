import type { Links, Site } from '@/types';

export const SITE: Site = {
  TITLE: 'coomer.org',
  DESCRIPTION: 'curated coomer memes',
  AUTHOR: 'anon',
};

export const HEADER_LINKS: Links = [
  {
    TITLE: 'not an nft',
    HREF: '/not-an-nft',
  },
  {
    TITLE: 'ethos',
    HREF: '/ethos',
  },
];

export const FOOTER_LINKS: {
  LEFT: Links;
  RIGHT: Links;
} = {
  LEFT: [],
  RIGHT: [
    {
      TITLE: 'quiteasily',
      HREF: 'https://quiteasily.org/',
    },
    {
      TITLE: 'easypeasy',
      HREF: 'https://easypeasymethod.org/',
    },
  ],
};
