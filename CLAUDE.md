# Mini Mall

微型电商项目。

## 技术栈

- **框架**: Next.js 16 (React 19) + TypeScript
- **数据库**: Prisma 5 + SQLite
- **样式**: TailwindCSS 4
- **认证**: JWT (jose + bcryptjs)
- **表单校验**: Zod
- **通知**: sonner

## 数据库模型

6 个模型，通过 Prisma 管理：

| 模型 | 关键字段 | 关联 |
|------|---------|------|
| User | id, name, email (unique), password, role (USER/ADMIN), membershipLevel (Int @default 0), totalSpent (Float @default 0) | 1:1 Cart, 1:N Order |
| Category | id, name (unique), slug (unique), description | 1:N Product |
| Product | id, name, slug (unique), description, price, imageUrl, stock, isPublished, categoryId | N:1 Category, 1:N CartItem/OrderItem |
| Cart | id, userId (unique) | 1:1 User, 1:N CartItem |
| CartItem | id, cartId, productId, quantity | 复合唯一 (cartId+productId) |
| Order | id, userId, status (String), totalAmount, originalAmount, discountRate | N:1 User, 1:N OrderItem |
| OrderItem | id, orderId, productId, quantity, price | N:1 Order/Product |

Order.status 用 String（SQLite 无枚举）：PENDING / PAID / SHIPPED / DELIVERED / CANCELLED

## 心悦会员体系

| 等级 | 累计消费门槛 | 折扣 |
|------|-------------|------|
| 心悦 0 | < ¥800 | 无折扣 |
| 心悦 1 | ≥ ¥800 | 9.8 折 |
| 心悦 2 | ≥ ¥8,000 | 9.5 折 |
| 心悦 3 | ≥ ¥80,000 | 9 折 |

折扣在创建订单时锁定到 Order.discountRate。支付成功时累加 User.totalSpent 重新计算等级。

## 目录结构

```
src/
├── app/
│   ├── layout.tsx             # 根布局 + Header + Toaster
│   ├── page.tsx               # 首页
│   ├── globals.css            # TailwindCSS 4 入口
│   ├── products/
│   │   ├── page.tsx           # 商品列表（搜索 + 分类筛选）
│   │   └── [id]/page.tsx      # 商品详情
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── cart/page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx           # Dashboard
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── categories/
│       │   └── page.tsx
│       └── orders/
│           └── page.tsx
├── components/
│   ├── layout/                # Header, AdminSidebar
│   ├── ui/                    # Button, Input, Card, Badge, Modal
│   ├── product/               # ProductCard, ProductGrid, ProductFilters
│   └── order/                 # OrderStatusBadge
├── lib/
│   ├── prisma.ts              # PrismaClient 单例
│   ├── auth.ts                # JWT sign/verify + hash/compare
│   ├── membership.ts          # calcMembershipLevel, getDiscountRate
│   └── utils.ts               # cn() 等工具函数
└── actions/                   # Server Actions
    ├── auth.ts
    ├── cart.ts
    ├── order.ts
    └── admin.ts
```

## 编码约束

- Server Components 直接查 Prisma，不经过 API 路由
- Client Components 通过 Server Action 传参，不直接调 Prisma
- JWT payload 携带 userId / role / membershipLevel
- middleware.ts 解析 JWT 写入 request header，不直接在组件中读 cookie
- 购物车仅数据库存储（不涉及 localStorage）
- 图片用 URL 字段（外部链接），无文件上传
- 表单用 Zod 校验，zod 版本 4.x
- UI 组件存放在 `components/ui/`，业务组件按模块分目录
