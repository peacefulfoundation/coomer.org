import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselMainContainer,
  CarouselNext,
  CarouselPrevious,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from '@/components/ui/carousel';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.40))] w-full items-center justify-center py-8 md:py-0">
      <div className="flex flex-col items-start justify-center space-y-8 md:flex-row md:space-x-8 md:space-y-0">
        <div>
          <Carousel>
            <CarouselNext className="top-1/3 -translate-y-1/3" />
            <CarouselPrevious className="top-1/3 -translate-y-1/3" />
            <CarouselMainContainer className="h-60">
              {Array.from({ length: 5 }).map((_, index) => (
                <SliderMainItem key={index} className="bg-transparent">
                  <div className="flex size-full items-center justify-center rounded-xl bg-background outline outline-1 outline-border">
                    Slide {index + 1}
                  </div>
                </SliderMainItem>
              ))}
            </CarouselMainContainer>
            <CarouselThumbsContainer>
              {Array.from({ length: 5 }).map((_, index) => (
                <SliderThumbItem
                  key={index}
                  index={index}
                  className="bg-transparent"
                >
                  <div className="flex size-full items-center justify-center rounded-xl bg-background outline outline-1 outline-border">
                    Slide {index + 1}
                  </div>{' '}
                </SliderThumbItem>
              ))}
            </CarouselThumbsContainer>
          </Carousel>
        </div>
        <div className="flex max-w-80 flex-col space-y-2">
          <h2 className="text-2xl font-semibold">Here's my favorite meme.</h2>
          <p className="text-lg font-thin">
            You can browse thousands of coomer memes at the link below.
          </p>
          <br />
          <p className="text-lg font-thin">
            We're using them to fundraise widespread action against pornography.
          </p>
          <p className="text-lg font-thin">
            There's also an ethos discussing ego-escalation.
          </p>
          <br />
          <Button
            variant="outline"
            className="w-fit rounded-full border-[1.5px] border-black font-semibold hover:bg-black hover:text-white"
            asChild
          >
            <Link href="https://memes.coomer.org">more memes</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
