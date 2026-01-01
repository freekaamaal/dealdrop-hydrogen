import {useRef, Suspense, useState} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import {
  getSeoMeta,
  Money,
  ShopPayButton,
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  getProductOptions,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';

import type {ProductFragment} from 'storefrontapi.generated';
import {Heading, Section, Text} from '~/components/Text';
import {Link} from '~/components/Link';
import {Button} from '~/components/Button';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Skeleton} from '~/components/Skeleton';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {ProductGallery} from '~/components/ProductGallery';
import {IconCaret, IconCheck, IconClose} from '~/components/Icon';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import type {Storefront} from '~/lib/type';
import {routeHeaders} from '~/data/cache';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {StickyBuyBar} from '~/components/StickyBuyBar';
import {DealTerms} from '~/components/DealTerms';
import {Badge} from '~/components/ui/badge';
import PriceDisplay from '~/components/PriceDisplay';
import CountdownTimer from '~/components/CountdownTimer';
import StockBar from '~/components/StockBar';
import {useAside} from '~/components/Aside';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {productHandle} = args.params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({
  params,
  request,
  context,
}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const [{shop, product}] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const selectedVariant = product.selectedOrFirstAvailableVariant ?? {};
  const variants = getAdjacentAndFirstAvailableVariants(product);

  const seo = seoPayload.product({
    product: {...product, variants},
    selectedVariant,
    url: request.url,
  });

  return {
    product,
    variants,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    seo,
  };
}

function loadDeferredData(args: LoaderFunctionArgs) {
  return {};
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Product() {
  const {product, shop, recommended, variants, storeDomain} =
    useLoaderData<typeof loader>();
  const {media, title, vendor, descriptionHtml} = product;

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {open} = useAside();

  // Demo data for visual matching since these aren't in standard Shopify product
  const [dealEndTime] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    return tomorrow;
  });

  const features = [
    'Active Noise Cancellation (ANC) technology',
    '30-hour battery life with quick charging',
    'Premium memory foam ear cushions',
    'Bluetooth 5.0 with multipoint connection',
    'Built-in microphone for crystal clear calls',
    'Foldable design with carrying case included',
  ];

  if (!selectedVariant?.price) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Product Images */}
            <div className="space-y-4 animate-scale-in">
              <div className="rounded-3xl overflow-hidden card-premium bg-card p-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Main Image */}
                <div className="relative z-10 aspect-square flex items-center justify-center">
                  {selectedVariant.image?.url ? (
                    <img
                      src={selectedVariant.image.url}
                      alt={selectedVariant.image.altText || title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>

                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Flash Deal
                  </span>
                </div>
              </div>

              {/* Thumbnails (using media nodes) */}
              <div className="grid grid-cols-4 gap-4">
                {media.nodes.slice(0, 4).map((med, i) => (
                  <div
                    key={med.id || i}
                    className="aspect-square rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-primary smooth-transition relative"
                  >
                    <img
                      src={med.image?.url}
                      alt={med.alt || `View ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Product Info */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">
                  Featured Deal
                </Badge>
                <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
                  {title}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    (2,847 reviews)
                  </span>
                </div>

                <div className="text-lg text-muted-foreground leading-relaxed font-light">
                  {getExcerpt(title)} - Experience studio-quality sound with our
                  premium wireless headphones. Featuring advanced active noise
                  cancellation, 30-hour battery life, and ultra-comfortable
                  design for all-day wear.
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-6">
                <PriceDisplay
                  mrp={parseFloat(
                    selectedVariant?.compareAtPrice?.amount ||
                      parseFloat(selectedVariant?.price?.amount) * 1.5,
                  )}
                  dealPrice={parseFloat(selectedVariant?.price?.amount)}
                  size="large"
                />

                <CountdownTimer targetDate={dealEndTime} />

                <StockBar remaining={23} total={100} />
              </div>

              {/* Variants / Options */}
              <div className="space-y-4">
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                  storeDomain={storeDomain}
                />
              </div>

              {/* Key Features */}
              <div className="bg-muted/30 rounded-2xl p-6 space-y-4 border border-border/50">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <IconCheck className="text-primary h-5 w-5" />
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: IconShield,
                    title: '1 Year Warranty',
                    sub: 'Full coverage',
                  },
                  {icon: IconTruck, title: 'Free Shipping', sub: 'All India'},
                  {
                    icon: IconRotateCcw,
                    title: '7-Day Returns',
                    sub: 'Easy process',
                  },
                  {
                    icon: IconCheckCircle,
                    title: 'Verified Seller',
                    sub: 'Trusted',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors group"
                  >
                    <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Long Description Section */}
          <div className="mt-16 md:mt-24">
            <div className="bg-card rounded-3xl p-8 md:p-12 border border-border animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />

              <h2 className="text-3xl font-display font-bold mb-8 relative z-10">
                Product Description
              </h2>
              <div className="prose prose-lg prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
                {descriptionHtml ? (
                  <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
                ) : (
                  <p>No description available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StickyBuyBar product={product} selectedVariant={selectedVariant} />

      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <ProductSwimlane title="Related Drops" products={products} />
          )}
        </Await>
      </Suspense>
    </>
  );
}

// Icons specific to this page
function IconStar({className}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconShield({className}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
function IconTruck({className}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v7" />
      <path d="M22 13h-2a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" />
      <path d="M5 18a2 2 0 0 1-2-2v-4" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function IconRotateCcw({className}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
function IconCheckCircle({className}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ... (ProductForm and other helper functions remain same, just stripped for verify tool size if needed, but I'll include them if simple) ...
// Actually to save context space and since I'm overwriting, I must include ProductForm and helpers.

export function ProductForm({
  productOptions,
  selectedVariant,
  storeDomain,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  storeDomain: string;
}) {
  const isOutOfStock = !selectedVariant?.availableForSale;

  return (
    <div className="grid gap-4">
      {productOptions.map((option, optionIndex) => (
        <div key={option.name} className="flex flex-col">
          <h4 className="font-bold mb-2 text-sm">{option.name}</h4>
          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((value) => (
              <Link
                key={value.name}
                to={`/products/${value.handle}?${value.variantUriQuery}`}
                preventScrollReset
                replace
                className={clsx(
                  'px-4 py-2 border rounded text-sm font-medium transition-all',
                  value.selected
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-gray-200 hover:border-gray-300',
                )}
              >
                {value.name}
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="grid gap-2 mt-4">
        <AddToCartButton
          lines={[{merchandiseId: selectedVariant?.id!, quantity: 1}]}
          variant="primary"
          className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded text-lg shadow-md transition-transform transform active:scale-95"
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Sold Out' : 'Get This Deal Now'}
        </AddToCartButton>

        <ShopPayButton
          width="100%"
          variantIds={[selectedVariant?.id!]}
          storeDomain={storeDomain}
        />
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    media(first: 7) {
      nodes {
        ...Media
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
