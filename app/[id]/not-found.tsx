import { MoveLeft } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto p-4 pt-12 text-center">
      <h2 className="mb-4 text-2xl font-bold">we couldn't find that post.</h2>
      <p className="mb-6 text-muted-foreground">
        you might be really ahead of the curve looking for that meme,
        <br />
        because we haven't even made it yet.
      </p>
      <Button className="rounded-full" asChild>
        <Link href="/">
          <MoveLeft className="mr-2 size-5" />
          back to the grind
        </Link>
      </Button>
    </div>
  );
}
