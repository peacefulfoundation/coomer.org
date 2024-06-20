import { siteConfig } from '@/config/site';

import type { Metadata } from 'next';

import { fontMono, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

import SiteFooter from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

import '@/styles/globals.css';

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'relative flex min-h-screen flex-col bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <SiteHeader />
        <div className="container flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
