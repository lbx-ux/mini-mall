"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProduct, updateProduct } from "@/actions/admin";

interface Props {
  categories: { id: number; name: string }[];
  product?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    isPublished: boolean;
    categoryId: number;
  };
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateProduct(product.id, null, formData)
      : await createProduct(null, formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "已更新" : "已创建");
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <Input label="商品名称" name="name" defaultValue={product?.name} required />
      <Input label="URL 标识 (slug)" name="slug" defaultValue={product?.slug} required />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <Input label="价格" name="price" type="number" step="0.01" defaultValue={product?.price ?? ""} required />
      <Input label="图片 URL" name="imageUrl" defaultValue={product?.imageUrl ?? ""} />
      <Input label="库存" name="stock" type="number" defaultValue={product?.stock ?? 0} required />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          defaultChecked={product?.isPublished ?? true}
          className="h-4 w-4"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">上架</label>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">分类</label>
        <select
          name="categoryId"
          defaultValue={product?.categoryId}
          required
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <Button type="submit">{isEdit ? "保存修改" : "创建商品"}</Button>
    </form>
  );
}
