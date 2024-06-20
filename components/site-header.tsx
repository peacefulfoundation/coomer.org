'use client';

import { siteConfig } from '@/config/site';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="center container flex h-20 w-full items-center justify-between">
      <h1 className="block p-2 text-2xl font-bold">{siteConfig.name}</h1>
      <div className="flex space-x-2">
        {siteConfig.headerLinks?.map((item, index) => (
          <Button key={index} variant="link" className="font-semibold" asChild>
            <Link href={item.url}>{item.name}</Link>
          </Button>
        ))}
      </div>
    </header>
  );
}
