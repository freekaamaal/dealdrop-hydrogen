import { useLoaderData, Link } from '@remix-run/react';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { seoPayload } from '~/lib/seo.server';
import { Tag, ArrowRight } from 'lucide-react';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront } = context;
  const seo = seoPayload.page({ url: request.url, page: { title: 'Shop by Category | DropMyDeal' } });

  const { products } = await storefront.query(ALL_PRODUCTS_QUERY);

  // Extract categories from productType field
  const categoryMap = new Map<string, { name: string; count: number; products: any[] }>();

  for (const product of products.nodes) {
    const type = product.productType;
    if (!type || type.trim() === '') continue;

    const existing = categoryMap.get(type);
    const productData = {
      title: product.title,
      image: product.variants?.nodes?.[0]?.image?.url || '',
    };

    if (existing) {
      existing.count++;
      if (existing.products.length < 4) existing.products.push(productData);
    } else {
      categoryMap.set(type, {
        name: type,
        count: 1,
        products: [productData],
      });
    }
  }

  const categories = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return defer({ seo, categories });
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>();

  const bgColors = [
    'bg-orange-50 border-orange-200', 'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200', 'bg-purple-50 border-purple-200',
    'bg-pink-50 border-pink-200', 'bg-amber-50 border-amber-200',
    'bg-teal-50 border-teal-200', 'bg-red-50 border-red-200',
    'bg-indigo-50 border-indigo-200', 'bg-emerald-50 border-emerald-200',
  ];

  const iconColors = [
    'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-pink-500', 'bg-amber-500', 'bg-teal-500', 'bg-red-500',
    'bg-indigo-500', 'bg-emerald-500',
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Tag className="w-3.5 h-3.5" />
            Browse Categories
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-3">
            Shop by Category
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            Explore deals across {categories.length} categories
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/search?q=${encodeURIComponent(cat.name)}`}
                className={`group ${bgColors[i % bgColors.length]} border rounded-2xl p-5 hover:shadow-lg smooth-transition hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${iconColors[i % iconColors.length]} rounded-xl flex items-center justify-center shadow-md`}>
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base">{cat.name}</h2>
                    <p className="text-xs text-muted-foreground">{cat.count} {cat.count === 1 ? 'product' : 'products'}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  {cat.products.map((p: any, j: number) => (
                    <div key={j} className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                      {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary smooth-transition">Explore deals</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No categories found. Set "Product type" on your products in Shopify admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProductsForCategories($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 100, sortKey: PRODUCT_TYPE) {
      nodes {
        id
        title
        productType
        handle
        variants(first: 1) {
          nodes {
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
` as const;
