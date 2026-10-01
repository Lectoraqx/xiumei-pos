"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MemberTier } from "@prisma/client";

export async function getMembers() {
  try {
    return await prisma.customer.findMany({
      include: {
        _count: { select: { orders: true } }, // นับจำนวนบิลของลูกค้ารายนี้
      },
      orderBy: { registerDate: 'desc' },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}

export async function saveMember(data: any, id?: string) {
  try {
    // เช็คเบอร์โทรซ้ำ
    const existing = await prisma.customer.findUnique({
      where: { phone: data.phone },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้วในระบบ" };
    }

    const memberData = {
      name: data.name,
      phone: data.phone,
      memberTier: data.memberTier as MemberTier,
      points: Number(data.points) || 0,
    };

    if (id) {
      await prisma.customer.update({ where: { id }, data: memberData });
    } else {
      await prisma.customer.create({ data: memberData });
    }

    revalidatePath("/members");
    revalidatePath("/pos"); // ควรอัปเดตหน้า POS ด้วยเพราะต้องดึงลูกค้าไปเลือก
    return { success: true };
  } catch (error) {
    console.error("Save member error:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลสมาชิกได้" };
  }
}

export async function deleteMember(id: string) {
  try {
    // กฎข้อ 30: ห้ามลบ Customer ที่มี Order
    const orderCount = await prisma.order.count({ where: { customerId: id } });
    if (orderCount > 0) {
      return { success: false, error: `ไม่สามารถลบได้ เนื่องจากลูกค้ารายนี้มีประวัติการซื้อ ${orderCount} บิล` };
    }

    await prisma.customer.delete({ where: { id } });
    revalidatePath("/members");
    return { success: true, message: "ลบข้อมูลสมาชิกลูกค้าสำเร็จ" };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}