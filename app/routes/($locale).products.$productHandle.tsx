import { useRef, Suspense, useState, useEffect } from 'react';
import { Disclosure, Listbox } from '@headlessui/react';
import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData, Await } from '@remix-run/react';
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

import type { ProductFragment } from 'storefrontapi.generated';
import { Heading, Section, Text } from '~/components/Text';
import { Link } from '~/components/Link';
import { Button } from '~/components/Button';
import { AddToCartButton } from '~/components/AddToCartButton';
import { Skeleton } from '~/components/Skeleton';
import { ProductSwimlane } from '~/components/ProductSwimlane';
import { ProductGallery } from '~/components/ProductGallery';
import { IconCaret, IconCheck, IconClose } from '~/components/Icon';
import { getExcerpt } from '~/lib/utils';
import { seoPayload } from '~/lib/seo.server';
import type { Storefront } from '~/lib/type';
import { routeHeaders } from '~/data/cache';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { StickyBuyBar } from '~/components/StickyBuyBar';
import { DealTerms } from '~/components/DealTerms';
import { Badge } from '~/components/ui/badge';
import PriceDisplay from '~/components/PriceDisplay';
import CountdownTimer from '~/components/CountdownTimer';
import StockBar from '~/components/StockBar';
import { useAside } from '~/components/Aside';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const { productHandle } = args.params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer({ ...deferredData, ...criticalData });
}

async function loadCriticalData({
  params,
  request,
  context,
}: LoaderFunctionArgs) {
  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const [{ shop, product }] = await Promise.all([
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
    throw new Response('product', { status: 404 });
  }

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const selectedVariant = product.selectedOrFirstAvailableVariant ?? {};
  const variants = getAdjacentAndFirstAvailableVariants(product);

  const seo = seoPayload.product({
    product: { ...product, variants },
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

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Product() {
  const { product, shop, recommended, variants, storeDomain } =
    useLoaderData<typeof loader>();
  const { media, title, vendor, descriptionHtml, description, tags } = product;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { open } = useAside();

  // Smart Timer Logic: Look for 'deal_end:YYYY-MM-DD...' tag
  const [dealEndTime, setDealEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const dealEndTag = tags.find((tag: string) => tag.startsWith('deal_end:'));
    if (dealEndTag) {
      const dateStr = dealEndTag.split('deal_end:')[1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime()) && date > new Date()) {
        setDealEndTime(date);
      }
    }
  }, [tags]);

  // Dynamic Features Logic: Parse tags starting with 'Feature:'
  // Example tag: "Feature: 1 Year Warranty"
  const features = tags
    .filter((tag: string) => tag.startsWith('Feature:'))
    .map((tag: string) => tag.replace('Feature:', '').trim());

  // Fallback for demo if no tags present (optional, can be removed if strict "hide" is desired)
  // For now, per user request "if not available.. just dnt show this", so we keep it empty if no tags.

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
                  {(media.nodes[selectedImageIndex]?.image?.url || selectedVariant.image?.url) ? (
                    <img
                      src={media.nodes[selectedImageIndex]?.image?.url || selectedVariant.image?.url}
                      alt={media.nodes[selectedImageIndex]?.alt || title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>

                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/30">
                    {selectedVariant?.compareAtPrice && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount)
                      ? `${Math.round(((parseFloat(selectedVariant.compareAtPrice.amount) - parseFloat(selectedVariant.price.amount)) / parseFloat(selectedVariant.compareAtPrice.amount)) * 100)}% OFF`
                      : 'Flash Deal'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {media.nodes.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {media.nodes.slice(0, 4).map((med: any, i: number) => (
                    <button
                      key={med.id || i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`aspect-square rounded-xl overflow-hidden bg-white cursor-pointer smooth-transition ${
                        selectedImageIndex === i
                          ? 'border-2 border-orange-500 shadow-md'
                          : 'border border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={med.image?.url}
                        alt={med.alt || `View ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info */}
            <div className="space-y-8 animate-fade-in">
              <div>
                {/* Brand + Badge */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {vendor && (
                    <Link to={`/search?q=${encodeURIComponent(vendor)}`} className="text-primary text-sm font-semibold uppercase tracking-wider hover:underline">
                      {vendor}
                    </Link>
                  )}
                  <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20 text-xs">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                    Live Deal
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-4xl font-display font-bold mb-4 leading-tight text-gray-900">
                  {title}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        key={i}
                        className="h-4 w-4 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    (2,847 reviews)
                  </span>
                </div>

                {description && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                    {description.length > 200 ? description.substring(0, 200) + '...' : description}
                  </p>
                )}
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

                {dealEndTime && (
                  <CountdownTimer targetDate={dealEndTime} />
                )}

                <StockBar remaining={selectedVariant.quantityAvailable} total={selectedVariant.quantityAvailable <= 50 ? Math.ceil(selectedVariant.quantityAvailable * 1.1) : 100} />
              </div>

              {/* Variants / Options */}
              <div className="space-y-4">
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                  storeDomain={storeDomain}
                />
              </div>

              {/* Key Features (Dynamic) */}
              {features.length > 0 && (
                <div className="bg-muted/30 rounded-2xl p-6 space-y-4 border border-border/50">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <IconCheck className="text-primary h-5 w-5" />
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}


            </div>
          </div>

          {/* About the Brand */}
          {vendor && (
            <div className="mt-12 md:mt-16">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 md:p-10 border border-orange-100">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-display font-bold text-2xl">
                      {vendor.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
                        About {vendor}
                      </h2>
                      <Badge className="bg-orange-500/10 text-orange-700 border-orange-200 text-[10px]">
                        Verified Brand
                      </Badge>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                      {vendor} is one of our trusted partner brands on DealDrop by FreeKaaMaal.com. We work directly with {vendor} to bring you exclusive deals at prices you won't find anywhere else. Every product is 100% genuine with full brand warranty.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/search?q=${encodeURIComponent(vendor)}`}
                        className="inline-flex items-center gap-2 bg-white border border-orange-200 text-orange-700 font-semibold text-sm px-4 py-2 rounded-xl hover:shadow-md smooth-transition"
                      >
                        View all {vendor} deals →
                      </Link>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconCheckCircle className="w-4 h-4 text-green-500" />
                          Genuine Products
                        </span>
                        <span className="flex items-center gap-1">
                          <IconShield className="w-4 h-4 text-blue-500" />
                          Brand Warranty
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Description */}
          {descriptionHtml && (
            <div className="mt-8 md:mt-12">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100">
                <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-gray-900">
                  Product Details
                </h2>
                <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </div>
              </div>
            </div>
          )}
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
function IconStar({ className }) {
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
function IconShield({ className }) {
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
function IconTruck({ className }) {
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
function IconRotateCcw({ className }) {
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
function IconCheckCircle({ className }) {
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
  const [quantity, setQuantity] = useState(1);
  const [showNotify, setShowNotify] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySent, setNotifySent] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send to API
    console.log('Notify email:', notifyEmail, 'for variant:', selectedVariant?.id);
    setNotifySent(true);
  };

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  return (
    <div className="grid gap-6">
      {/* Options */}
      {productOptions.map((option) => (
        <div key={option.name} className="flex flex-col space-y-2">
          <h4 className="font-bold text-sm text-foreground">{option.name}</h4>
          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((value) => (
              <Link
                key={value.name}
                to={`/products/${value.handle}?${value.variantUriQuery}`}
                preventScrollReset
                replace
                className={clsx(
                  'px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200',
                  value.selected
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground',
                )}
              >
                {value.name}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="space-y-4 pt-2">
        {isOutOfStock ? (
          <div className="space-y-4">
            {!showNotify ? (
              <Button
                variant="secondary"
                className="w-full bg-[#E76E50] hover:bg-[#D65D40] text-white font-bold h-14 rounded-2xl text-lg shadow-lg smooth-transition"
                onClick={() => setShowNotify(true)}
              >
                Notify Me When Available
              </Button>
            ) : !notifySent ? (
              <form onSubmit={handleNotifySubmit} className="space-y-3 animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  Enter your email to get notified when this drops again:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                  />
                  <Button type="submit" className="bg-primary text-primary-foreground font-bold rounded-xl px-6">
                    Send
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-primary/10 text-primary p-4 rounded-2xl text-center animate-fade-in border border-primary/20">
                <p className="font-bold">You're on the list! 🚀</p>
                <p className="text-sm">We'll email you as soon as it's back.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Buy Now (Primary) */}
            <AddToCartButton
              lines={[{ merchandiseId: selectedVariant?.id!, quantity }]}
              redirectTo="/checkout"
              rawButton
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
              style={{background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white'}}
            >
              Buy Now — ₹{parseFloat(selectedVariant?.price?.amount || '0').toLocaleString('en-IN')}
            </AddToCartButton>

            {/* Add to Cart */}
            <AddToCartButton
              lines={[{ merchandiseId: selectedVariant?.id!, quantity }]}
              rawButton
              className="w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
              style={{background: '#111827', color: 'white'}}
            >
              Add to Cart
            </AddToCartButton>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5">
                <IconCheckCircle className="w-3.5 h-3.5 text-green-500" />
                100% Genuine
              </span>
              <span className="flex items-center gap-1.5">
                <IconShield className="w-3.5 h-3.5 text-blue-500" />
                Brand Warranty
              </span>
              <span className="flex items-center gap-1.5">
                <IconTruck className="w-3.5 h-3.5 text-orange-500" />
                Fast Delivery
              </span>
            </div>
          </>
        )}
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
    quantityAvailable
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
    tags
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
    variables: { productId, count: 5 },
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

  return { nodes: mergedProducts };
}
