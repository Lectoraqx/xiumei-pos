import PosClient from "./pos-client";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export default async function PosPage() {
  const session = await auth();
  
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  });
  
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' }
  });

  const today = new Date();
  const promotions = await prisma.promotion.findMany({
    where: { status: "ACTIVE", startDate: { lte: today }, endDate: { gte: today } },
    orderBy: { name: 'asc' }
  });

  // 1. เพิ่มการดึงข้อมูลของรางวัลที่เปิดใช้งานอยู่
  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: { pointsRequired: 'asc' }
  });

  const employeeId = session?.user?.id || "ทดสอบ-ID-พนักงาน"; 

  return (
    <PosClient 
      initialProducts={products} 
      categories={categories} 
      customers={customers}
      promotions={promotions}
      rewards={rewards} // 2. ส่ง prop เข้าไปให้ Client
      employeeId={employeeId}
    />
  );
}