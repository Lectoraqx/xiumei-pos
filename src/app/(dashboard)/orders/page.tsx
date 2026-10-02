import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

export default async function OrderHistoryPage() {
  // ดึงข้อมูลออเดอร์พร้อมข้อมูลพนักงาน ลูกค้า และรายละเอียดสินค้า
  const orders = await prisma.order.findMany({
    include: {
      employee: true,
      customer: true, // เพิ่มการดึงข้อมูลลูกค้า
      details: {
        include: { product: true }
      }
    },
    orderBy: { orderDate: 'desc' }
  })

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <ClipboardList className="text-[#E85D75]" />
            ประวัติการขาย (Order History)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">รายการออเดอร์และการทำธุรกรรมทั้งหมดในระบบ</p>
        </div>
      </div>

      <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-bold text-[#361F4D]">รายการออเดอร์ทั้งหมดในระบบ</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-medium text-gray-500">รหัสออเดอร์</TableHead>
                <TableHead className="font-medium text-gray-500">วันที่ / เวลา</TableHead>
                <TableHead className="font-medium text-gray-500">ลูกค้า</TableHead>
                <TableHead className="font-medium text-gray-500">พนักงานผู้ทำรายการ</TableHead>
                <TableHead className="font-medium text-gray-500">รายการสินค้า</TableHead>
                <TableHead className="font-medium text-gray-500 text-right">ยอดสุทธิ</TableHead>
                <TableHead className="font-medium text-gray-500 text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {/* ลบ : any ออก ปล่อยให้ TypeScript อ่าน Type อัตโนมัติจาก Prisma */}
              {orders.map((order) => (
                <TableRow key={order.id} className="text-[#361F4D] hover:bg-gray-50/50">
                  <TableCell className="font-mono text-xs font-bold">
                    {order.id.substring(0, 10).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {new Date(order.orderDate).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.customer ? order.customer.name : <span className="text-gray-400 italic">ลูกค้าทั่วไป</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.employee.firstName} {order.employee.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {order.details.map((detail) => (
                        <div key={detail.id} className="text-gray-600">
                          • {detail.product.name} <span className="text-[#E85D75] font-bold">(x{detail.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-[#E85D75]">
                    ฿{Number(order.netTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {order.paymentStatus === 'PAID' ? 'ชำระแล้ว' : order.paymentStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList size={32} className="text-gray-300" />
                      <p>ยังไม่มีประวัติการขายในระบบ</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}