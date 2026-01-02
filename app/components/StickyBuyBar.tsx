import { Money } from '@shopify/hydrogen';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useAside } from '~/components/Aside';
import { AddToCartButton } from '~/components/AddToCartButton';

export function StickyBuyBar({ product, selectedVariant }) {
  const [isVisible, setIsVisible] = useState(false);
  const { open } = useAside();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || !selectedVariant?.price) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border lg:hidden z-40 backdrop-blur-sm bg-opacity-95 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <Money
              data={selectedVariant.price}
              className="text-lg font-bold text-primary font-display"
            />
            {selectedVariant.compareAtPrice && (
              <Money
                data={selectedVariant.compareAtPrice}
                className="text-sm text-muted-foreground line-through"
              />
            )}
          </div>
          <p className="text-xs text-green-500 font-medium">
            Save{' '}
            {(
              parseFloat(selectedVariant?.compareAtPrice?.amount || '0') -
              parseFloat(selectedVariant?.price?.amount || '0')
            ).toFixed(0)}
            %
          </p>
        </div>
        <AddToCartButton
          lines={[{ merchandiseId: selectedVariant?.id, quantity: 1 }]}
          redirectTo="/checkout"
          variant="primary"
          className="flex-1 gradient-urgency hover:opacity-90 text-primary-foreground font-bold h-12 rounded-xl button-glow smooth-transition active:scale-95 flex items-center justify-center"
        >
          <Zap className="mr-2 h-4 w-4 inline-block" />
          Buy Now
        </AddToCartButton>
      </div>
    </div>
  );
}
