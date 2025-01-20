'use client';

import { runtimeEnv } from '@/config/env';
import { useInView } from 'react-intersection-observer';

import { useEffect, useState } from 'react';

import { Post } from '@/components/post';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: string;
  imageUrl: string;
}

interface FetchResponse {
  posts: Post[];
  cursor: string | null;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
  });

  const fetchPosts = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${runtimeEnv.WORKER_URL}/`);
      url.searchParams.append('limit', '6');
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
    <div className="mx-auto w-full max-w-screen-sm py-12">
      <h1 className="mb-4 text-xl font-bold">begin the scrooooooling!!!</h1>
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
                <Skeleton className="h-72 w-full" />
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
