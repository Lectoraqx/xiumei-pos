import { getWasteLogs } from "./actions";
import WasteClient from "./waste-client";
import { auth } from "@/auth"; // หรือ "@/lib/auth" 
import prisma from "@/lib/prisma";

export default async function WastePage() {
  const session = await auth();
  
  // โหลดประวัติของเสีย และ สินค้าที่มีในสต๊อก (เพื่อนำไปโชว์ใน Dropdown ตอนบันทึกของเสีย)
  const [wasteLogs, products] = await Promise.all([
    getWasteLogs(),
    prisma.product.findMany({
      where: { stockQty: { gt: 0 } }, // แก้ไขตรงนี้จาก { >: 0 } เป็น { gt: 0 }
      orderBy: { name: 'asc' }
    })
  ]);

  const employeeId = session?.user?.id || "";

  return (
    <WasteClient 
      initialWasteLogs={wasteLogs} 
      products={products} 
      employeeId={employeeId} 
    />
  );
}