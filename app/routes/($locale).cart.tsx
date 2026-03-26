import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
} from '@shopify/remix-oxygen';
import { CartForm, type CartQueryDataReturn, Analytics } from '@shopify/hydrogen';

import { isLocalPath } from '~/lib/utils';
import { Cart } from '~/components/Cart';

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart, storefront } = context;

  const formData = await request.formData();

  const { action, inputs } = CartForm.getFormInput(formData);
  invariant(action, 'No cartAction defined');

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      // === MARCH MADNESS SALE LIMITS ===
      // All sale products (≤₹299): max 1 qty per product
      // ₹9 products: only 1 ₹9 product allowed in entire cart
      const SALE_PRICE_THRESHOLD = 299;
      const RS9_THRESHOLD = 9;

      const currentCart = await cart.get();
      const incomingLines = inputs.lines as any[];

      let hasIncoming9 = false;
      if (incomingLines?.length) {
        for (const line of incomingLines) {
          try {
            const variantId = line.merchandiseId;
            if (variantId) {
              const { node } = await storefront.query(
                `#graphql
                  query VariantPrice($id: ID!) {
                    node(id: $id) {
                      ... on ProductVariant {
                        price { amount }
                      }
                    }
                  }
                `,
                { variables: { id: variantId } },
              );
              const price = parseFloat((node as any)?.price?.amount || '0');

              // All sale products: force qty to 1
              if (price > 0 && price <= SALE_PRICE_THRESHOLD) {
                line.quantity = 1;
              }

              // Track if it's a ₹9 product
              if (price > 0 && price <= RS9_THRESHOLD) {
                hasIncoming9 = true;
              }
            }
          } catch (e) {
            // If query fails, proceed normally
          }
        }
      }

      // ₹9 rule: only 1 ₹9 product allowed in entire cart
      if (hasIncoming9 && currentCart?.lines?.edges?.length) {
        const existing9 = currentCart.lines.edges.some((edge: any) => {
          const price = parseFloat(edge.node?.merchandise?.price?.amount || '0');
          return price > 0 && price <= RS9_THRESHOLD;
        });
        if (existing9) {
          return json(
            {
              cart: currentCart,
              userErrors: [{message: 'Only 1 ₹9 deal allowed per order. Remove the existing ₹9 product first to add a different one.'}],
              errors: [],
              checkoutUrl: null,
            },
            { status: 400, headers: cart.setCartId(currentCart.id) },
          );
        }
      }

      result = await cart.addLines(incomingLines);
      break;
    }
    case CartForm.ACTIONS.LinesUpdate: {
      // === SALE LIMIT: Block qty increase above 1 for all sale products ===
      const SALE_PRICE_THRESHOLD_UPDATE = 299;
      const updateLines = inputs.lines as any[];
      if (updateLines?.length) {
        const currentCartForUpdate = await cart.get();
        for (const line of updateLines) {
          if (line.quantity > 1 && currentCartForUpdate?.lines?.edges?.length) {
            const cartLine = currentCartForUpdate.lines.edges.find(
              (edge: any) => edge.node.id === line.id,
            );
            if (cartLine) {
              const price = parseFloat(cartLine.node?.merchandise?.price?.amount || '0');
              if (price > 0 && price <= SALE_PRICE_THRESHOLD_UPDATE) {
                line.quantity = 1; // Force back to 1 for all sale products
              }
            }
          }
        }
      }
      result = await cart.updateLines(updateLines);
      break;
    }
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate:
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    default:
      invariant(false, `${action} cart action is not defined`);
  }

  /**
   * The Cart ID may change after each mutation. We need to update it each time in the session.
   */
  const cartId = result.cart.id;
  const headers = cart.setCartId(result.cart.id);

  const redirectTo = formData.get('redirectTo') ?? null;
  let checkoutUrl = null;

  if (redirectTo === '/checkout') {
    // Return the URL for client-side redirection
    checkoutUrl = result.cart.checkoutUrl;
  } else if (typeof redirectTo === 'string' && isLocalPath(redirectTo)) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  const { cart: cartResult, errors, userErrors } = result;

  return json(
    {
      cart: cartResult,
      userErrors,
      errors,
      checkoutUrl,
    },
    { status, headers },
  );
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { cart } = context;
  return json(await cart.get());
}

export default function CartRoute() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <h1>Cart</h1>
      <Cart layout="page" cart={cart} />
      <Analytics.CartView />
    </div>
  );
}
