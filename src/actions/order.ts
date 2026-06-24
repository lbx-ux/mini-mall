"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { getDiscountRate, calcMembershipLevel, getMembershipName } from "@/lib/membership";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.userId ?? null;
}

export async function createOrder() {
  const userId = await getUserId();
  if (!userId) redirect("/auth/login");

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "购物车为空" };
  }

  // 校验库存
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      return { error: `${item.product.name} 库存不足 (当前库存: ${item.product.stock})` };
    }
    if (!item.product.isPublished) {
      return { error: `${item.product.name} 已下架` };
    }
  }

  // 获取会员等级和折扣
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipLevel: true },
  });
  const membershipLevel = user?.membershipLevel ?? 0;
  const discountRate = getDiscountRate(membershipLevel);

  const originalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalAmount = originalAmount * discountRate;

  // 事务创建订单
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        originalAmount,
        discountRate,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // 清空购物车
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

export async function payOrder(orderId: number) {
  const userId = await getUserId();
  if (!userId) return { error: "请先登录" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.userId !== userId) return { error: "订单不存在" };
  if (order.status !== "PENDING") return { error: "订单状态不允许支付" };

  const userBefore = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipLevel: true },
  });
  const oldLevel = userBefore?.membershipLevel ?? 0;

  await prisma.$transaction(async (tx) => {
    // 扣减库存
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 更新订单状态
    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    // 更新累计消费和会员等级
    const user = await tx.user.update({
      where: { id: userId },
      data: { totalSpent: { increment: order.originalAmount } },
    });

    const newLevel = calcMembershipLevel(user.totalSpent);
    if (newLevel > user.membershipLevel) {
      await tx.user.update({
        where: { id: userId },
        data: { membershipLevel: newLevel },
      });
    }
  });

  let levelUp: string | undefined;
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipLevel: true },
  });
  const newLevel = updatedUser?.membershipLevel ?? 0;
  if (newLevel > oldLevel) {
    levelUp = getMembershipName(newLevel);
  }

  revalidatePath("/orders");
  return { success: true, levelUp };
}

export async function cancelOrder(orderId: number) {
  const userId = await getUserId();
  if (!userId) return { error: "请先登录" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order || order.userId !== userId) return { error: "订单不存在" };
  if (order.status !== "PENDING") return { error: "只能取消待支付订单" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/orders");
  return { success: true };
}
