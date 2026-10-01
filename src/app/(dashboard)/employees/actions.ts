"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // 1. Import bcryptjs เข้ามาใช้งาน

export async function getEmployees() {
  try {
    return await prisma.employee.findMany({
      include: {
        _count: { select: { orders: true } } 
      },
      orderBy: { firstName: 'asc' },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

export async function saveEmployee(data: any, id?: string) {
  try {
    const existing = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "อีเมลนี้มีในระบบแล้ว" };
    }

    // 2. เตรียมโครงสร้างข้อมูลพื้นฐาน (ยังไม่รวมรหัสผ่าน)
    const employeeData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
      status: data.status,
    };

    // 3. ตรวจสอบและเข้ารหัสผ่าน (Haching) หากมีการส่งรหัสผ่านเข้ามา
    if (data.password) {
      const saltRounds = 10; // ระดับความซับซ้อนของการเข้ารหัส (ยิ่งเยอะยิ่งปลอดภัยแต่ทำงานช้าลง 10 คือมาตรฐาน)
      employeeData.passwordHash = await bcrypt.hash(data.password, saltRounds);
    }

    if (id) {
      // กรณี Update: ถ้าไม่ได้ส่งรหัสผ่านใหม่มา employeeData จะไม่มีฟิลด์ passwordHash 
      // ทำให้รหัสผ่านเดิมในฐานข้อมูลไม่ถูกทับ
      await prisma.employee.update({ where: { id }, data: employeeData });
    } else {
      // กรณี Create: บังคับว่าต้องมีรหัสผ่านก่อนถึงจะสร้างได้
      if (!data.password) {
        return { success: false, error: "กรุณาตั้งรหัสผ่านสำหรับพนักงานใหม่" };
      }
      await prisma.employee.create({ data: employeeData });
    }

    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    console.error("Save employee error:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลพนักงานได้" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const orderCount = await prisma.order.count({ where: { employeeId: id } });
    if (orderCount > 0) {
      await prisma.employee.update({
        where: { id },
        data: { status: "INACTIVE" }
      });
      revalidatePath("/employees");
      return { success: true, message: "พนักงานคนนี้มีประวัติการขาย ระบบจึงเปลี่ยนสถานะเป็น 'ระงับการใช้งาน' แทนการลบ" };
    }

    await prisma.employee.delete({ where: { id } });
    revalidatePath("/employees");
    return { success: true, message: "ลบข้อมูลพนักงานสำเร็จ" };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}