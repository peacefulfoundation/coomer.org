import { siteConfig } from '@/config/site';

export function SiteHeader() {
  return (
    <header className="center container flex h-20 w-full items-center justify-between">
      <h1 className="block p-2 text-2xl font-bold">{siteConfig.title}</h1>
      <div className="flex space-x-2 font-semibold">
        {siteConfig.headerLinks.map((item, index) => (
          <a
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </a>
        ))}
      </div>
    </header>
  );
}
