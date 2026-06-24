import { prisma } from "@/lib/prisma";
import { UpdateOrderStatusForm } from "./UpdateOrderStatusForm";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  DELIVERED: "已完成",
  CANCELLED: "已取消",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-4 font-medium">订单号</th>
              <th className="p-4 font-medium">用户</th>
              <th className="p-4 font-medium">商品</th>
              <th className="p-4 font-medium">金额</th>
              <th className="p-4 font-medium">状态</th>
              <th className="p-4 font-medium">时间</th>
              <th className="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-4">#{o.id}</td>
                <td className="p-4">{o.user.name}</td>
                <td className="p-4 max-w-48 truncate">
                  {o.items.map((i) => i.product.name).join("、")}
                </td>
                <td className="p-4">¥{o.totalAmount.toFixed(2)}</td>
                <td className="p-4">{STATUS_LABELS[o.status] || o.status}</td>
                <td className="p-4 text-gray-400">
                  {new Date(o.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="p-4">
                  <UpdateOrderStatusForm orderId={o.id} currentStatus={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
