import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";

const protectedPaths = ["/cart", "/orders", "/admin"];
const authPaths = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  // 将用户信息写入 request headers（供 Server Components 读取）
  const requestHeaders = new Headers(request.headers);
  if (payload) {
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-membership-level", String(payload.membershipLevel));
  }

  // 已登录用户访问登录/注册页 → 重定向到首页
  if (payload && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 未登录用户访问受保护路径 → 重定向到登录页
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!payload && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 非 ADMIN 访问 /admin → 重定向到首页
  if (pathname.startsWith("/admin") && payload?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
