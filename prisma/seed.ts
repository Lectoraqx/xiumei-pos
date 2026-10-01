import { PrismaClient, Role, EmployeeStatus, ProductStatus, MemberTier, DiscountType, PromoStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding Xiumei 秀美 database...');

  // 1. Clean up existing data (Order matters due to foreign keys)
  await prisma.pointTransaction.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.orderDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();

  // 2. Create Employees (Demo Accounts)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const managerPassword = await bcrypt.hash('Manager123!', salt);
  const cashierPassword = await bcrypt.hash('Cashier123!', salt);

  const admin = await prisma.employee.create({
    data: {
      firstName: 'System', lastName: 'Admin', email: 'admin@example.com',
      passwordHash: adminPassword, role: Role.ADMIN, phone: '0800000001', status: EmployeeStatus.ACTIVE
    }
  });

  const manager = await prisma.employee.create({
    data: {
      firstName: 'Store', lastName: 'Manager', email: 'manager@example.com',
      passwordHash: managerPassword, role: Role.MANAGER, phone: '0800000002', status: EmployeeStatus.ACTIVE
    }
  });

  const cashier = await prisma.employee.create({
    data: {
      firstName: 'Staff', lastName: 'Cashier', email: 'cashier@example.com',
      passwordHash: cashierPassword, role: Role.CASHIER, phone: '0800000003', status: EmployeeStatus.ACTIVE
    }
  });

  // 3. Create Categories
  const catIceCream = await prisma.category.create({ data: { name: 'ไอศกรีม', description: 'ไอศกรีมรสชาติต่างๆ' } });
  const catTopping = await prisma.category.create({ data: { name: 'ท็อปปิ้ง', description: 'ของตกแต่งและเพิ่มรสชาติ' } });
  const catCone = await prisma.category.create({ data: { name: 'โคน', description: 'โคนไอศกรีมชนิดต่างๆ' } });
  const catBeverage = await prisma.category.create({ data: { name: 'เครื่องดื่ม', description: 'น้ำเปล่าและน้ำอัดลม' } });
  const catContainer = await prisma.category.create({ data: { name: 'ภาชนะ', description: 'ถ้วยและกล่องกลับบ้าน' } });

  // 4. Create Suppliers
  const supDairy = await prisma.supplier.create({ data: { name: 'Premium Dairy Co.', contactName: 'คุณสมชาย', phone: '02-111-1111' } });
  const supBakery = await prisma.supplier.create({ data: { name: 'Sweet Cone Bakery', contactName: 'คุณสมศรี', phone: '02-222-2222' } });
  const supGeneral = await prisma.supplier.create({ data: { name: 'General Supply & Pack', contactName: 'คุณสมศักดิ์', phone: '02-333-3333' } });

  // 5. Create Products (15 Items)
  const products = [
    // ไอศกรีม
    { name: 'วานิลลามาดากัสการ์', categoryId: catIceCream.id, supplierId: supDairy.id, unitType: 'Scoop', costPrice: 20, sellingPrice: 65, stockQty: 100, minStock: 20 },
    { name: 'ดาร์กช็อกโกแลตเบลเยียม', categoryId: catIceCream.id, supplierId: supDairy.id, unitType: 'Scoop', costPrice: 25, sellingPrice: 75, stockQty: 80, minStock: 20 },
    { name: 'สตรอว์เบอร์รีซอร์เบต์', categoryId: catIceCream.id, supplierId: supDairy.id, unitType: 'Scoop', costPrice: 18, sellingPrice: 65, stockQty: 60, minStock: 15 },
    { name: 'มัทฉะกรีนที', categoryId: catIceCream.id, supplierId: supDairy.id, unitType: 'Scoop', costPrice: 22, sellingPrice: 75, stockQty: 50, minStock: 15 },
    { name: 'คาราเมลแมคคิอาโต้', categoryId: catIceCream.id, supplierId: supDairy.id, unitType: 'Scoop', costPrice: 20, sellingPrice: 79, stockQty: 40, minStock: 10 },
    { name: 'มิ้นต์ช็อกโกแลตชิป', categoryId: catIceCream.id, supplierId: supDairy.id, unitType: 'Scoop', costPrice: 19, sellingPrice: 65, stockQty: 5, minStock: 10, status: ProductStatus.LOW_STOCK }, // Low stock example
    // ท็อปปิ้ง
    { name: 'อัลมอนด์อบสไลด์', categoryId: catTopping.id, supplierId: supGeneral.id, unitType: 'ช้อน', costPrice: 5, sellingPrice: 15, stockQty: 200, minStock: 50 },
    { name: 'ซอสคาราเมล', categoryId: catTopping.id, supplierId: supGeneral.id, unitType: 'ปั๊ม', costPrice: 3, sellingPrice: 10, stockQty: 300, minStock: 50 },
    { name: 'บราวนี่หั่นเต๋า', categoryId: catTopping.id, supplierId: supBakery.id, unitType: 'ช้อน', costPrice: 8, sellingPrice: 20, stockQty: 150, minStock: 30 },
    // โคน
    { name: 'โคนวาฟเฟิล (Waffle Cone)', categoryId: catCone.id, supplierId: supBakery.id, unitType: 'ชิ้น', costPrice: 5, sellingPrice: 15, stockQty: 100, minStock: 20 },
    { name: 'โคนธรรมดา (Sugar Cone)', categoryId: catCone.id, supplierId: supBakery.id, unitType: 'ชิ้น', costPrice: 2, sellingPrice: 0, stockQty: 200, minStock: 50 }, // แถมฟรีในชุด
    // เครื่องดื่ม
    { name: 'น้ำแร่ธรรมชาติ', categoryId: catBeverage.id, supplierId: supGeneral.id, unitType: 'ขวด', costPrice: 10, sellingPrice: 20, stockQty: 50, minStock: 20 },
    { name: 'น้ำส้มคั้นสด', categoryId: catBeverage.id, supplierId: supGeneral.id, unitType: 'ขวด', costPrice: 25, sellingPrice: 45, stockQty: 30, minStock: 10 },
    // ภาชนะ
    { name: 'ถ้วยกระดาษไซส์ M', categoryId: catContainer.id, supplierId: supGeneral.id, unitType: 'ใบ', costPrice: 2, sellingPrice: 0, stockQty: 500, minStock: 100 },
    { name: 'กล่องเก็บความเย็นกลับบ้าน', categoryId: catContainer.id, supplierId: supGeneral.id, unitType: 'กล่อง', costPrice: 15, sellingPrice: 25, stockQty: 100, minStock: 30 },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // 6. Create Customers
  for (let i = 1; i <= 10; i++) {
    await prisma.customer.create({
      data: {
        name: `ลูกค้าคนที่ ${i}`, phone: `08100000${i.toString().padStart(2, '0')}`,
        memberTier: i > 8 ? MemberTier.PLATINUM : i > 5 ? MemberTier.GOLD : MemberTier.GENERAL,
        points: Math.floor(Math.random() * 500)
      }
    });
  }

  // 7. Create Promotions
  await prisma.promotion.create({
    data: {
      name: 'ฉลองเปิดร้าน ลด 10%', discountType: DiscountType.PERCENTAGE, discountValue: 10,
      startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: PromoStatus.ACTIVE
    }
  });

  await prisma.promotion.create({
    data: {
      name: 'ส่วนลดท้ายบิล 50 บาท', discountType: DiscountType.FIXED_AMOUNT, discountValue: 50,
      startDate: new Date('2026-10-01'), endDate: new Date('2026-10-31'), status: PromoStatus.ACTIVE
    }
  });

  console.log('Seeding completed successfully! 🍦');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });