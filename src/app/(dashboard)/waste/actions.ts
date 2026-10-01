"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MovementType } from "@prisma/client";

export async function getWasteLogs() {
  try {
    return await prisma.wasteLog.findMany({
      include: {
        product: true,
        employee: true,
      },
      orderBy: { dateReported: 'desc' },
    });
  } catch (error) {
    console.error("Error fetching waste logs:", error);
    return [];
  }
}

export async function recordWaste(data: {
  productId: string;
  quantity: number;
  reason: string;
  employeeId: string;
}) {
  try {
    if (data.quantity <= 0) return { success: false, error: "จำนวนต้องมากกว่า 0" };

    await prisma.$transaction(async (tx) => {
      // 1. ดึงข้อมูลสินค้าเพื่อดูต้นทุน (Cost) และสต๊อกปัจจุบัน
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new Error("ไม่พบข้อมูลสินค้า");
      if (product.stockQty < data.quantity) {
        throw new Error(`สต๊อกสินค้าไม่เพียงพอ (ปัจจุบันมี ${product.stockQty} ${product.unitType})`);
      }

      const costLost = Number(product.costPrice) * data.quantity;
      const stockBefore = product.stockQty;
      const stockAfter = stockBefore - data.quantity;
      const newStatus = stockAfter === 0 ? "OUT_OF_STOCK" : stockAfter <= product.minStock ? "LOW_STOCK" : "AVAILABLE";

      // 2. อัปเดตสต๊อกสินค้า
      await tx.product.update({
        where: { id: data.productId },
        data: { stockQty: stockAfter, status: newStatus },
      });

      // 3. สร้าง Waste Log
      const waste = await tx.wasteLog.create({
        data: {
          productId: data.productId,
          employeeId: data.employeeId,
          quantity: data.quantity,
          reason: data.reason,
          costLost: costLost,
        },
      });

      // 4. บันทึก Stock Movement (ประเภท WASTE)
      await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: MovementType.WASTE,
          quantity: data.quantity,
          stockBefore,
          stockAfter,
          reason: `บันทึกของเสีย: ${data.reason} (รหัส: ${waste.id})`,
          employeeId: data.employeeId,
        },
      });
    });

    revalidatePath("/waste");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Record waste error:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกข้อมูลของเสียได้" };
  }
}