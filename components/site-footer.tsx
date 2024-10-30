import { siteConfig } from '@/config/site';

import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="center flex h-20 w-full items-center justify-between px-4 md:container">
      <div className="text-md flex space-x-2 font-semibold">
        {siteConfig.footerLinks.left.map((item, index) => (
          <Link
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
      </div>
      <div className="text-md flex space-x-2 font-semibold">
        {siteConfig.footerLinks.right.map((item, index) => (
          <Link
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </footer>
  );
}
