import { allMemes } from 'content-collections';

export const dynamicParams = false;

export function generateStaticParams() {
  return allMemes.map((meme) => ({
    slug: meme._meta.path,
  }));
}

export default function Meme({ params }: { params: { slug: string } }) {
  const meme = allMemes.find((meme) => meme._meta.path === params.slug);

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.40))] w-full items-center justify-center py-8 md:py-0">
      <div className="flex flex-col items-start justify-center space-y-8 md:flex-row md:space-x-8 md:space-y-0">
        <div className="flex size-full items-center justify-center rounded-md border border-muted-foreground">
          Meme {meme?._meta.fileName}
        </div>
        <div className="flex max-w-80 flex-col space-y-2">
          <h2 className="text-2xl font-semibold">{meme?.title}</h2>
          <p className="text-lg font-thin">{meme?.summary}</p>
        </div>
      </div>
    </main>
  );
}
