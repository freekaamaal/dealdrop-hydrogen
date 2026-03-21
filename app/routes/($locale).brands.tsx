import { useLoaderData, Link } from '@remix-run/react';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { seoPayload } from '~/lib/seo.server';
import { ArrowRight, Store } from 'lucide-react';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront } = context;
  const seo = seoPayload.page({ url: request.url, page: { title: 'Shop by Brand | DealDrop by FreeKaaMaal.com' } });

  // Fetch all products to extract vendors
  const { products } = await storefront.query(ALL_PRODUCTS_QUERY);

  // Build brand map from vendor field
  const brandMap = new Map<string, { name: string; count: number; handle: string; image: string; products: any[] }>();

  for (const product of products.nodes) {
    const vendor = product.vendor;
    if (!vendor || vendor === 'DropMyDeal' || vendor === 'DealDrop' || vendor === 'DealDrop by FreeKaaMaal.com') continue;

    const existing = brandMap.get(vendor);
    const productData = {
      title: product.title,
      image: product.variants?.nodes?.[0]?.image?.url || '',
      handle: product.handle,
      price: product.variants?.nodes?.[0]?.price,
      compareAtPrice: product.variants?.nodes?.[0]?.compareAtPrice,
    };

    if (existing) {
      existing.count++;
      existing.products.push(productData);
    } else {
      brandMap.set(vendor, {
        name: vendor,
        count: 1,
        handle: vendor.toLowerCase().replace(/\s+/g, '-'),
        image: productData.image,
        products: [productData],
      });
    }
  }

  return defer({
    seo,
    brands: Array.from(brandMap.values()).sort((a, b) => b.count - a.count),
  });
}

export default function Brands() {
  const { brands } = useLoaderData<typeof loader>();

  const gradients = [
    'from-orange-500 to-amber-500',
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-red-500 to-rose-500',
    'from-teal-500 to-cyan-500',
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Store className="w-3.5 h-3.5" />
            Our Partner Brands
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-3">
            Shop by Brand
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            We work directly with {brands.length} premium brands to bring you exclusive deals at unbeatable prices.
          </p>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand, i) => {
            const gradient = gradients[i % gradients.length];
            return (
              <Link
                key={brand.name}
                to={`/search?q=${encodeURIComponent(brand.name)}`}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl smooth-transition hover:scale-[1.02]"
              >
                {/* Brand header */}
                <div className={`bg-gradient-to-r ${gradient} p-5 flex items-center gap-4`}>
                  {brand.image ? (
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0">
                      <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-display font-bold text-2xl">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-display font-bold text-white text-lg">{brand.name}</h2>
                    <p className="text-white/70 text-xs">{brand.count} {brand.count === 1 ? 'product' : 'products'}</p>
                  </div>
                </div>

                {/* Product preview thumbnails */}
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    {brand.products.slice(0, 4).map((p: any, j: number) => (
                      <div key={j} className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
                      </div>
                    ))}
                    {brand.count > 4 && (
                      <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground font-semibold">+{brand.count - 4}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary smooth-transition">View all deals</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 100, sortKey: VENDOR) {
      nodes {
        id
        title
        vendor
        handle
        variants(first: 1) {
          nodes {
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;
