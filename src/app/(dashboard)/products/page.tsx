import prisma from "@/lib/prisma";
import ProductsClient from "./products-client";
import { auth } from "@/auth"; // หรือ "@/lib/auth" 

export default async function ProductsPage() {
  await auth(); // ป้องกันการเข้าถึงถ้าไม่ได้ล็อกอิน

  // โหลดข้อมูลทั้งหมดที่จำเป็นสำหรับหน้าจัดการสินค้าแบบขนาน (Parallel) เพื่อความรวดเร็ว
  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <ProductsClient 
      initialProducts={products} 
      categories={categories} 
      suppliers={suppliers} 
    />
  );
}