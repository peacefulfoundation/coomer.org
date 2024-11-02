export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="prose lg:prose-lg prose-neutral mx-auto max-w-screen-sm md:py-24">
      {children}
    </article>
  );
}
