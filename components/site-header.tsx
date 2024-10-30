import { siteConfig } from '@/config/site';

import Image from 'next/image';
import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="flex h-20 w-full items-center justify-between px-4 md:container">
      <Image
        src="/favicon.png"
        height={32}
        width={32}
        alt={siteConfig.title}
        className="block rounded-full md:hidden"
      />
      <h1 className="hidden p-2 text-2xl font-bold md:block">
        {siteConfig.title}
      </h1>
      <div className="flex space-x-2 font-semibold">
        {siteConfig.headerLinks.map((item, index) => (
          <Link
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </header>
  );
}
