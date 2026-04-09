import { useInView } from 'react-intersection-observer';

import { useEffect, useState } from 'react';

import { Post } from '@/components/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PostData {
  id: string;
  imageUrl: string;
}

interface FetchResponse {
  posts: PostData[];
  cursor: string | null;
}

interface PostListProps {
  workerUrl: string;
}

export default function PostList({ workerUrl }: PostListProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    const storedCursor = localStorage.getItem('lastCursor');
    if (storedCursor) {
      setCursor(storedCursor);
    }
  }, []);

  const fetchPosts = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${workerUrl}/`);
      url.searchParams.append('limit', '3');
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        if (response.status === 404) {
          setHasMore(false);
          return;
        }
        throw new Error('Failed to fetch posts');
      }
      const data: FetchResponse = await response.json();

      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setCursor(data.cursor);
      if (data.cursor) {
        localStorage.setItem('lastCursor', data.cursor);
      }
      setHasMore(!!data.cursor);
    } catch (err) {
      setError('An error occurred while fetching posts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore) {
      fetchPosts();
    }
  }, [inView, hasMore]);

  return (
    <div className="mx-auto w-full max-w-screen-sm space-y-6 py-12">
      <h1 className="mb-4 text-3xl font-branding">begin the scrooooooling!!!</h1>
      <div className="flex grow space-x-3">
        <Button variant="secondary" asChild>
          <a href="https://coomer.org">coomer</a>
        </Button>
        <Button variant="secondary" asChild>
          <a href="https://coomer.org">more memes</a>
        </Button>
        <Button variant="secondary" disabled>
          webm or gif
        </Button>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <Post key={post.id} imageUrl={post.imageUrl} caption={post.id} />
        ))}
      </div>
      {loading && (
        <div className="mt-4 space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="w-full">
              <CardContent className="p-0">
                <Skeleton  className="h-72 w-full" />
                <div className="flex justify-center">
                  <Skeleton className="my-4 h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {hasMore && <div ref={ref} className="mt-4 h-10" />}
      {!hasMore && (
        <p className="mt-4 text-center text-muted-foreground">
          You've reached the end. The edging is complete!
        </p>
      )}
    </div>
  );
}