"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { payOrder, cancelOrder } from "@/actions/order";

interface OrderActionsProps {
  orderId: number;
  status: string;
}

export function OrderActions({ orderId, status }: OrderActionsProps) {
  const router = useRouter();

  async function handlePay() {
    const result = await payOrder(orderId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("支付成功！");
      if (result?.levelUp) {
        toast.success(`恭喜！你已升级为 ${result.levelUp}`);
      }
      router.refresh();
    }
  }

  async function handleCancel() {
    const result = await cancelOrder(orderId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("订单已取消");
      router.refresh();
    }
  }

  if (status === "PENDING") {
    return (
      <div className="mt-6 flex gap-3">
        <Button onClick={handlePay} size="sm">
          确认付款
        </Button>
        <Button onClick={handleCancel} variant="secondary" size="sm">
          取消订单
        </Button>
      </div>
    );
  }

  return null;
}
