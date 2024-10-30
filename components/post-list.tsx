'use client';

import { runtimeEnv } from '@/config/env';
import { useInView } from 'react-intersection-observer';

import { useEffect, useState } from 'react';

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
      url.searchParams.append('limit', '9');
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
      console.log(err);
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
    <div className="container mx-auto p-4 pt-12">
      <h1 className="mb-4 text-2xl font-bold">More memes? More memes.</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <img
                src={post.imageUrl}
                alt={post.id}
                className="mb-2 h-48 w-full rounded-md object-cover"
                loading="lazy"
              />
              <p className="text-center text-sm font-medium">{post.id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {loading && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-48 w-full" />
                <Skeleton className="mx-auto h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {hasMore && <div ref={ref} className="mt-4 h-10" />}
      {!hasMore && (
        <p className="mt-4 text-center text-gray-500">
          You've reached the end! The edging is complete!
        </p>
      )}
    </div>
  );
}
