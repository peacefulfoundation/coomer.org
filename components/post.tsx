'use client';

import { Share2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Post({
  caption,
  imageUrl,
}: {
  caption: string;
  imageUrl: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `${caption}.jpg`;
      const response = await fetch(
        `/api/download?imageUrl=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(
          filename
        )}`
      );

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Image downloaded');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
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

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Share2Icon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
