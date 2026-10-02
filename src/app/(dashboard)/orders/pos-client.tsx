"use client";

import React, { useState } from "react";
import { Search, Receipt, Calendar, User, Eye, X, Tag } from "lucide-react";

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // State สำหรับควบคุม Popup ดูรายละเอียดบิล
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrders = initialOrders.filter((order) => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ฟังก์ชันเปิด Popup
  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-10 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Receipt className="text-[#E85D75]" /> ประวัติการขาย (Orders)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">ตรวจสอบบิลและยอดขายย้อนหลัง</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="ค้นหาเลขที่บิล หรือ ชื่อลูกค้า..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-[#FDFBF7] border border-gray-100 rounded-full focus:outline-none focus:border-[#E85D75] transition-colors text-sm"
          />
        </div>
        <div className="text-sm text-gray-500">
          ทั้งหมด <span className="font-bold text-[#361F4D]">{filteredOrders.length}</span> บิล
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">เลขที่บิล</th>
                <th className="px-6 py-4 font-medium">วันที่ / เวลา</th>
                <th className="px-6 py-4 font-medium">ลูกค้า</th>
                <th className="px-6 py-4 font-medium text-center">ประเภท</th>
                <th className="px-6 py-4 font-medium text-right">ยอดสุทธิ (บาท)</th>
                <th className="px-6 py-4 font-medium text-center">พนักงาน</th>
                <th className="px-6 py-4 font-medium text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar size={14} />
                      {new Date(order.orderDate).toLocaleString("th-TH")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.customer ? <span className="font-bold">{order.customer.name}</span> : <span className="text-gray-400 italic">ลูกค้าทั่วไป</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.orderType === "DINE_IN" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                      {order.orderType === "DINE_IN" ? "ทานที่ร้าน" : "กลับบ้าน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-extrabold text-[#E85D75]">
                      ฿{Number(order.netTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs">
                    <div className="flex items-center justify-center gap-1">
                      <User size={14} /> {order.employee?.firstName || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openOrderDetails(order)} className="px-3 py-1.5 text-[#E85D75] bg-pink-50 hover:bg-[#E85D75] hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                        <Eye size={14} /> ดูบิล
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Receipt size={32} className="mx-auto mb-3 opacity-20" />ไม่พบประวัติการขาย
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ดูรายละเอียดบิล */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <div>
                <h3 className="font-bold text-lg text-[#361F4D]">รายละเอียดบิล</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">#{selectedOrder.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm border-b border-gray-50 pb-4">
                <div className="space-y-1">
                  <p className="text-gray-500">วันที่ทำรายการ</p>
                  <p className="font-medium text-[#361F4D]">{new Date(selectedOrder.orderDate).toLocaleString("th-TH")}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-gray-500">พนักงานขาย</p>
                  <p className="font-medium text-[#361F4D]">{selectedOrder.employee?.firstName}</p>
                </div>
              </div>

              {/* สรุปข้อมูลลูกค้า & โปรโมชั่น */}
              {(selectedOrder.customer || selectedOrder.promotion) && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-2">
                  {selectedOrder.customer && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ลูกค้าสมาชิก:</span>
                      <span className="font-bold text-[#361F4D]">{selectedOrder.customer.name}</span>
                    </div>
                  )}
                  {selectedOrder.promotion && (
                    <div className="flex justify-between text-[#E85D75]">
                      <span className="flex items-center gap-1"><Tag size={12}/> โปรโมชั่นที่ใช้:</span>
                      <span className="font-bold">{selectedOrder.promotion.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ยอดชำระเงิน */}
              <div className="space-y-2 text-sm pt-2">
                <div className="flex justify-between text-gray-500">
                  <span>ยอดรวม (Subtotal)</span>
                  <span>฿{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-[#E85D75]">
                    <span>ส่วนลดรวม</span>
                    <span>- ฿{Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                  <span>฿{Number(selectedOrder.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg text-[#361F4D] pt-3 border-t border-gray-100">
                  <span>ยอดสุทธิ (Net Total)</span>
                  <span className="text-[#E85D75]">฿{Number(selectedOrder.netTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500 font-medium">
              <span>ชำระผ่าน: {selectedOrder.paymentMethod}</span>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border rounded-xl hover:bg-gray-100 transition-colors text-gray-600">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}