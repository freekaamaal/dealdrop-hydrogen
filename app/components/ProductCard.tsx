import { Link } from '@remix-run/react';
import { flattenConnection, Money } from '@shopify/hydrogen';
import { TrendingDown } from 'lucide-react';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';

import { Badge } from '~/components/ui/badge';
import type { ProductCardFragment } from 'storefrontapi.generated';
import { getProductPlaceholder } from '~/lib/placeholders';

export function ProductCard({
  product,
  loading,
  className,
}: {
  product: ProductCardFragment;
  loading?: HTMLImageElement['loading'];
  className?: string;
}) {
  const cardProduct = product?.variants ? product : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];
  if (!firstVariant) return null;

  const { image, price, compareAtPrice } = firstVariant;
  const title = product.title;
  const vendor = product.vendor;

  const mrp = compareAtPrice ? parseFloat(compareAtPrice.amount) : 0;
  const dealPrice = parseFloat(price.amount);
  const discount = mrp > dealPrice ? Math.round(((mrp - dealPrice) / mrp) * 100) : 0;
  const savings = mrp > dealPrice ? mrp - dealPrice : 0;

  const isSoldOut = !firstVariant.availableForSale;

  if (isSoldOut) return null; // Hide sold out products

  return (
    <Link to={`/products/${product.handle}`} prefetch="intent">
      <div
        className={`
        group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100
        hover:shadow-xl hover:scale-[1.02] smooth-transition
        ${className || ''}
      `}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || title}
              className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
              loading={loading}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3">
            <Badge className="bg-green-500 text-white border-0 shadow-md shadow-green-500/30 text-[10px] md:text-xs px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
              LIVE
            </Badge>
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-0.5 shadow-md shadow-red-500/30">
                <TrendingDown className="w-3 h-3" />
                {discount}%
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 md:p-4 space-y-1.5">
          {vendor && (
            <p className="text-[10px] md:text-xs text-primary font-semibold uppercase tracking-wider">
              {vendor}
            </p>
          )}

          <h3 className="font-semibold text-xs md:text-sm line-clamp-2 text-gray-900 group-hover:text-primary smooth-transition leading-snug">
            {title}
          </h3>

          <div className="flex items-baseline gap-2 pt-1">
            {compareAtPrice && mrp > dealPrice && (
              <Money
                data={compareAtPrice}
                className="text-[10px] md:text-xs text-gray-400 line-through"
              />
            )}
            <Money
              data={price}
              className="text-base md:text-lg font-display font-bold text-gray-900"
            />
          </div>

          {savings > 0 && (
            <span className="inline-block bg-green-50 text-green-700 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md">
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
