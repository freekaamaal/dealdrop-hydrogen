import { Image, Money } from '@shopify/hydrogen';
import type { Product } from '@shopify/hydrogen/storefront-api-types';
import { useEffect, useState } from 'react';

export function DropHero({ product }: { product: Product }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 32,
    seconds: 12,
  });

  // Mock Product Data for Fallback
  const MOCK_PRODUCT = {
    title: 'Replica Off-White x Jordan 1',
    description:
      'The ultimate sneaker collaboration. These verified authentic replicas bring you the Virgil Abloh design language at an accessible price point. Limited stock available.',
    handle: 'replica-off-white-virgil-abloh-jordan-1',
    priceRange: { minVariantPrice: { amount: '190.00', currencyCode: 'USD' } },
    compareAtPriceRange: {
      minVariantPrice: { amount: '1500.00', currencyCode: 'USD' },
    },
    featuredImage: { url: '/assets/hero-deal.jpg' },
  };

  const activeProduct = product || MOCK_PRODUCT;

  useEffect(() => {
    // Set deadline to midnight tonight for "Daily Drop" feel
    const now = new Date();
    const tonight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );
    // If passed midnight (unlikely in this logic but good safety), add 24h
    if (now > tonight) {
      tonight.setDate(tonight.getDate() + 1);
    }

    const interval = setInterval(() => {
      const currentTime = new Date();
      const difference = tonight.getTime() - currentTime.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-12 md:py-16 bg-background overflow-hidden">
      {/* Background Glow Effect - Made subtle and warm */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Hero Content */}
        <div className="flex flex-col items-start space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            {/* Status Tags */}
            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-wider uppercase bg-accent text-accent-foreground rounded-full shadow-lg shadow-accent/20">
              Live Now
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-medium leading-[1.1] text-foreground">
            Today's Drop: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-urgency-red font-bold">
              {activeProduct.title}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground font-sans leading-relaxed max-w-lg">
            {activeProduct.description}
          </p>

          <div className="flex items-end gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Current Price</span>
              <Money
                data={activeProduct.priceRange.minVariantPrice}
                className="text-5xl font-bold font-display text-primary"
              />
            </div>
            {activeProduct.compareAtPriceRange?.minVariantPrice && (
              <div className="flex flex-col pb-2">
                <span className="text-sm text-muted-foreground mb-1">Original</span>
                <Money
                  data={activeProduct.compareAtPriceRange.minVariantPrice}
                  className="text-2xl text-muted-foreground line-through font-display"
                />
              </div>
            )}
            <span className="mb-4 px-3 py-1 text-sm font-bold text-accent bg-accent/10 border border-accent/20 rounded-lg">
              SAVE 75%
            </span>
          </div>

          {/* Timer */}
          <div className="p-4 rounded-xl bg-card border border-border/50 backdrop-blur-sm shadow-xl inline-flex flex-col gap-2 min-w-[300px]">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
              Offer Ends In
            </span>
            <div className="flex items-center gap-4 text-3xl font-mono text-accent font-bold tabular-nums">
              <div>
                {String(timeLeft.hours).padStart(2, '0')}
                <span className="text-xs text-muted-foreground block font-sans font-normal mt-1">
                  Hrs
                </span>
              </div>
              <span>:</span>
              <div>
                {String(timeLeft.minutes).padStart(2, '0')}
                <span className="text-xs text-muted-foreground block font-sans font-normal mt-1">
                  Mins
                </span>
              </div>
              <span>:</span>
              <div>
                {String(timeLeft.seconds).padStart(2, '0')}
                <span className="text-xs text-muted-foreground block font-sans font-normal mt-1">
                  Secs
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <a
              href={`/products/${activeProduct.handle}`}
              className="flex-1 sm:flex-none sm:w-auto px-10 py-4 text-lg font-bold text-white gradient-cta hover:scale-105 transition-transform duration-300 rounded-xl text-center shadow-[0_10px_30px_-10px_rgba(238,99,74,0.5)] flex items-center justify-center gap-2"
            >
              Secure This Deal
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
            {activeProduct.featuredImage ? (
              <Image
                data={activeProduct.featuredImage}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(min-width: 45em) 50vw, 100vw"
              />
            ) : (
              <img
                src="/assets/hero-deal.jpg"
                alt="Deal of the Day"
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            )}

            {/* Floating Badge */}
            <div className="absolute bottom-6 right-6">
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-bold text-sm">
                  24 people viewing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
