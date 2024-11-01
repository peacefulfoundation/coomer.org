import { runtimeEnv } from '@/config/env';
import { siteConfig } from '@/config/site';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Post } from '@/components/post';

interface Post {
  id: string;
  imageUrl: string;
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(`${runtimeEnv.WORKER_URL}/?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch post');
    }
    const data = await response.json();
    return data.posts[0] || null;
  } catch (error) {
    console.error('ERROR | Post fetch: ', error);
    return null;
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.id);

  if (!post) {
    return {
      title: `post not found - ${siteConfig.title}`,
      description: 'the requested post could not be found.',
    };
  }

  return {
    title: `${post.id} - ${siteConfig.title}`,
    openGraph: {
      title: `${post.id} - ${siteConfig.title}`,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.id,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.id} - ${siteConfig.title}`,
      images: [post.imageUrl],
    },
  };
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-screen-sm py-12">
      <Post
        caption={post.id}
        imageUrl={post.imageUrl}
        shareText={`check out this sick coomer meme: `}
        shareUrl={`${siteConfig.url}/${params.id}`}
      />
    </div>
  );
}
