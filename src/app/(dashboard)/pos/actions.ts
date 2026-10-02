"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod, PaymentStatus, OrderType, MemberTier } from "@prisma/client";

interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

interface CheckoutData {
  employeeId: string;
  customerId?: string;
  promoId?: string;
  orderType: OrderType;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  discount: number;
  tax: number;
  subtotal: number;
  netTotal: number;
  rewardType?: string; 
}

export async function processCheckout(data: CheckoutData) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบและหักแต้มสะสมกรณีมีการแลกสิทธิพิเศษ
      if (data.customerId && data.rewardType) {
        let pointsToDeduct = 0;
        let redeemDescription = "";

        if (data.rewardType === "discount_20") {
          pointsToDeduct = 250;
          redeemDescription = "แลกแต้มรับส่วนลด 20 บาท";
        } else if (data.rewardType === "free_doll") {
          pointsToDeduct = 1000;
          redeemDescription = "แลกแต้มรับตุ๊กตา Xiumei ฟรี";
        }

        if (pointsToDeduct > 0) {
          const customer = await tx.customer.findUnique({
            where: { id: data.customerId },
          });

          if (!customer || customer.points < pointsToDeduct) {
            throw new Error("แต้มสะสมของลูกค้าไม่เพียงพอสำหรับการแลกสิทธิ์");
          }

          // หักแต้มลูกค้าและบันทึกประวัติ
          await tx.customer.update({
            where: { id: data.customerId },
            data: { points: { decrement: pointsToDeduct } },
          });

          await tx.pointTransaction.create({
            data: {
              customerId: data.customerId,
              points: -pointsToDeduct,
              description: redeemDescription,
            },
          });
        }
      }

      // 2. สร้าง Order พร้อมรายละเอียด
      const order = await tx.order.create({
        data: {
          employeeId: data.employeeId,
          customerId: data.customerId || null,
          promoId: data.promoId || null,
          orderType: data.orderType,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          netTotal: data.netTotal,
          paymentMethod: data.paymentMethod,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      // 3. จัดการรายการสินค้า ตัดสต๊อก และบันทึกประวัติสต๊อก
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stockQty < item.quantity) {
          throw new Error(`สินค้าสต๊อกไม่เพียงพอ`);
        }

        const stockBefore = product.stockQty;
        const stockAfter = stockBefore - item.quantity;

        // บันทึกรายการลงบิล
        await tx.orderDetail.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            note: item.note,
          },
        });

        // อัปเดตยอดและสถานะสต๊อก
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stockQty: stockAfter,
            status: stockAfter === 0 ? "OUT_OF_STOCK" : stockAfter <= product.minStock ? "LOW_STOCK" : "AVAILABLE"
          },
        });

        // บันทึกความเคลื่อนไหว (Stock Movement)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            reason: `ขายหน้าร้าน (บิล #${order.id.slice(-6).toUpperCase()})`,
            employeeId: data.employeeId,
          },
        });
      }

      // 4. สะสมแต้มและอัปเดตระดับสมาชิก (Tier)
      if (data.customerId) {
        // ทุกยอดซื้อ 2 บาท = 1 แต้ม
        const earnedPoints = Math.floor(Number(data.netTotal) / 2);

        const updatedCustomer = await tx.customer.update({
          where: { id: data.customerId },
          data: {
            points: { increment: earnedPoints },
            totalSpent: { increment: data.netTotal },
          },
        });

        if (earnedPoints > 0) {
          await tx.pointTransaction.create({
            data: {
              customerId: data.customerId,
              points: earnedPoints,
              description: `ได้รับแต้มจากการซื้อสินค้า (บิล #${order.id.slice(-6).toUpperCase()})`,
            },
          });
        }

        // ตรวจสอบเพื่ออัปเกรดสถานะสมาชิก
        const spent = Number(updatedCustomer.totalSpent);
        let newTier: MemberTier = MemberTier.GENERAL;
        if (spent >= 10000) {
          newTier = MemberTier.PLATINUM;
        } else if (spent >= 3000) {
          newTier = MemberTier.GOLD;
        }

        if (newTier !== updatedCustomer.tier) {
          await tx.customer.update({
            where: { id: data.customerId },
            data: { tier: newTier },
          });
        }
      }

      return order;
    });

    // รีเฟรชข้อมูลที่เกี่ยวข้องในระบบทั้งหมด
    revalidatePath("/pos");
    revalidatePath("/orders");
    revalidatePath("/members");
    revalidatePath("/promotions");
    
    return { success: true, orderId: result.id };
  } catch (error: any) {
    console.error("Checkout error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการชำระเงิน" };
  }
}