import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen';
import { type FetcherWithComponents } from '@remix-run/react';
import { useEffect } from 'react';
import { useAside } from '~/components/Aside';

import { Button } from '~/components/Button';

export function AddToCartButton({
  children,
  lines,
  className = '',
  variant = 'primary',
  width = 'full',
  disabled,
  ...props
}: {
  children: React.ReactNode;
  lines: Array<OptimisticCartLineInput>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'inline';
  width?: 'auto' | 'full';
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <CartForm
      route="/cart"
      inputs={{
        lines,
        ...(props.redirectTo && { redirectTo: props.redirectTo }),
      }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const { open } = useAside();

        // Handle client-side redirect for Buy Now
        useEffect(() => {
          if (fetcher.state === 'idle' && fetcher.data) {
            if (fetcher.data.checkoutUrl) {
              window.location.href = fetcher.data.checkoutUrl;
            } else if (!props.redirectTo) {
              // Open cart drawer if not redirecting (Standard Add to Cart)
              open('cart');
            }
          }
        }, [fetcher.state, fetcher.data, props.redirectTo, open]);

        return (
          <>
            {props.redirectTo && (
              <input type="hidden" name="redirectTo" value={props.redirectTo} />
            )}
            <Button
              as="button"
              type="submit"
              width={width}
              variant={variant}
              className={className}
              disabled={disabled ?? fetcher.state !== 'idle'}
              {...props}
            >
              {children}
            </Button>
          </>
        );
      }}
    </CartForm>
  );
}
