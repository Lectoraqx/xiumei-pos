"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function processCheckout(cart: any[]) {
  try {
    // 1. ตรวจสอบว่าพนักงานคนไหนเป็นคนทำรายการ
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "ไม่พบข้อมูลพนักงานในระบบ กรุณาล็อกอินใหม่" }
    }

    // คำนวณยอดรวมอีกครั้งฝั่งเซิร์ฟเวอร์เพื่อความปลอดภัย (เติมเครื่องหมายคูณ *)
    const netTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

    // 2. ใช้ Transaction บันทึกข้อมูลและตัดสต็อกพร้อมกัน
    const order = await prisma.$transaction(async (tx) => {
      
      // 2.1 สร้างข้อมูลใบเสร็จ (Order)
      const newOrder = await tx.order.create({
        data: {
          employeeId: session.user.id, // รหัสพนักงานที่ล็อกอินอยู่
          orderType: "TAKEAWAY",       // กำหนดค่าเริ่มต้นเป็นกลับบ้าน (สามารถเพิ่มปุ่มเลือกทีหลังได้)
          subtotal: netTotal,
          netTotal: netTotal,
          paymentMethod: "CASH",       // กำหนดค่าเริ่มต้นเป็นเงินสด
          paymentStatus: "PAID",       // สถานะจ่ายเงินแล้ว
          // 2.2 สร้างข้อมูลรายละเอียดสินค้าในบิล (OrderDetail) ซ้อนเข้าไปเลย
          details: {
            create: cart.map(item => ({
              productId: item.id,
              quantity: item.qty,
              unitPrice: item.price,
              totalPrice: item.price * item.qty, // เติมเครื่องหมายคูณ *
            }))
          }
        }
      })

      // 2.3 ตัดสต็อกสินค้าตามจำนวนที่ขายไป
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: item.qty } }
        })
      }

      return newOrder
    })

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Checkout Error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล" }
  }
}