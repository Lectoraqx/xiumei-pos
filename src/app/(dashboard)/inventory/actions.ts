"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. ดึงข้อมูลคลังสินค้าทั้งหมด
export async function getInventory() {
  try {
    return await prisma.product.findMany({
      include: { category: true, supplier: true },
      orderBy: { stockQty: 'asc' }, // เรียงจากสต๊อกน้อยไปมาก จะได้เห็นของจะหมดก่อน
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}

// 2. ฟังก์ชันปรับสต๊อกแบบมีประวัติ (Stock Movement)
export async function adjustStock(data: {
  productId: string;
  type: "STOCK_IN" | "ADJUST_ADD" | "ADJUST_MINUS" | "WASTE";
  quantity: number;
  reason: string;
  employeeId: string;
}) {
  try {
    if (data.quantity <= 0) return { success: false, error: "จำนวนต้องมากกว่า 0" };

    const result = await prisma.$transaction(async (tx) => {
      // ดึงสต๊อกปัจจุบัน
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new Error("ไม่พบสินค้า");

      const stockBefore = product.stockQty;
      let stockAfter = stockBefore;

      // คำนวณสต๊อกใหม่
      if (data.type === "STOCK_IN" || data.type === "ADJUST_ADD") {
        stockAfter = stockBefore + data.quantity;
      } else if (data.type === "ADJUST_MINUS" || data.type === "WASTE") {
        if (stockBefore < data.quantity) throw new Error("สต๊อกปัจจุบันมีไม่เพียงพอให้ปรับลด");
        stockAfter = stockBefore - data.quantity;
      }

      // อัปเดตสถานะสินค้าตามสต๊อกที่เหลือ
      const newStatus = stockAfter === 0 ? "OUT_OF_STOCK" : stockAfter <= product.minStock ? "LOW_STOCK" : "AVAILABLE";

      // 1. อัปเดต Product
      await tx.product.update({
        where: { id: data.productId },
        data: { stockQty: stockAfter, status: newStatus },
      });

      // 2. สร้าง Stock Movement
      await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          stockBefore,
          stockAfter,
          reason: data.reason,
          employeeId: data.employeeId,
        },
      });

      return stockAfter;
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, newStock: result };
  } catch (error: any) {
    console.error("Stock adjustment error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการปรับสต๊อก" };
  }
}