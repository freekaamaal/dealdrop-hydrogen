import { Link } from '@remix-run/react';
import { flattenConnection, Money } from '@shopify/hydrogen';
import { TrendingDown, Clock } from 'lucide-react';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';

import { Badge } from '~/components/ui/badge';
import type { ProductCardFragment } from 'storefrontapi.generated';
import { isDiscounted } from '~/lib/utils';
import { getProductPlaceholder } from '~/lib/placeholders';

product,
  loading,
  className,
  onClick,
}: {
  product: ProductCardFragment;
  loading ?: HTMLImageElement['loading'];
  className ?: string;
  onClick ?: () => void;
}) {
  const cardProduct = product?.variants ? product : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];
  if (!firstVariant) return null;

  const { image, price, compareAtPrice } = firstVariant;
  const title = product.title;
  const description = product.description || '';

  // Calculate discount logic
  const mrp = compareAtPrice ? parseFloat(compareAtPrice.amount) : 0;
  const dealPrice = parseFloat(price.amount);
  const discount =
    mrp > dealPrice ? Math.round(((mrp - dealPrice) / mrp) * 100) : 0;

  // Status logic (simplified for now, can be enhanced with tags/inventory)
  const isSoldOut = !firstVariant.availableForSale;
  const status = isSoldOut ? 'sold-out' : 'live';

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-primary text-primary-foreground animate-pulse-soft">
            <span className="w-2 h-2 bg-primary-foreground rounded-full mr-2 animate-pulse" />
            LIVE
          </Badge>
        );
      case 'sold-out':
        return <Badge variant="destructive">Sold Out</Badge>;
      default:
        return null; // Handle other statuses if needed
    }
  };

  return (
    <Link to={`/products/${product.handle}`} prefetch="intent" onClick={onClick}>
      <div
        className={`
        group relative card-premium rounded-3xl overflow-hidden
        hover:scale-[1.02] smooth-transition
        ${status === 'sold-out' ? 'opacity-70' : ''}
        ${className || ''}
      `}
      >
        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-secondary relative">
          {image && (
            <img
              src={image.url}
              alt={image.altText || title}
              className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
              loading={loading}
            />
          )}
          {!image && (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4">{getStatusBadge()}</div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4">
              <div className="gradient-rose text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                {discount}%
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-display font-bold text-lg line-clamp-2 group-hover:text-primary smooth-transition">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="flex items-baseline gap-3 pt-2">
            {compareAtPrice && (
              <Money
                data={compareAtPrice}
                className="text-sm text-muted-foreground line-through"
              />
            )}
            <Money
              data={price}
              className="text-2xl font-display font-bold text-foreground"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
