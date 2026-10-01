"use client";

import toast from "react-hot-toast";
import React, { useState } from "react";
import { Search, Tag, Plus, Edit, Trash2, X, Percent, CalendarClock } from "lucide-react";
import { savePromotion, deletePromotion } from "./actions";

export default function PromotionsClient({ initialPromotions }: { initialPromotions: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: "ACTIVE"
  });

  const filteredPromotions = initialPromotions.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (promo?: any) => {
    if (promo) {
      setEditingId(promo.id);
      setFormData({
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        startDate: new Date(promo.startDate).toISOString().split('T')[0],
        endDate: new Date(promo.endDate).toISOString().split('T')[0],
        status: promo.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "", discountType: "PERCENTAGE", discountValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: "ACTIVE"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("วันสิ้นสุดโปรโมชั่นต้องไม่น้อยกว่าวันเริ่มต้น");
      return;
    }

    setIsSubmitting(true);
    const res = await savePromotion(formData, editingId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("บันทึกข้อมูลโปรโมชั่นสำเร็จ!");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบโปรโมชั่น "${name}" ใช่หรือไม่?`)) {
      const res = await deletePromotion(id);
      if (res.success) toast.success(res.message || "ลบโปรโมชั่นสำเร็จ");
      else toast.error(res.error || "เกิดข้อผิดพลาดในการลบโปรโมชั่น");
    }
  };

  const getStatusBadge = (status: string, endDate: Date) => {
    const isExpired = new Date() > new Date(endDate);
    
    if (status === "EXPIRED" || isExpired) {
      return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">หมดอายุ</span>;
    }
    if (status === "ACTIVE") {
      return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">เปิดใช้งาน</span>;
    }
    return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">ปิดใช้งาน</span>;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Tag className="text-[#E85D75]" /> จัดการโปรโมชั่น
          </h1>
          <p className="text-gray-500 mt-1 text-sm">สร้างส่วนลด และจัดการแคมเปญส่งเสริมการขาย</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-sm text-sm transition-colors">
          <Plus size={18} /> สร้างโปรโมชั่นใหม่
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="ค้นหาชื่อโปรโมชั่น..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#FDFBF7] border border-gray-100 rounded-full focus:outline-none focus:border-[#E85D75] transition-colors text-sm"
            />
          </div>
          <div className="text-sm text-gray-500">ทั้งหมด <span className="font-bold text-[#361F4D]">{filteredPromotions.length}</span> แคมเปญ</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อแคมเปญ</th>
                <th className="px-6 py-4 font-medium">รูปแบบส่วนลด</th>
                <th className="px-6 py-4 font-medium">ระยะเวลา</th>
                <th className="px-6 py-4 font-medium text-center">ถูกใช้ (บิล)</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPromotions.map((p) => (
                <tr key={p.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 font-bold text-[#E85D75] bg-pink-50 px-3 py-1 rounded-full w-max">
                      {p.discountType === "PERCENTAGE" ? <Percent size={14}/> : '฿'} 
                      {Number(p.discountValue)} {p.discountType === "PERCENTAGE" ? "%" : "บาท"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                    <CalendarClock size={14}/>
                    {new Date(p.startDate).toLocaleDateString("th-TH")} - {new Date(p.endDate).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-500">{p._count.orders}</td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(p.status, p.endDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Tag size={32} className="mx-auto mb-3 opacity-20" />
                    ไม่พบข้อมูลโปรโมชั่น
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <h3 className="font-bold text-lg text-[#361F4D] flex items-center gap-2">
                <Tag className="text-[#E85D75]"/> {editingId ? "แก้ไขโปรโมชั่น" : "สร้างโปรโมชั่นใหม่"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแคมเปญโปรโมชั่น <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="เช่น โปรปีใหม่ ลด 10%" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทส่วนลด</label>
                  <select required value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                    <option value="PERCENTAGE">เปอร์เซ็นต์ (%)</option>
                    <option value="FIXED_AMOUNT">จำนวนเงิน (บาท)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">มูลค่าส่วนลด <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" required value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none font-bold text-[#E85D75]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่มต้น <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.endDate} min={formData.startDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะการใช้งาน</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                  <option value="ACTIVE">เปิดใช้งาน (Active)</option>
                  <option value="INACTIVE">ปิดใช้งานชั่วคราว (Inactive)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกโปรโมชั่น"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}