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
      <a
        href="/"
        className="hidden p-2 text-2xl font-bold transition-colors duration-200 hover:text-foreground/80 md:block"
      >
        {siteConfig.title}
      </a>
      <div className="flex items-center space-x-2 font-semibold">
        {siteConfig.headerLinks.map((item, index) => (
          <Link
            key={index}
            className="p-2 underline-offset-4 hover:underline"
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
        <Link href="https://discord.com/invite/pFvDZms3AY">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 127.14 96.36"
            className="size-8 transition-transform duration-200 hover:scale-110 md:ml-2"
          >
            <path
              fill="#5865f2"
              d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
