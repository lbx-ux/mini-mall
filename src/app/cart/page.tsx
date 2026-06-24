import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/actions/cart";
import { getMembershipName, getDiscountRate } from "@/lib/membership";
import { formatPrice } from "@/lib/utils";
import { CartItemRow } from "./CartItemRow";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export default async function CartPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">购物车</h1>
        <p className="mt-4 text-gray-500">购物车是空的</p>
        <a
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          去逛逛
        </a>
      </div>
    );
  }

  const discountRate = getDiscountRate(user.membershipLevel);
  const originalTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountedTotal = originalTotal * discountRate;

  // 验证库存
  const stockErrors = cart.items
    .filter((item) => item.quantity > item.product.stock)
    .map((item) => `${item.product.name} 库存不足 (当前库存: ${item.product.stock})`);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">购物车</h1>

      {/* 会员折扣提示 */}
      {user.membershipLevel > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          你是 <strong>{getMembershipName(user.membershipLevel)}</strong>，
          享受 <strong>{(discountRate * 10).toFixed(1)} 折</strong> 优惠
        </div>
      )}

      {stockErrors.length > 0 && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {stockErrors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {/* 商品列表 */}
      <div className="space-y-3">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.id}
            id={item.id}
            productId={item.product.id}
            name={item.product.name}
            price={item.product.price}
            imageUrl={item.product.imageUrl}
            quantity={item.quantity}
            maxStock={item.product.stock}
            categoryName={item.product.category?.name ?? ""}
          />
        ))}
      </div>

      {/* 结算栏 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-2">
          {discountRate < 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">原价</span>
              <span className="text-gray-500">{formatPrice(originalTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>合计</span>
            <span className="text-red-600">{formatPrice(discountedTotal)}</span>
          </div>
          {discountRate < 1 && (
            <p className="text-right text-xs text-gray-400">
              已优惠 {formatPrice(originalTotal - discountedTotal)}
            </p>
          )}
        </div>

        <form
          action={async (FormData) => {
            "use server";
            const { createOrder } = await import("@/actions/order");
            await createOrder();
          }}
        >
          {stockErrors.length > 0 ? (
            <button
              disabled
              className="mt-4 h-10 w-full cursor-pointer rounded-lg bg-gray-300 text-sm font-medium text-gray-500"
            >
              请先处理库存问题
            </button>
          ) : (
            <button
              type="submit"
              className="mt-4 h-10 w-full cursor-pointer rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              提交订单
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
