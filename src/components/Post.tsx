import { Share2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DonateButton } from '@/components/DonateButton';
import { CommentSection } from '@/components/CommentSection';

interface PostProps {
  caption: string;
  imageUrl: string;
  isLoggedIn?: boolean;
  kofiUsername?: string;
  showComments?: boolean;
}

export function Post({ 
  caption, 
  imageUrl, 
  isLoggedIn = false, 
  kofiUsername = 'coomerorg',
  showComments = true,
}: PostProps) {
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative w-full">
          <div className="relative aspect-auto w-full">
            <img
              src={imageUrl}
              alt={caption}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <p className="ml-1 text-left text-sm font-medium text-muted-foreground">
            {caption}
          </p>
          <div className="flex items-center gap-2">
            <DonateButton
              postId={caption}
              isLoggedIn={isLoggedIn}
              kofiUsername={kofiUsername}
            />
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              onClick={handleDownload}
              disabled={isDownloading}
              showLock={false}
            >
              <Share2Icon />
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="px-4 pb-4">
            <CommentSection postId={caption} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
