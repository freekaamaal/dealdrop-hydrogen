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
  rawButton,
  ...props
}: {
  children: React.ReactNode;
  lines: Array<OptimisticCartLineInput>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'inline';
  width?: 'auto' | 'full';
  disabled?: boolean;
  rawButton?: boolean;
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

        useEffect(() => {
          if (fetcher.state === 'idle' && fetcher.data) {
            if (fetcher.data.checkoutUrl) {
              window.location.href = fetcher.data.checkoutUrl;
            } else if (!props.redirectTo) {
              open('cart');
            }
          }
        }, [fetcher.state, fetcher.data, props.redirectTo, open]);

        return (
          <>
            {props.redirectTo && (
              <input type="hidden" name="redirectTo" value={props.redirectTo} />
            )}
            {rawButton ? (
              <button
                type="submit"
                className={className}
                style={props.style}
                disabled={disabled ?? fetcher.state !== 'idle'}
              >
                {children}
              </button>
            ) : (
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
            )}
          </>
        );
      }}
    </CartForm>
  );
}
