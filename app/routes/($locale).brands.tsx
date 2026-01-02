import { useLoaderData, Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { seoPayload } from '~/lib/seo.server';

export async function loader({ context, request }: LoaderFunctionArgs) {
    const { storefront } = context;
    const seo = seoPayload.page({ url: request.url, page: { title: 'Our Brands' } });

    // In a real scenario, this would filter by 'type:Brand' or similar
    const { collections } = await storefront.query(BRANDS_QUERY);

    return defer({
        seo,
        brands: collections.nodes,
    });
}

export default function Brands() {
    const { brands } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 bg-background">
            <div className="text-center mb-12">
                <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-2 block">
                    BROWSE BY
                </span>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                    Shop Brands
                </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
                {brands.map((brand: any) => (
                    <Link
                        key={brand.id}
                        to={`/collections/${brand.handle}`}
                        className="group bg-white border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-orange-100 smooth-transition aspect-square"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-110 smooth-transition">
                            {brand.image ? (
                                <Image
                                    data={brand.image}
                                    className="object-contain w-full h-full p-2"
                                    sizes="100px"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400 group-hover:text-orange-500 smooth-transition">
                                    {brand.title.charAt(0)}
                                </span>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-900 group-hover:text-orange-600 smooth-transition">
                            {brand.title}
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">
                            {brand.products?.nodes?.length ? `${brand.products.nodes.length} items` : 'View Brand'}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const BRANDS_QUERY = `#graphql
  query Brands {
    collections(first: 20, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        products(first: 50) {
          nodes {
            id
          }
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;
