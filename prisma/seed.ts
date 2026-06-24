import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 清理现有数据
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 管理员账号
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "管理员",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 分类
  const electronics = await prisma.category.create({
    data: {
      name: "数码电子",
      slug: "electronics",
      description: "手机、电脑、耳机等数码产品",
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: "服装配饰",
      slug: "clothing",
      description: "男装、女装、鞋帽配饰",
    },
  });

  const home = await prisma.category.create({
    data: {
      name: "家居生活",
      slug: "home",
      description: "家具、厨具、生活用品",
    },
  });

  // 商品
  const products = [
    {
      name: "无线蓝牙耳机 Pro",
      slug: "wireless-earbuds-pro",
      description: "降噪蓝牙耳机，续航 30 小时，IPX5 防水",
      price: 299,
      imageUrl: "https://picsum.photos/seed/earbuds/400/400",
      stock: 100,
      categoryId: electronics.id,
    },
    {
      name: "机械键盘 RGB",
      slug: "mechanical-keyboard-rgb",
      description: "87 键热插拔机械键盘，Cherry 轴体，RGB 背光",
      price: 459,
      imageUrl: "https://picsum.photos/seed/keyboard/400/400",
      stock: 50,
      categoryId: electronics.id,
    },
    {
      name: "便携充电宝 20000mAh",
      slug: "power-bank-20000",
      description: "大容量快充移动电源，支持 PD 65W，双向快充",
      price: 199,
      imageUrl: "https://picsum.photos/seed/powerbank/400/400",
      stock: 200,
      categoryId: electronics.id,
    },
    {
      name: "简约纯棉T恤",
      slug: "cotton-tshirt",
      description: "100% 新疆长绒棉，宽松版型，多色可选",
      price: 89,
      imageUrl: "https://picsum.photos/seed/tshirt/400/400",
      stock: 300,
      categoryId: clothing.id,
    },
    {
      name: "经典帆布鞋",
      slug: "classic-canvas-shoes",
      description: "复古低帮帆布鞋，硫化工艺，舒适耐穿",
      price: 159,
      imageUrl: "https://picsum.photos/seed/shoes/400/400",
      stock: 150,
      categoryId: clothing.id,
    },
    {
      name: "轻薄羽绒服",
      slug: "light-down-jacket",
      description: "90% 白鹅绒填充，连帽设计，可收纳",
      price: 699,
      imageUrl: "https://picsum.photos/seed/jacket/400/400",
      stock: 80,
      categoryId: clothing.id,
    },
    {
      name: "北欧风台灯",
      slug: "nordic-desk-lamp",
      description: "实木底座，三档调光调色，护眼 LED",
      price: 129,
      imageUrl: "https://picsum.photos/seed/lamp/400/400",
      stock: 120,
      categoryId: home.id,
    },
    {
      name: "双层真空保温杯",
      slug: "vacuum-thermos",
      description: "316 不锈钢内胆，500ml 容量，保温 12 小时",
      price: 79,
      imageUrl: "https://picsum.photos/seed/thermos/400/400",
      stock: 250,
      categoryId: home.id,
    },
    {
      name: "日式简约餐具套装",
      slug: "japanese-tableware-set",
      description: "釉下彩陶瓷，含 4 碗 + 4 盘 + 4 筷 + 4 勺",
      price: 239,
      imageUrl: "https://picsum.photos/seed/tableware/400/400",
      stock: 60,
      categoryId: home.id,
    },
    {
      name: "智能手表 Sport",
      slug: "smart-watch-sport",
      description: "1.5 英寸 AMOLED 屏，心率血氧监测，100+ 运动模式",
      price: 899,
      imageUrl: "https://picsum.photos/seed/watch/400/400",
      stock: 40,
      categoryId: electronics.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("Seed 完成：1 管理员 + 3 分类 + 10 商品");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
