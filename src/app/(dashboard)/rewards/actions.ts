"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RewardType } from "@prisma/client";

export async function getRewards() {
  try {
    return await prisma.reward.findMany({
      orderBy: { pointsRequired: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return [];
  }
}

export async function saveReward(data: any, id?: string) {
  try {
    const rewardData = {
      name: data.name,
      pointsRequired: Number(data.pointsRequired),
      rewardType: data.rewardType as RewardType,
      discountValue: data.rewardType === "DISCOUNT" ? Number(data.discountValue) : null,
      isActive: data.isActive,
    };

    if (id) {
      await prisma.reward.update({ where: { id }, data: rewardData });
    } else {
      await prisma.reward.create({ data: rewardData });
    }

    revalidatePath("/rewards");
    revalidatePath("/pos"); // อัปเดตให้หน้า POS ดึงของรางวัลใหม่ไปใช้
    return { success: true };
  } catch (error) {
    console.error("Save reward error:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลของรางวัลได้" };
  }
}

export async function deleteReward(id: string) {
  try {
    await prisma.reward.delete({ where: { id } });
    revalidatePath("/rewards");
    revalidatePath("/pos");
    return { success: true, message: "ลบของรางวัลสำเร็จ" };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}