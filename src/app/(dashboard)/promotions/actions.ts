"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPromotions() {
  try {
    return await prisma.promotion.findMany({
      include: {
        _count: { select: { orders: true } } // นับจำนวนออเดอร์ที่ใช้โปรโมชั่นนี้
      },
      orderBy: { startDate: 'desc' },
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}

export async function savePromotion(data: any, id?: string) {
  try {
    const promoData = {
      name: data.name,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status,
    };

    if (id) {
      await prisma.promotion.update({ where: { id }, data: promoData });
    } else {
      await prisma.promotion.create({ data: promoData });
    }

    revalidatePath("/promotions");
    revalidatePath("/pos"); // อัปเดตฝั่ง POS ด้วยเพื่อให้โปรโมชั่นใหม่ไปโผล่
    return { success: true };
  } catch (error) {
    console.error("Save promotion error:", error);
    return { success: false, error: "ไม่สามารถบันทึกโปรโมชั่นได้" };
  }
}

export async function deletePromotion(id: string) {
  try {
    const orderCount = await prisma.order.count({ where: { promoId: id } });
    
    if (orderCount > 0) {
      // ถ้าเคยมีคนใช้โปรนี้แล้ว ห้ามลบเด็ดขาด ให้เปลี่ยนสถานะเป็นหมดอายุแทน
      await prisma.promotion.update({
        where: { id },
        data: { status: "EXPIRED" }
      });
      revalidatePath("/promotions");
      return { success: true, message: "โปรโมชั่นนี้ถูกใช้งานไปแล้ว ระบบจึงเปลี่ยนสถานะเป็น 'หมดอายุ' แทนการลบข้อมูลถาวร" };
    }

    await prisma.promotion.delete({ where: { id } });
    revalidatePath("/promotions");
    return { success: true, message: "ลบโปรโมชั่นสำเร็จ" };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}