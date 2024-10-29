import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.40))] w-full items-center justify-center py-8 md:py-0">
      <div className="grid grid-flow-row items-center gap-4 md:grid-flow-col">
        <div className="col-span-1 flex aspect-square items-center justify-center p-8">
          <img src="/favicon.png" className="size-56" />
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
              href="https://memes.coomer.org"
              className="w-fit items-center rounded-full border-[1.5px] border-black px-4 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-black hover:text-white"
            >
              more memes
            </a>
            <a
              href="https://discord.com/invite/pFvDZms3AY"
              className="w-fit items-center rounded-full px-4 py-1.5 font-semibold underline underline-offset-2 transition-colors duration-200 ease-in-out hover:bg-violet-700 hover:text-white hover:no-underline"
            >
              join our discord
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}