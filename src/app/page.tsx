import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 text-center md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          欢迎来到 Mini Mall
        </h1>
        <p className="mt-2 text-gray-500">
          发现精选好物，享受心悦会员专属折扣
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          浏览商品
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">商品分类</h2>
            <Link href="/products" className="text-sm text-blue-600 hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-gray-900">{cat.name}</p>
                {cat.description && (
                  <p className="mt-1 text-xs text-gray-400">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">新品推荐</h2>
        <ProductGrid products={featuredProducts} />
      </section>
    </div>
  );
}
