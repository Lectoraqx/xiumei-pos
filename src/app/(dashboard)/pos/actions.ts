"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod, PaymentStatus, OrderType } from "@prisma/client";

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
}

export async function processCheckout(data: CheckoutData) {
  try {
    // ใช้ Transaction เพื่อความปลอดภัยของข้อมูล (กฎข้อ 49 และ 64)
    const result = await prisma.$transaction(async (tx) => {
      // 1. สร้าง Order
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
          paymentStatus: PaymentStatus.PAID, // ชำระเงินสำเร็จทันที
        },
      });

      // 2. สร้าง Order Details และตัด Stock สินค้า
      for (const item of data.items) {
        // ตรวจสอบ Stock ปัจจุบัน
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stockQty < item.quantity) {
          throw new Error(`สินค้า ${product?.name || item.productId} มีสต๊อกไม่เพียงพอ`);
        }

        const stockBefore = product.stockQty;
        const stockAfter = stockBefore - item.quantity;

        // สร้าง Order Detail
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

        // ตัด Stock สินค้า
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stockQty: stockAfter,
            status: stockAfter === 0 ? "OUT_OF_STOCK" : stockAfter <= product.minStock ? "LOW_STOCK" : "AVAILABLE"
          },
        });

        // บันทึก Stock Movement (กฎข้อ 10)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            reason: `ขายหน้าร้าน Order ID: ${order.id}`,
            employeeId: data.employeeId,
          },
        });
      }

      // 3. ถ้ามีลูกค้าสมาชิก ให้บวกแต้มสะสม (กฎข้อ 21: ทุก 10 บาท = 1 แต้ม)
      if (data.customerId) {
        const earnedPoints = Math.floor(Number(data.netTotal) / 10);
        if (earnedPoints > 0) {
          await tx.customer.update({
            where: { id: data.customerId },
            data: { points: { increment: earnedPoints } },
          });

          await tx.pointTransaction.create({
            data: {
              customerId: data.customerId,
              points: earnedPoints,
              description: `ได้รับแต้มจากการซื้อสินค้า Order: ${order.id}`,
            },
          });
        }
      }

      return order;
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { success: true, orderId: result.id };
  } catch (error: any) {
    console.error("Checkout error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการชำระเงิน" };
  }
}