import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen';
import { type FetcherWithComponents } from '@remix-run/react';
import { useEffect, useRef } from 'react';
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
        const lastDataRef = useRef<any>(null);

        // Show error alert for ₹9 limit violations
        const hasUserError = fetcher.state === 'idle' && fetcher.data?.userErrors?.length > 0;

        useEffect(() => {
          if (fetcher.state === 'idle' && fetcher.data && fetcher.data !== lastDataRef.current) {
            lastDataRef.current = fetcher.data;
            if (fetcher.data.userErrors?.length > 0) {
              // Show the error message (₹9 limit etc.)
              alert(fetcher.data.userErrors[0].message);
            } else if (fetcher.data.checkoutUrl) {
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
