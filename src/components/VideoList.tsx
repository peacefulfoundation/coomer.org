import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { VideoPost } from '@/components/VideoPost';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoData {
  id: string;
  playbackId: string;
  title: string;
  thumbnailUrl: string;
  signedUrl: string;
  duration: number;
}

interface FetchResponse {
  videos: VideoData[];
  cursor: string | null;
}

export function VideoList() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
  });

  const fetchVideos = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/videos', window.location.origin);
      url.searchParams.append('limit', '6');
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view video memes');
        }
        if (response.status === 403) {
          throw new Error('Ko-fi membership required');
        }
        throw new Error('Failed to fetch videos');
      }
      
      const data: FetchResponse = await response.json();

      setVideos((prevVideos) => [...prevVideos, ...data.videos]);
      setCursor(data.cursor);
      setHasMore(!!data.cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore) {
      fetchVideos();
    }
  }, [inView, hasMore]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <VideoPost
          key={video.id}
          id={video.id}
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          signedUrl={video.signedUrl}
          duration={video.duration}
        />
      ))}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="w-full">
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full" />
                <div className="flex justify-center">
                  <Skeleton className="my-4 h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {hasMore && <div ref={ref} className="h-10" />}
      {!hasMore && videos.length > 0 && (
        <p className="text-center text-muted-foreground">
          That's all the video memes for now!
        </p>
      )}
    </div>
  );
}
