import { siteConfig } from '@/config/site';

import { Metadata, Viewport } from 'next';

import { fontMono, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s - ${siteConfig.title}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            'relative flex min-h-screen flex-col bg-background font-sans antialiased',
            fontSans.variable,
            fontMono.variable
          )}
        >
          <ThemeProvider attribute="class" forcedTheme="light">
            <SiteHeader />
            <div className="container flex-1">{children}</div>
            <SiteFooter />
            <TailwindIndicator />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
