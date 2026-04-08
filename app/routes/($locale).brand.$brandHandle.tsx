import {json, type LoaderFunctionArgs, type MetaArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigate, useSearchParams} from '@remix-run/react';
import {useEffect} from 'react';
import {
  Pagination,
  getPaginationVariables,
  getSeoMeta,
  flattenConnection,
} from '@shopify/hydrogen';
import {useInView} from 'react-intersection-observer';
import {ShieldCheck, Award, BadgePercent, ChevronLeft, ShoppingCart} from 'lucide-react';

import {Grid} from '~/components/Grid';
import {ProductCard} from '~/components/ProductCard';
import {AddToCartButton} from '~/components/AddToCartButton';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {brandHandle} = params;

  if (!brandHandle) {
    throw new Response('Brand not found', {status: 404});
  }

  // Convert handle back to vendor search term
  const searchVendor = brandHandle.replace(/-/g, ' ');

  // Probe query: get exact vendor name from Shopify
  const probe = await storefront.query(PROBE_VENDOR_QUERY, {
    variables: {
      searchTerm: `vendor:${searchVendor}`,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const actualVendor = probe.products.nodes[0]?.vendor;
  if (!actualVendor) {
    throw new Response('Brand not found', {status: 404});
  }

  // Get brand image from first product
  const brandImage = probe.products.nodes[0]?.variants?.nodes?.[0]?.image?.url || '';

  // Parse sort params
  const url = new URL(request.url);
  const sortParam = url.searchParams.get('sort');
  const {sortKey, reverse} = getSortValues(sortParam);

  // Full paginated query
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const {products} = await storefront.query(BRAND_PRODUCTS_QUERY, {
    variables: {
      searchTerm: `vendor:${actualVendor}`,
      sortKey,
      reverse,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const totalCount = products.nodes.length;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: `brand-${brandHandle}`,
      title: `${actualVendor} — Best Deals`,
      handle: `brands/${brandHandle}`,
      descriptionHtml: `Shop exclusive ${actualVendor} deals at unbeatable prices. 100% genuine, direct from brand.`,
      description: `Shop exclusive ${actualVendor} deals at unbeatable prices.`,
      seo: {
        title: `${actualVendor} Deals — DealDrop`,
        description: `Shop ${actualVendor} products at the best prices. 100% genuine, direct from brand.`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });

  return json({
    seo,
    brandName: actualVendor,
    brandHandle,
    brandImage,
    products,
    totalCount,
  });
}

function getSortValues(sortParam: string | null) {
  switch (sortParam) {
    case 'price-low-high':
      return {sortKey: 'PRICE' as const, reverse: false};
    case 'price-high-low':
      return {sortKey: 'PRICE' as const, reverse: true};
    case 'newest':
      return {sortKey: 'CREATED_AT' as const, reverse: true};
    case 'best-selling':
    default:
      return {sortKey: 'RELEVANCE' as const, reverse: false};
  }
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function BrandPage() {
  const {brandName, brandImage, products, totalCount} =
    useLoaderData<typeof loader>();
  const {ref, inView} = useInView();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = searchParams.get('sort') || 'best-selling';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({sort: e.target.value});
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Brand Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
        <div className="relative px-4 py-8 md:py-12 max-w-7xl mx-auto">
          <a
            href="/brands"
            className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 smooth-transition"
          >
            <ChevronLeft className="w-4 h-4" />
            All Brands
          </a>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Brand Image */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {brandImage ? (
                <img
                  src={brandImage}
                  alt={brandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-display font-bold text-3xl md:text-5xl">
                  {brandName.charAt(0)}
                </span>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-4xl font-bold text-white truncate">
                {brandName}
              </h1>
              <p className="text-white/60 text-sm md:text-base mt-1">
                Exclusive deals direct from brand
              </p>
              <div className="mt-2">
                <span className="inline-block bg-orange-500/20 text-orange-400 text-xs md:text-sm font-semibold px-3 py-1 rounded-full border border-orange-500/30">
                  {totalCount} {totalCount === 1 ? 'deal' : 'deals'} available
                </span>
              </div>
            </div>
          </div>

          {/* Trust Pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 text-[11px] md:text-xs px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              100% Genuine
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 text-[11px] md:text-xs px-3 py-1.5 rounded-full">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              Brand Warranty
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 text-[11px] md:text-xs px-3 py-1.5 rounded-full">
              <BadgePercent className="w-3.5 h-3.5 text-orange-400" />
              Best Prices
            </span>
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-white/50 text-sm">
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
          </p>
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="best-selling">Best Selling</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Pagination connection={products}>
          {({nodes, isLoading, NextLink, hasNextPage, nextPageUrl, state}) => (
            <>
              <ProductsLoadedOnScroll
                nodes={nodes}
                inView={inView}
                nextPageUrl={nextPageUrl}
                hasNextPage={hasNextPage}
                state={state}
              />
              {hasNextPage && (
                <div className="flex items-center justify-center mt-8">
                  <button
                    ref={ref}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-3 rounded-xl border border-white/10 smooth-transition"
                    onClick={() => {}}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
}

function ProductsLoadedOnScroll({
  nodes,
  inView,
  nextPageUrl,
  hasNextPage,
  state,
}: {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return (
    <Grid layout="products" data-test="product-grid">
      {nodes.map((product: any, i: number) => (
        <BrandProductCard
          key={product.id}
          product={product}
          loading={getImageLoadingPriority(i)}
        />
      ))}
    </Grid>
  );
}

function BrandProductCard({
  product,
  loading,
}: {
  product: any;
  loading?: HTMLImageElement['loading'];
}) {
  const firstVariant = flattenConnection(product.variants)[0] as any;
  const merchandiseId = firstVariant?.id;

  return (
    <div className="relative group/card">
      <ProductCard product={product} loading={loading} />
      {merchandiseId && firstVariant?.availableForSale && (
        <div className="px-2 pb-2 -mt-1">
          <AddToCartButton
            lines={[{merchandiseId, quantity: 1}]}
            rawButton
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.97] text-white text-[11px] md:text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 smooth-transition shadow-md shadow-orange-500/20"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </AddToCartButton>
        </div>
      )}
    </div>
  );
}

const PROBE_VENDOR_QUERY = `#graphql
  query ProbeVendor(
    $country: CountryCode
    $language: LanguageCode
    $searchTerm: String!
  ) @inContext(country: $country, language: $language) {
    products(first: 1, query: $searchTerm) {
      nodes {
        vendor
        variants(first: 1) {
          nodes {
            image {
              url
            }
          }
        }
      }
    }
  }
` as const;

const BRAND_PRODUCTS_QUERY = `#graphql
  query BrandProducts(
    $country: CountryCode
    $language: LanguageCode
    $searchTerm: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
      query: $searchTerm
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
` as const;
