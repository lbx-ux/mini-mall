"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.userId ?? null;
}

export async function addToCart(productId: number) {
  const userId = await getUserId();
  if (!userId) return { error: "请先登录" };

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });
    if (!product) return { error: "商品不存在" };
    if (!product.isPublished) return { error: "商品已下架" };

    // 确保购物车存在
    let cart = await tx.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await tx.cart.create({ data: { userId } });
    }

    // 在事务内检查库存
    const existing = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + 1 > product.stock) {
      return { error: "库存不足" };
    }

    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });

    return { success: true as const };
  });

  if (result && "error" in result) return result;

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const userId = await getUserId();
  if (!userId) return { error: "请先登录" };

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });
  if (!cartItem || cartItem.cart.userId !== userId) {
    return { error: "购物车商品不存在" };
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    if (quantity > cartItem.product.stock) {
      return { error: "库存不足" };
    }
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: number) {
  const userId = await getUserId();
  if (!userId) return { error: "请先登录" };

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });
  if (!cartItem || cartItem.cart.userId !== userId) {
    return { error: "购物车商品不存在" };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
  return { success: true };
}

export async function getCart() {
  const userId = await getUserId();
  if (!userId) return null;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: { select: { name: true } } },
          },
        },
        orderBy: { id: "desc" },
      },
    },
  });

  return cart;
}
