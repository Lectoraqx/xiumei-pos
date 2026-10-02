"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({
      include: {
        _count: { select: { products: true } } // นับว่า Supplier เจ้านี้มีสินค้าของเรากี่ตัว
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function saveSupplier(data: any, id?: string) {
  try {
    const supplierData = {
      name: data.name,
      contactName: data.contactName || null,
      phone: data.phone || null,
      address: data.address || null,
    };

    if (id) {
      await prisma.supplier.update({ where: { id }, data: supplierData });
    } else {
      await prisma.supplier.create({ data: supplierData });
    }

    revalidatePath("/suppliers");
    revalidatePath("/products"); // อัปเดตหน้าสินค้าด้วย เผื่อมีการเปลี่ยนชื่อ
    return { success: true };
  } catch (error) {
    console.error("Save supplier error:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลซัพพลายเออร์ได้" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    // กฎ: ห้ามลบ Supplier ที่ยังมีสินค้าผูกอยู่
    const productCount = await prisma.product.count({ where: { supplierId: id } });
    
    if (productCount > 0) {
      return { 
        success: false, 
        error: `ไม่สามารถลบได้ เนื่องจากซัพพลายเออร์รายนี้ถูกผูกไว้กับสินค้า ${productCount} รายการ (กรุณาเปลี่ยน Supplier ของสินค้าเหล่านั้นก่อน)` 
      };
    }

    await prisma.supplier.delete({ where: { id } });
    revalidatePath("/suppliers");
    return { success: true, message: "ลบข้อมูลซัพพลายเออร์สำเร็จ" };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}