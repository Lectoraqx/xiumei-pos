"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function saveProduct(data: any, productId?: string) {
  try {
    // คำนวณ Status อัตโนมัติจาก Stock
    const status = data.stockQty === 0 
      ? "OUT_OF_STOCK" 
      : data.stockQty <= data.minStock 
        ? "LOW_STOCK" 
        : "AVAILABLE";

    const productData = {
      name: data.name,
      categoryId: data.categoryId,
      supplierId: data.supplierId || null,
      unitType: data.unitType,
      costPrice: Number(data.costPrice),
      sellingPrice: Number(data.sellingPrice),
      stockQty: Number(data.stockQty),
      minStock: Number(data.minStock),
      status: status as any,
    };

    if (productId) {
      await prisma.product.update({ where: { id: productId }, data: productData });
    } else {
      await prisma.product.create({ data: productData });
    }

    revalidatePath("/products");
    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Save product error:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลสินค้าได้" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // กฎข้อ 30: ห้ามลบ Product ที่มีประวัติการขาย (Order Detail)
    const orderCount = await prisma.orderDetail.count({ where: { productId: id } });
    if (orderCount > 0) {
      // ถ้ามีประวัติให้ใช้วิธี Soft Delete โดยเปลี่ยนสถานะเป็น DISCONTINUED (ปิดการขาย)
      await prisma.product.update({
        where: { id },
        data: { status: "DISCONTINUED" }
      });
      revalidatePath("/products");
      return { success: true, message: "สินค้านี้มีประวัติการขาย ระบบจึงทำการ 'ปิดการขาย' แทนการลบข้อมูลถาวร" };
    }

    // ถ้าไม่มีประวัติ สามารถลบถาวรได้
    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
    return { success: true, message: "ลบสินค้าสำเร็จ" };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบสินค้า" };
  }
}