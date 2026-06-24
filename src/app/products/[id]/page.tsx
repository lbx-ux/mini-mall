import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product || !product.isPublished) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-blue-600"
      >
        ← 返回商品列表
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              暂无图片
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-400">{product.category.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-red-600">
              {formatPrice(product.price)}
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              {product.description}
            </p>

            <div className="mt-4 text-sm text-gray-500">
              {product.stock > 0 ? (
                <span className="text-green-600">库存 {product.stock} 件</span>
              ) : (
                <span className="text-red-600">暂时缺货</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
