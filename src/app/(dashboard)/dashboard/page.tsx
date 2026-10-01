import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Store, Wallet, Receipt, Users, Package, 
  TrendingUp, AlertCircle, ShoppingCart, ChevronRight 
} from "lucide-react";
import { auth } from "@/auth"; // แก้เป็น "@/lib/auth" ถ้าไฟล์ auth อยู่ใน lib

export default async function DashboardPage() {
  await auth(); // ตรวจสอบสิทธิ์การเข้าถึง

  // 1. คำนวณวันที่สำหรับดึงข้อมูล "วันนี้"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 2. ดึงข้อมูลจากฐานข้อมูลจริง
  const [
    salesTodayAgg,
    ordersTodayCount,
    totalMembers,
    products,
    recentOrders
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { netTotal: true },
      where: { orderDate: { gte: today, lt: tomorrow }, paymentStatus: 'PAID' }
    }),
    prisma.order.count({
      where: { orderDate: { gte: today, lt: tomorrow } }
    }),
    prisma.customer.count(),
    prisma.product.findMany({
      select: { id: true, name: true, stockQty: true, minStock: true, unitType: true }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { orderDate: 'desc' },
      include: { customer: true }
    })
  ]);

  const salesToday = Number(salesTodayAgg._sum.netTotal || 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stockQty > 0 && p.stockQty <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stockQty === 0);

  // ข้อมูลจำลองสำหรับสินค้าขายดี (รอการเชื่อมต่อระบบ Chart ใน Phase รายงาน)
  const bestSellers = [
    { rank: "01", name: "วานิลลามาดากัสการ์", qty: "24 Scoop", total: "฿1,560" },
    { rank: "02", name: "ดาร์กช็อกโกแลตเบลเยียม", qty: "18 Scoop", total: "฿1,350" },
    { rank: "03", name: "โคนวาฟเฟิล", qty: "32 ชิ้น", total: "฿480" },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <p className="text-[#F4A5C9] font-medium text-sm mb-1">
            {today.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold text-[#361F4D]">สวัสดีตอนเช้า, ร้าน Xiumei 秀美</h1>
          <p className="text-gray-500 mt-1 text-sm">ภาพรวมร้านของคุณในวันนี้</p>
        </div>
        <Link href="/pos" className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm">
          <ShoppingCart size={18} />
          เปิดหน้าขาย
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ยอดขายวันนี้ */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">ยอดขายวันนี้</p>
            <div className="w-8 h-8 rounded-full bg-pink-50 text-[#E85D75] flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#361F4D]">฿{salesToday.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        {/* Card 2: ออเดอร์วันนี้ */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">ออเดอร์วันนี้</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#361F4D]">{ordersTodayCount}</h3>
          </div>
        </div>

        {/* Card 3: สมาชิกทั้งหมด */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">สมาชิกทั้งหมด</p>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#361F4D]">{totalMembers.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 4: สินค้าทั้งหมด */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">สินค้าทั้งหมด</p>
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#361F4D]">{totalProducts}</h3>
            {lowStockProducts.length > 0 && (
              <p className="text-xs text-yellow-600 mt-1 font-medium">{lowStockProducts.length} รายการใกล้หมด</p>
            )}
          </div>
        </div>
      </div>

      {/* แถวที่ 2: สินค้าขายดี & ต้องเติมสต๊อก */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* สินค้าขายดี */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#361F4D] text-lg">สินค้าขายดี (เดือนนี้)</h3>
            <Link href="/reports" className="text-xs font-medium text-[#E85D75] hover:underline">ดูรายงาน</Link>
          </div>
          <div className="space-y-4 flex-1">
            {bestSellers.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 font-bold text-xs flex items-center justify-center">{item.rank}</div>
                  <div>
                    <p className="font-medium text-[#361F4D] text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.qty}</p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-[#361F4D]">{item.total}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ต้องเติมสต๊อก */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#361F4D] text-lg flex items-center gap-2">
              ต้องเติมสต๊อก
              {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {lowStockProducts.length + outOfStockProducts.length}
                </span>
              )}
            </h3>
            <Link href="/inventory" className="text-xs font-medium text-[#E85D75] hover:underline">จัดการสต๊อก</Link>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
            {outOfStockProducts.map(p => (
              <div key={p.id} className="bg-red-50/50 border border-red-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-[#361F4D] text-sm">{p.name}</p>
                    <p className="text-xs text-red-500 font-medium">หมดสต๊อก!</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-md">0 {p.unitType}</span>
              </div>
            ))}
            
            {lowStockProducts.map(p => (
              <div key={p.id} className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-[#361F4D] text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">ขั้นต่ำ {p.minStock}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">เหลือ {p.stockQty}</span>
              </div>
            ))}

            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                สต๊อกสินค้าเพียงพอ ไม่มีรายการที่ต้องเติม
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ออเดอร์ล่าสุด Table */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#361F4D] text-lg">ออเดอร์ล่าสุด</h3>
          <Link href="/orders" className="text-xs font-medium text-[#E85D75] flex items-center hover:underline">
            ดูทั้งหมด <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">เลขที่</th>
                <th className="pb-3 font-medium">เวลา</th>
                <th className="pb-3 font-medium">ลูกค้า</th>
                <th className="pb-3 font-medium">ยอดรวม</th>
                <th className="pb-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="text-[#361F4D]">
                  <td className="py-3 font-medium font-mono text-xs">{order.id.substring(0, 8)}</td>
                  <td className="py-3 text-gray-500">
                    {order.orderDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </td>
                  <td className="py-3">{order.customer?.name || "ลูกค้าทั่วไป"}</td>
                  <td className="py-3 font-medium">฿{Number(order.netTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3">
                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium">
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">ยังไม่มีออเดอร์</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}