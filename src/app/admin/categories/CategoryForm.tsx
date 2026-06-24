"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCategory } from "@/actions/admin";

export function CategoryForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createCategory(null, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("分类已创建");
      e.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex-1">
        <Input label="名称" name="name" required />
      </div>
      <div className="flex-1">
        <Input label="Slug" name="slug" required />
      </div>
      <div className="flex-[2]">
        <Input label="描述" name="description" />
      </div>
      <Button type="submit" size="md">新增</Button>
    </form>
  );
}
