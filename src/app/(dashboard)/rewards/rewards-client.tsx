"use client";

import toast from "react-hot-toast";
import React, { useState } from "react";
import { Search, Gift, Plus, Edit, Trash2, X } from "lucide-react";
import { saveReward, deleteReward } from "./actions";

export default function RewardsClient({ initialRewards }: { initialRewards: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    pointsRequired: 0,
    rewardType: "DISCOUNT",
    discountValue: 0,
    isActive: true
  });

  const filteredRewards = initialRewards.filter((r) => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (reward?: any) => {
    if (reward) {
      setEditingId(reward.id);
      setFormData({
        name: reward.name,
        pointsRequired: reward.pointsRequired,
        rewardType: reward.rewardType,
        discountValue: reward.discountValue || 0,
        isActive: reward.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", pointsRequired: 0, rewardType: "DISCOUNT", discountValue: 0, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveReward(formData, editingId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("บันทึกข้อมูลของรางวัลสำเร็จ!");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบ "${name}" ใช่หรือไม่?`)) {
      const res = await deleteReward(id);
      if (res.success) {
        toast.success(res.message || "ลบของรางวัลสำเร็จ");
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Gift className="text-[#E85D75]" /> จัดการของรางวัล (แลกแต้ม)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">ตั้งค่าของรางวัลและส่วนลดสำหรับสมาชิก</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-sm text-sm">
          <Plus size={18} /> เพิ่มของรางวัลใหม่
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="ค้นหาชื่อของรางวัล..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#FDFBF7] border border-gray-100 rounded-full focus:outline-none focus:border-[#E85D75] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อของรางวัล</th>
                <th className="px-6 py-4 font-medium text-center">แต้มที่ใช้</th>
                <th className="px-6 py-4 font-medium text-center">ประเภท</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRewards.map((r) => (
                <tr key={r.id} className="text-[#361F4D] hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold">{r.name}</td>
                  <td className="px-6 py-4 text-center font-extrabold text-[#E85D75]">{r.pointsRequired.toLocaleString()} แต้ม</td>
                  <td className="px-6 py-4 text-center">
                    {r.rewardType === "DISCOUNT" ? (
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">ส่วนลด ฿{Number(r.discountValue)}</span>
                    ) : (
                      <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100">ของแถมฟรี</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.isActive ? (
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">เปิดใช้งาน</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">ปิดใช้งาน</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(r.id, r.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRewards.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">ไม่พบข้อมูลของรางวัล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <h3 className="font-bold text-lg text-[#361F4D]">{editingId ? "แก้ไขของรางวัล" : "เพิ่มของรางวัลใหม่"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อของรางวัล <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="เช่น แลกรับส่วนลด 50 บาท" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ใช้แต้มสะสมจำนวน <span className="text-red-500">*</span></label>
                <input type="number" min="1" required value={formData.pointsRequired} onChange={(e) => setFormData({...formData, pointsRequired: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none font-bold text-[#E85D75]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทของรางวัล</label>
                <select value={formData.rewardType} onChange={(e) => setFormData({...formData, rewardType: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                  <option value="DISCOUNT">ส่วนลดเงินสด (หักจากยอดบิล)</option>
                  <option value="FREE_ITEM">ของแถม/สินค้าฟรี (พนักงานหยิบให้)</option>
                </select>
              </div>

              {formData.rewardType === "DISCOUNT" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">มูลค่าส่วนลด (บาท) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="1" required value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none text-blue-600 font-bold" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({...formData, isActive: e.target.value === "true"})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                  <option value="true">เปิดใช้งาน</option>
                  <option value="false">ปิดใช้งานชั่วคราว</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50">
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}