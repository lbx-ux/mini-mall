import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Mall",
  description: "微型电商商城",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-gray-50">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
