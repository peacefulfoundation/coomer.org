import { siteConfig } from '@/config/site';

import Image from 'next/image';

import PostList from '@/components/post-list';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.40))] w-full flex-col items-center justify-center space-y-4">
      <div className="grid grid-flow-row items-center gap-4 md:grid-flow-col">
        <div className="col-span-1 flex aspect-square items-center justify-center p-8">
          <Image
            src="/favicon.png"
            width={256}
            height={256}
            alt={siteConfig.title + 'logo'}
            priority
          />
        </div>
        <div className="col-span-1 flex max-w-80 flex-col space-y-2">
          <h2 className="text-2xl font-bold">here's my favorite meme.</h2>
          <p className="text-lg">
            you can browse thousands of coomer memes at the link below.
          </p>
          <br />
          <p className="text-lg">
            we're using them to fundraise widespread action against pornography.
          </p>
          <p className="text-lg">
            there's also an ethos discussing ego-escalation.
          </p>
          <br />

          <div className="flex gap-3">
            <a
              href="https://quiteasily.org"
              className="w-fit items-center rounded-full border-[1.5px] border-black px-4 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-black hover:text-white"
            >
              wanna psyop?
            </a>
            <a
              href="https://discord.com/invite/pFvDZms3AY"
              className="w-fit items-center rounded-full border-[1.5px] border-violet-700 bg-violet-700 px-4 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white hover:text-violet-700"
            >
              join our discord
            </a>
          </div>
        </div>
      </div>
      <div className="pt-10">
        <a
          href="https://easypeasymethod.org"
          className="w-fit items-center rounded-full border-[1.5px] border-black bg-black px-4 py-2.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white hover:text-black"
        >
          wanna quit porn? easypeasymethod.org
        </a>
      </div>
      <PostList />
    </main>
  );
}
