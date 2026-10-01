import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: "Missing dates" }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    // ดึงข้อมูลออเดอร์
    const orders = await prisma.order.findMany({
      where: { orderDate: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
      include: { customer: true, employee: true },
      orderBy: { orderDate: 'asc' }
    });

    // สร้าง Workbook ใหม่
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Xiumei System";

    // ==========================================
    // Sheet 1: สรุปยอดขาย (Summary)
    // ==========================================
    const summarySheet = workbook.addWorksheet("สรุปยอดขาย", { views: [{ showGridLines: false }] });
    
    // ตั้งค่าความกว้างคอลัมน์
    summarySheet.columns = [
      { header: "หัวข้อ", key: "topic", width: 25 },
      { header: "ข้อมูล", key: "value", width: 20 },
    ];

    // ตกแต่ง Header
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4A2B63" } };

    // ใส่ข้อมูลสรุป
    const totalSales = orders.reduce((sum, o) => sum + Number(o.netTotal), 0);
    summarySheet.addRow({ topic: "ช่วงวันที่", value: `${startDateStr} ถึง ${endDateStr}` });
    summarySheet.addRow({ topic: "จำนวนบิลทั้งหมด", value: orders.length });
    summarySheet.addRow({ topic: "ยอดขายสุทธิรวม", value: totalSales });
    
    // จัดฟอร์แมตตัวเลขสกุลเงิน (แถวที่ 4 คอลัมน์ 2)
    summarySheet.getCell("B4").numFmt = '"฿"#,##0.00';

    // ==========================================
    // Sheet 2: รายละเอียดการขาย (Sales Detail)
    // ==========================================
    const detailSheet = workbook.addWorksheet("รายละเอียดการขาย");
    detailSheet.columns = [
      { header: "รหัสออเดอร์", key: "orderId", width: 15 },
      { header: "วันที่-เวลา", key: "date", width: 20 },
      { header: "พนักงาน", key: "employee", width: 20 },
      { header: "ลูกค้า", key: "customer", width: 20 },
      { header: "วิธีชำระเงิน", key: "payment", width: 15 },
      { header: "ยอดสุทธิ", key: "netTotal", width: 15 },
    ];

    detailSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    detailSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE85D75" } };

    orders.forEach(order => {
      detailSheet.addRow({
        orderId: order.id.substring(0, 8),
        date: order.orderDate.toLocaleString("th-TH"),
        employee: order.employee.firstName,
        customer: order.customer?.name || "ลูกค้าทั่วไป",
        payment: order.paymentMethod,
        netTotal: Number(order.netTotal),
      });
    });

    // จัดฟอร์แมตสกุลเงินทั้งคอลัมน์ F
    detailSheet.getColumn("netTotal").numFmt = '"฿"#,##0.00';

    // แปลงไฟล์เป็น Buffer แล้วส่งกลับ
    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="Xiumei_SalesReport_${startDateStr}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}