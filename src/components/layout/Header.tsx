import Link from "next/link";
import { cookies, headers } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { getMembershipName } from "@/lib/membership";
import { prisma } from "@/lib/prisma";

async function getUser() {
  // 优先从 middleware 注入的 headers 读取 userId
  const headersList = await headers();
  const userIdHeader = headersList.get("x-user-id");
  if (userIdHeader) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userIdHeader) },
      select: { id: true, role: true, membershipLevel: true },
    });
    if (user) return user;
  }

  // 回退：从 cookie 读取 JWT
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function Header() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Mini Mall
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <Link href="/products" className="hover:text-blue-600">
              商品
            </Link>
            {user && (
              <>
                <Link href="/cart" className="hover:text-blue-600">
                  购物车
                </Link>
                <Link href="/orders" className="hover:text-blue-600">
                  订单
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-500">
                {getMembershipName(user.membershipLevel)}
              </span>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600"
                >
                  后台
                </Link>
              )}
              <form action="/api/logout" method="POST">
                <button type="submit" className="text-sm text-gray-500 hover:text-red-500 cursor-pointer">
                  退出
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
