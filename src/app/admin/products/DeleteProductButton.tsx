"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/admin";

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`确定删除「${name}」？`)) return;
    const result = await deleteProduct(id);
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
