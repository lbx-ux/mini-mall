"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signJwt, hashPassword, comparePassword } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位"),
});

const loginSchema = z.object({
  email: z.string().email("请输入正确的邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export async function register(prevState: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "该邮箱已注册" };
  }

  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return { success: true };
}

export async function login(prevState: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "邮箱或密码错误" };
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return { error: "邮箱或密码错误" };
  }

  const token = await signJwt({
    userId: user.id,
    role: user.role,
    membershipLevel: user.membershipLevel,
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { success: true };
}
