import { prisma } from "@/lib/prisma";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>

      {/* 新增表单 */}
      <CategoryForm />

      {/* 列表 */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-4 font-medium">名称</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">描述</th>
              <th className="p-4 font-medium">商品数</th>
              <th className="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-4 font-medium text-gray-900">{c.name}</td>
                <td className="p-4 text-gray-400">{c.slug}</td>
                <td className="p-4 text-gray-500">{c.description || "-"}</td>
                <td className="p-4">{c._count.products}</td>
                <td className="p-4">
                  <DeleteCategoryButton id={c.id} name={c.name} productCount={c._count.products} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
