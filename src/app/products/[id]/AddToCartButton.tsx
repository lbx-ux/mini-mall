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
      const { addToCart } = await import("@/actions/cart");
      const result = await addToCart(productId);
      if (result?.error) {
        toast.error(result.error);
        if (result.error === "请先登录") {
          router.push("/auth/login");
        }
      } else {
        toast.success("已加入购物车");
        router.refresh();
      }
    } catch {
      toast.error("操作失败，请重试");
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
