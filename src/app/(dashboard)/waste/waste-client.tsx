"use client";

import React, { useState } from "react";
import { Search, Trash2, Plus, X, PackageMinus, AlertTriangle } from "lucide-react";
import { recordWaste } from "./actions";

const COMMON_REASONS = [
  "ไอศกรีมละลาย",
  "โคนแตก",
  "วัตถุดิบหมดอายุ",
  "สินค้าชำรุด",
  "ลูกค้าคืนสินค้า",
  "อื่น ๆ"
];

export default function WasteClient({ initialWasteLogs, products, employeeId }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    reason: COMMON_REASONS[0],
    customReason: "",
  });

  const filteredLogs = initialWasteLogs.filter((log: any) => 
    log.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCostLost = initialWasteLogs.reduce((sum: number, log: any) => sum + Number(log.costLost), 0);

  const openModal = () => {
    setFormData({ productId: "", quantity: 1, reason: COMMON_REASONS[0], customReason: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalReason = formData.reason === "อื่น ๆ" ? formData.customReason : formData.reason;
    
    const res = await recordWaste({
      productId: formData.productId,
      quantity: formData.quantity,
      reason: finalReason || "ไม่ระบุสาเหตุ",
      employeeId,
    });
    
    setIsSubmitting(false);

    if (res.success) {
      alert("บันทึกของเสียสำเร็จ ระบบได้ตัดสต๊อกเรียบร้อยแล้ว");
      setIsModalOpen(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Trash2 className="text-[#E85D75]" />
            จัดการของเสีย (Waste)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">บันทึกสินค้าชำรุด หมดอายุ และคำนวณต้นทุนที่สูญเสีย</p>
        </div>
        <button onClick={openModal} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm text-sm">
          <Plus size={18} /> บันทึกของเสีย
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-red-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-red-500 font-medium">มูลค่าต้นทุนที่สูญเสียรวม</p>
            <p className="text-2xl font-bold text-[#361F4D]">฿{totalCostLost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
            <PackageMinus size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">รายการของเสียที่บันทึกแล้ว</p>
            <p className="text-2xl font-bold text-[#361F4D]">{initialWasteLogs.length} <span className="text-sm font-normal text-gray-400">รายการ</span></p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า หรือสาเหตุ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#E85D75] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">วันที่ / เวลา</th>
                <th className="px-6 py-4 font-medium">ชื่อสินค้า</th>
                <th className="px-6 py-4 font-medium text-center">จำนวนที่เสีย</th>
                <th className="px-6 py-4 font-medium">สาเหตุ</th>
                <th className="px-6 py-4 font-medium text-right">ต้นทุนที่เสีย (Cost Lost)</th>
                <th className="px-6 py-4 font-medium text-right">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log: any) => (
                <tr key={log.id} className="text-[#361F4D] hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(log.dateReported).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-6 py-4 font-semibold">{log.product.name}</td>
                  <td className="px-6 py-4 text-center font-bold text-[#E85D75]">
                    {log.quantity} <span className="text-xs font-normal text-gray-400">{log.product.unitType}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{log.reason}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    ฿{Number(log.costLost).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs">
                    {log.employee.firstName}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    ไม่พบข้อมูลประวัติของเสีย
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal บันทึกของเสีย */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <h3 className="font-bold text-lg text-[#361F4D]">บันทึกของเสีย</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสินค้า <span className="text-red-500">*</span></label>
                <select required value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                  <option value="">-- เลือกสินค้าที่ชำรุด/สูญเสีย --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} (มีสต๊อก {p.stockQty} {p.unitType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนที่เสีย <span className="text-red-500">*</span></label>
                <input type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สาเหตุ <span className="text-red-500">*</span></label>
                <select required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                  {COMMON_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              {formData.reason === "อื่น ๆ" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">โปรดระบุสาเหตุ</label>
                  <input type="text" required value={formData.customReason} onChange={(e) => setFormData({...formData, customReason: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="ระบุรายละเอียด..." />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยันและตัดสต๊อก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}