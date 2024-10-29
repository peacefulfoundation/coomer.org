import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="center container flex h-20 w-full items-center justify-between">
      <div className="text-md flex space-x-2 font-semibold">
        {siteConfig.footerLinks.left.map((item, index) => (
          <a
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </a>
        ))}
      </div>
      <div className="text-md flex space-x-2 font-semibold">
        {siteConfig.footerLinks.right.map((item, index) => (
          <a
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </a>
        ))}
      </div>
    </footer>
  );
}
