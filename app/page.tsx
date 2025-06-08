'use client';

import { siteConfig } from '@/config/site';

import Link from 'next/link';

import PostList from '@/components/post-list';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.40))] w-full flex-col items-center justify-center space-y-4">
      <div className="mt-10 flex w-full max-w-screen-sm flex-col items-center justify-center">
        <Card className="flex w-full flex-col space-y-5 rounded-2xl border-none bg-[#c9fd8b] p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-2 p-0">
            <h1 className="text-3xl font-bold text-black">not an nft!</h1>
            <Button
              className="bg-white text-black hover:bg-black hover:text-white"
              asChild
            >
              <Link href="https://web3isgoinggreat.com">
                learn more about crypto!!!!!
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="list-inside list-disc">
              <li>crypto and web3 is a scam, do not trust anyone involved.</li>
              <li>the act of sacrificing people and the planet for money.</li>
            </ul>
          </CardContent>
          <CardFooter className="flex items-center justify-end p-0">
            <Link
              href="https://youtu.be/YQ_xWvX1n9g"
              className="font-semibold text-black underline-offset-4 hover:underline"
            >
              click to learn about euthanising grifters and being kind online 😊
              →
            </Link>
          </CardFooter>
        </Card>
      </div>
      <PostList />
    </main>
  );
}
