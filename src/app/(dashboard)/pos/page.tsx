import prisma from "@/lib/prisma";
import PosClient from "./pos-client";
import { auth } from "@/auth";

export default async function PosPage() {
  const session = await auth();
  
  // ดึงสินค้าและหมวดหมู่จริงจาก Database
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

  const employeeId = session?.user?.id || "";

  return (
    <PosClient 
      initialProducts={products} 
      categories={categories} 
      customers={customers}
      employeeId={employeeId}
    />
  );
}