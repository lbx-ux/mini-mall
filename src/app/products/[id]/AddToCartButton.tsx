"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface AddToCartButtonProps {
  productId: number;
  stock: number;
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      // 间接调用 cart Server Action — 先创建 actions/cart.ts
      const { addToCart } = await import("@/actions/cart");
      const result = await addToCart(productId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("已加入购物车");
        router.refresh();
      }
    } catch {
      toast.error("请先登录");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={loading || stock === 0}
      size="lg"
      className="w-full"
    >
      {stock === 0 ? "缺货" : loading ? "添加中..." : "加入购物车"}
    </Button>
  );
}
