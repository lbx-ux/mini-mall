import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
    category: { name: string } | null;
  }[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-gray-500">
        暂无商品
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}
