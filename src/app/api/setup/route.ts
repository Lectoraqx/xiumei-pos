import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const newHash = await bcrypt.hash("123456", 10)
    
    await prisma.employee.update({
      where: { email: "admin@pos.com" },
      data: { passwordHash: newHash }
    })

    return NextResponse.json({ message: "รีเซ็ตรหัสผ่านเป็น 123456 สำเร็จแล้ว!" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" })
  }
}