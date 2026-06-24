import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: { name: string } | null;
}

export function ProductCard({ id, name, price, imageUrl, category }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
        <div className="aspect-square bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              暂无图片
            </div>
          )}
        </div>
        <div className="p-4">
          {category && (
            <p className="mb-1 text-xs text-gray-400">{category.name}</p>
          )}
          <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-900">
            {name}
          </h3>
          <p className="text-lg font-bold text-red-600">{formatPrice(price)}</p>
        </div>
      </div>
    </Link>
  );
}
