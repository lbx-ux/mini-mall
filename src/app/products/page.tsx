import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, category } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isPublished: true,
        ...(q && { name: { contains: q } }),
        ...(category && { category: { slug: category } }),
      },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">全部商品</h1>

      <ProductFilters categories={categories} />

      <p className="text-sm text-gray-500">
        共 {products.length} 件商品
        {q && <> — 搜索 &ldquo;{q}&rdquo;</>}
        {category && <> — 分类 &ldquo;{categories.find((c) => c.slug === category)?.name}&rdquo;</>}
      </p>

      <ProductGrid products={products} />
    </div>
  );
}
