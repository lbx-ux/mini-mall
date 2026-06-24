import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { formatPrice, cn } from "@/lib/utils";
import { calcMembershipLevel } from "@/lib/membership";
import { OrderActions } from "./OrderActions";

const STATUS_MAP: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  DELIVERED: "已完成",
  CANCELLED: "已取消",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/auth/login");

  const payload = await verifyJwt(token);
  if (!payload) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
  });

  if (!order || order.userId !== payload.userId) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>

      {/* 状态 + 金额 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">订单号 #{order.id}</p>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              order.status === "PENDING" && "bg-yellow-100 text-yellow-700",
              order.status === "PAID" && "bg-blue-100 text-blue-700",
              order.status === "SHIPPED" && "bg-purple-100 text-purple-700",
              order.status === "DELIVERED" && "bg-green-100 text-green-700",
              order.status === "CANCELLED" && "bg-gray-100 text-gray-600"
            )}
          >
            {STATUS_MAP[order.status] || order.status}
          </span>
        </div>

        <div className="mt-4 border-t pt-4">
          {order.originalAmount > order.totalAmount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">原价</span>
              <span className="text-gray-400 line-through">{formatPrice(order.originalAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>实付金额</span>
            <span className="text-red-600">{formatPrice(order.totalAmount)}</span>
          </div>
          {order.discountRate < 1 && (
            <p className="text-right text-xs text-gray-400">
              会员 {(order.discountRate * 10).toFixed(1)} 折 · 优惠 {formatPrice(order.originalAmount - order.totalAmount)}
            </p>
          )}
        </div>

        <OrderActions orderId={order.id} status={order.status} />
      </div>

      {/* 商品列表 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">商品信息</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">暂无</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-xs text-gray-400">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
