# Mini Mall

微型电商商城，基于 Next.js 16 全栈构建。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 (React 19) | 全栈框架 |
| TypeScript | 5 | 类型安全 |
| Prisma | 5 | ORM |
| SQLite | — | 数据库 |
| TailwindCSS | 4 | 样式 |
| JWT (jose) | 6 | 认证 |
| bcryptjs | 3 | 密码加密 |
| Zod | 4 | 表单校验 |
| sonner | 2 | Toast 通知 |

## 功能

- **商品浏览** — 首页、商品列表（搜索 + 分类筛选）、商品详情
- **用户系统** — 注册、登录、JWT 认证
- **购物车** — 添加/删除/修改数量、库存校验
- **下单支付** — 创建订单、模拟支付、订单管理
- **心悦会员** — 累计消费升级，享受折扣（9.8 / 9.5 / 9.0 折）
- **后台管理** — 仪表盘、商品 CRUD、分类管理、订单状态流转

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库并写入种子数据
npm run db:push
npm run db:seed

# 3. 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:3000

## 种子数据

| 账号 | 邮箱 | 密码 | 角色 |
|------|------|------|------|
| 管理员 | admin@example.com | admin123 | ADMIN |
| 普通用户 | — | — | 需自行注册 |

种子数据包含 3 个分类（数码电子、服装配饰、家居生活）和 10 件示例商品。

## 心悦会员体系

| 等级 | 累计消费门槛 | 折扣 |
|------|-------------|------|
| 心悦 0 | < ¥800 | 无折扣 |
| 心悦 1 | ≥ ¥800 | 9.8 折 |
| 心悦 2 | ≥ ¥8,000 | 9.5 折 |
| 心悦 3 | ≥ ¥80,000 | 9 折 |

- 下单时根据当前会员等级计算折扣，锁定到订单中
- 支付成功后累计消费金额，自动升级等级
- 后续订单享受升级后的折扣

## 项目结构

```
src/
├── app/                    # App Router 页面
│   ├── admin/              # 后台管理
│   ├── auth/               # 登录/注册
│   ├── cart/               # 购物车
│   ├── orders/             # 订单
│   └── products/           # 商品
├── actions/                # Server Actions
│   ├── auth.ts             # 注册/登录/登出
│   ├── admin.ts            # 后台 CRUD
│   ├── cart.ts             # 购物车操作
│   └── order.ts            # 下单/支付/取消
├── components/
│   ├── layout/             # Header, AdminSidebar
│   ├── ui/                 # Button, Input, Card
│   └── product/            # ProductCard, ProductGrid, ProductFilters
├── lib/
│   ├── prisma.ts           # PrismaClient 单例
│   ├── auth.ts             # JWT 签发/验证
│   ├── membership.ts       # 会员等级计算
│   └── utils.ts            # 工具函数
├── middleware.ts           # 路由保护
└── prisma/
    ├── schema.prisma       # 数据库模型
    └── seed.ts             # 种子数据
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run db:push` | 同步数据库结构 |
| `npm run db:seed` | 写入种子数据 |
| `npm run db:reset` | 重置数据库并重新写入种子 |
| `npm run db:studio` | 打开 Prisma Studio |
