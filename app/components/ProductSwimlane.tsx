import type { HomepageFeaturedProductsQuery } from 'storefrontapi.generated';
import { Section } from '~/components/Text';
import { ProductCard } from '~/components/ProductCard';

const mockProducts = {
  nodes: new Array(12).fill(''),
};

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  count?: number;
};

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}: ProductSwimlaneProps) {
  return (
    <Section heading={title} padding="y" {...props}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 md:px-0">
        {products.nodes.slice(0, 5).map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="w-full"
          />
        ))}
      </div>
    </Section>
  );
}
