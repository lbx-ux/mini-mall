"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";
import { z } from "zod";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  if (payload?.role !== "ADMIN") return null;
  return payload;
}

// ------ Product CRUD ------

const productSchema = z.object({
  name: z.string().min(1, "请输入商品名称"),
  slug: z.string().min(1, "请输入 URL 标识"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "价格必须大于 0"),
  imageUrl: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  isPublished: z.coerce.boolean().optional(),
  categoryId: z.coerce.number().int(),
});

export async function createProduct(prevState: unknown, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.product.create({ data: parsed.data });
  } catch {
    return { error: "创建失败，slug 可能已存在" };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProduct(id: number, prevState: unknown, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.product.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "更新失败，slug 可能已存在" };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(id: number) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  return { success: true };
}

// ------ Category CRUD ------

const categorySchema = z.object({
  name: z.string().min(1, "请输入分类名称"),
  slug: z.string().min(1, "请输入 URL 标识"),
  description: z.string().optional(),
});

export async function createCategory(prevState: unknown, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "创建失败，名称或 slug 可能已存在" };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: number, prevState: unknown, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "更新失败，名称或 slug 可能已存在" };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: number) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return { error: "删除失败，该分类下可能还有商品" };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

// ------ Order ------

export async function updateOrderStatus(orderId: number, status: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "无权限" };

  const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) return { error: "无效状态" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
  return { success: true };
}
