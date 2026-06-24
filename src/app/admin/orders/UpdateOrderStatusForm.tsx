"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/admin";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  PAID: "设为已支付",
  SHIPPED: "设为已发货",
  DELIVERED: "设为已完成",
  CANCELLED: "取消订单",
};

export function UpdateOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const available = VALID_TRANSITIONS[currentStatus] || [];

  async function handleUpdate(status: string) {
    const result = await updateOrderStatus(orderId, status);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("状态已更新");
      router.refresh();
    }
  }

  if (available.length === 0) return <span className="text-gray-400">-</span>;

  return (
    <div className="flex gap-2">
      {available.map((status) => (
        <button
          key={status}
          onClick={() => handleUpdate(status)}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {STATUS_LABELS[status] || status}
        </button>
      ))}
    </div>
  );
}
