import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

const STATUS_MAP: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  DELIVERED: "已完成",
  CANCELLED: "已取消",
};

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/auth/login");

  const payload = await verifyJwt(token);
  if (!payload) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: payload.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>

      {orders.length === 0 ? (
        <p className="py-16 text-center text-gray-500">暂无订单</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">
                    订单号 #{order.id}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.items.length} 件商品 · {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "PAID"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "DELIVERED"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUS_MAP[order.status] || order.status}
                  </span>
                  <p className="mt-1 text-lg font-bold text-red-600">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
