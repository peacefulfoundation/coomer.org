import { siteConfig } from '@/config/site';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function SiteFooter() {
  return (
    <footer className="center container flex h-20 w-full items-center justify-between">
      <div className="flex space-x-2 text-sm font-medium">
        {siteConfig.footerLinks.left?.map((item, index) => (
          <Button key={index} variant="link" className="font-medium" asChild>
            <Link href={item.url}>{item.name}</Link>
          </Button>
        ))}
      </div>
      <div className="flex space-x-2 text-sm font-medium">
        {siteConfig.footerLinks.right?.map((item, index) => (
          <Button key={index} variant="link" className="font-semibold" asChild>
            <Link href={item.url}>{item.name}</Link>
          </Button>
        ))}
      </div>
    </footer>
  );
}
