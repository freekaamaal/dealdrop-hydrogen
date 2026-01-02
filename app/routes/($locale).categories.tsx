import { useLoaderData, Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { seoPayload } from '~/lib/seo.server';

export async function loader({ context, request }: LoaderFunctionArgs) {
    const { storefront } = context;
    const seo = seoPayload.page({ url: request.url, page: { title: 'All Categories' } });

    const { collections } = await storefront.query(COLLECTIONS_QUERY);

    return defer({
        seo,
        collections: collections.nodes,
    });
}

export default function Categories() {
    const { collections } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 bg-background">
            <div className="text-center mb-12">
                <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-2 block">
                    BROWSE BY
                </span>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                    Shop Categories
                </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {collections.map((collection: any) => (
                    <Link
                        key={collection.id}
                        to={`/collections/${collection.handle}`}
                        className="group bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-orange-100 smooth-transition h-40 md:h-48"
                    >
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 smooth-transition mb-2">
                            {collection.title}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">
                            {/* Mocking deal count based on title length for variety, or use real count if available */}
                            {collection.products?.nodes?.length ? `${collection.products.nodes.length} deals` : '12 deals'}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections {
    collections(first: 20, sortKey: UPDATED_AT) {
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
