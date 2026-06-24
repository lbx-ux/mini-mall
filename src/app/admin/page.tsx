import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = [
    { label: "商品总数", value: productCount },
    { label: "订单总数", value: orderCount },
    { label: "用户总数", value: userCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 最近订单 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">最近订单</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            查看全部 →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">暂无订单</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">订单号</th>
                <th className="pb-2 font-medium">用户</th>
                <th className="pb-2 font-medium">金额</th>
                <th className="pb-2 font-medium">状态</th>
                <th className="pb-2 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2">#{o.id}</td>
                  <td className="py-2">{o.user.name}</td>
                  <td className="py-2">¥{o.totalAmount.toFixed(2)}</td>
                  <td className="py-2">{o.status}</td>
                  <td className="py-2 text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
