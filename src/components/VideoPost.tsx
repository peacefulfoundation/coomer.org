import { PlayCircleIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface VideoPostProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  signedUrl: string;
  duration: number;
}

export function VideoPost({ id, title, thumbnailUrl, signedUrl, duration }: VideoPostProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    videoRef.current?.play();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative w-full">
          {!isPlaying ? (
            <div
              className="relative aspect-video w-full cursor-pointer"
              onClick={handlePlay}
            >
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40">
                <PlayCircleIcon className="h-16 w-16 text-white" />
              </div>
              <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {formatDuration(duration)}
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full">
              <video
                ref={videoRef}
                src={signedUrl}
                controls
                autoPlay
                className="h-full w-full"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
