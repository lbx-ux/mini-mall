"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory } from "@/actions/admin";

export function DeleteCategoryButton({
  id,
  name,
  productCount,
}: {
  id: number;
  name: string;
  productCount: number;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (productCount > 0) {
      toast.error(`「${name}」下有 ${productCount} 件商品，无法删除`);
      return;
    }
    if (!confirm(`确定删除分类「${name}」？`)) return;
    const result = await deleteCategory(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("已删除");
      router.refresh();
    }
  }

  return (
    <button onClick={handleDelete} className="text-red-500 hover:underline cursor-pointer">
      删除
    </button>
  );
}
