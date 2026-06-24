"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { updateCartItemQuantity, removeFromCart } from "@/actions/cart";

interface CartItemRowProps {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxStock: number;
  categoryName: string;
}

export function CartItemRow({
  id,
  productId,
  name,
  price,
  imageUrl,
  quantity,
  maxStock,
  categoryName,
}: CartItemRowProps) {
  const router = useRouter();

  async function handleUpdate(newQty: number) {
    const result = await updateCartItemQuantity(id, newQty);
    if (result?.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleRemove() {
    const result = await removeFromCart(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("已移除");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      {/* 图片 */}
      <a href={`/products/${productId}`} className="shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              暂无
            </div>
          )}
        </div>
      </a>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <a href={`/products/${productId}`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-blue-600">
          {name}
        </a>
        <p className="text-xs text-gray-400">{categoryName}</p>
        <p className="mt-1 text-sm font-bold text-red-600">{formatPrice(price)}</p>
      </div>

      {/* 数量 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleUpdate(quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded border text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          -
        </button>
        <span className="w-8 text-center text-sm">{quantity}</span>
        <button
          onClick={() => handleUpdate(quantity + 1)}
          disabled={quantity >= maxStock}
          className="flex h-7 w-7 items-center justify-center rounded border text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
        >
          +
        </button>
      </div>

      {/* 小计 */}
      <div className="w-20 text-right">
        <p className="text-sm font-bold text-gray-900">{formatPrice(price * quantity)}</p>
      </div>

      {/* 删除 */}
      <button
        onClick={handleRemove}
        className="shrink-0 text-sm text-gray-400 hover:text-red-500 cursor-pointer"
      >
        删除
      </button>
    </div>
  );
}
