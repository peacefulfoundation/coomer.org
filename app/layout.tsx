import { siteConfig } from '@/config/site';

import { Metadata, Viewport } from 'next';

import { fontMono, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  generator: 'Next.js',

  title: {
    default: siteConfig.title,
    template: `%s - ${siteConfig.title}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  keywords: siteConfig.keywords,

  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },

  openGraph: {
    url: siteConfig.url,
    type: 'website',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
      },
    ],
  },

  twitter: {
    card: 'summary',
    images: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#576d00' },
    { media: '(prefers-color-scheme: dark)', color: '#576d00' },
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
            <div className="mx-4 flex-1 py-8 md:container md:mx-0 md:py-0">
              {children}
            </div>
            <SiteFooter />
            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
