'use client';

import { Share2Icon } from 'lucide-react';
import { RWebShare } from 'react-web-share';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Post({
  caption,
  imageUrl,
  shareText,
  shareUrl,
  key,
}: {
  caption: string;
  imageUrl: string;
  shareText: string;
  shareUrl: string;
  key?: string;
}) {
  return (
    <Card className="overflow-hidden" key={key}>
      <CardContent className="p-0">
        <div className="relative w-full">
          <div className="relative aspect-auto w-full">
            <Image
              src={imageUrl}
              alt={caption}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 600px"
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <p className="ml-1 text-left text-sm font-medium text-muted-foreground">
            {caption}
          </p>

          <RWebShare
            data={{
              text: shareText,
              url: shareUrl,
            }}
          >
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full text-muted-foreground"
            >
              <Share2Icon />
            </Button>
          </RWebShare>
        </div>
      </CardContent>
    </Card>
  );
}
