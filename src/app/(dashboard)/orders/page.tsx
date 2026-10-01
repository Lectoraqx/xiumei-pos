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
  const orders = await prisma.order.findMany({
    include: {
      employee: true,
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
                <TableHead className="font-medium text-gray-500">พนักงานผู้ทำรายการ</TableHead>
                <TableHead className="font-medium text-gray-500">รายการสินค้า</TableHead>
                <TableHead className="font-medium text-gray-500 text-right">ยอดสุทธิ</TableHead>
                <TableHead className="font-medium text-gray-500">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {/* เติม : any ตรงนี้เพื่อแก้ Error 7006 */}
              {orders.map((order: any) => (
                <TableRow key={order.id} className="text-[#361F4D] hover:bg-gray-50/50">
                  <TableCell className="font-mono text-xs font-semibold">{order.id.substring(0, 10)}...</TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(order.orderDate).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>{order.employee.firstName} {order.employee.lastName}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {/* เติม : any ตรงนี้เพื่อแก้ Error 7006 */}
                      {order.details.map((detail: any) => (
                        <div key={detail.id} className="text-gray-600">
                          • {detail.product.name} (x{detail.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#361F4D]">
                    ฿{Number(order.netTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
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