"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ดึงข้อมูลทั้งหมด
export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function createCategory(formData: { name: string; description?: string }) {
  try {
    if (!formData.name) return { success: false, error: "กรุณากรอกชื่อหมวดหมู่" };
    await prisma.category.create({ data: { name: formData.name, description: formData.description } });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลได้" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) return { success: false, error: `มีสินค้าใช้งานอยู่ ${productCount} รายการ` };
    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}

export async function updateCategory(id: string, formData: { name: string; description?: string }) {
  try {
    if (!formData.name) return { success: false, error: "กรุณากรอกชื่อหมวดหมู่" };
    await prisma.category.update({ 
      where: { id }, 
      data: { name: formData.name, description: formData.description } 
    });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: "ไม่สามารถอัปเดตข้อมูลได้" };
  }
}