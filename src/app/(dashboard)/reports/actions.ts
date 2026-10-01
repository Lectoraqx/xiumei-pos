"use server";

import prisma from "@/lib/prisma";

export async function getReportSummary(startDateStr: string, endDateStr: string) {
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999); // ให้ครอบคลุมถึงสิ้นวันของวันสุดท้าย

    // 1. ดึงยอดขายและจำนวนบิล (เฉพาะบิลที่จ่ายแล้ว)
    const salesAgg = await prisma.order.aggregate({
      _sum: { netTotal: true, discount: true, tax: true },
      _count: { id: true },
      where: { orderDate: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' }
    });

    const totalSales = Number(salesAgg._sum.netTotal || 0);
    const totalDiscount = Number(salesAgg._sum.discount || 0);
    const totalOrders = salesAgg._count.id;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // 2. ดึงต้นทุนของเสีย
    const wasteAgg = await prisma.wasteLog.aggregate({
      _sum: { costLost: true },
      where: { dateReported: { gte: startDate, lte: endDate } }
    });
    const totalWasteCost = Number(wasteAgg._sum.costLost || 0);

    // 3. ดึงสินค้าใกล้หมดสต๊อก
    const lowStockCount = await prisma.product.count({
      where: { stockQty: { gt: 0, lte: prisma.product.fields.minStock } } // สต๊อกมากกว่า 0 แต่น้อยกว่าหรือเท่ากับ Min Stock
    });

    // 4. เตรียมข้อมูลกราฟยอดขายรายวัน
    const orders = await prisma.order.findMany({
      select: { orderDate: true, netTotal: true },
      where: { orderDate: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
      orderBy: { orderDate: 'asc' }
    });

    // จัดกลุ่มยอดขายตามวัน (สำหรับ Recharts)
    const salesDataMap: Record<string, number> = {};
    orders.forEach(order => {
      const dateStr = order.orderDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
      salesDataMap[dateStr] = (salesDataMap[dateStr] || 0) + Number(order.netTotal);
    });

    const chartData = Object.keys(salesDataMap).map(date => ({
      date,
      sales: salesDataMap[date]
    }));

    return {
      success: true,
      data: {
        totalSales,
        totalOrders,
        avgTicket,
        totalDiscount,
        totalWasteCost,
        lowStockCount,
        chartData
      }
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลรายงานได้" };
  }
}