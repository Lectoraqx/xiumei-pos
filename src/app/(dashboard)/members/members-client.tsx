"use client";

import toast from "react-hot-toast";
import React, { useState } from "react";
import { Search, Users, Plus, Edit, Trash2, X, Award, Star, Shield } from "lucide-react";
import { saveMember, deleteMember } from "./actions";

export default function MembersClient({ initialMembers }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", phone: "", memberTier: "GENERAL", points: 0
  });

  const filteredMembers = initialMembers.filter((m: any) => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  const openModal = (member?: any) => {
    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name,
        phone: member.phone,
        memberTier: member.memberTier,
        points: member.points,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", phone: "", memberTier: "GENERAL", points: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveMember(formData, editingId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("บันทึกข้อมูลสมาชิกสำเร็จ!");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบข้อมูลสมาชิกลูกค้า "${name}" ใช่หรือไม่?`)) {
      const res = await deleteMember(id);
      if (res.success) {
        toast.success(res.message || "ลบข้อมูลสำเร็จ");
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // ตกแต่งป้าย Tier ของสมาชิก
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "PLATINUM": 
        return <span className="bg-slate-900 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-700 flex items-center justify-center gap-1 w-max mx-auto"><Shield size={12}/> Platinum</span>;
      case "GOLD": 
        return <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 flex items-center justify-center gap-1 w-max mx-auto"><Star size={12}/> Gold</span>;
      case "GENERAL": 
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 flex items-center justify-center gap-1 w-max mx-auto">ทั่วไป</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Users className="text-[#E85D75]" />
            สมาชิกลูกค้า
          </h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการข้อมูลลูกค้า ระดับสมาชิก และคะแนนสะสม</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm text-sm">
          <Plus size={18} /> สมัครสมาชิกใหม่
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-[#E85D75] flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">สมาชิกทั้งหมด</p>
            <p className="text-2xl font-bold text-[#361F4D]">{initialMembers.length} <span className="text-sm font-normal text-gray-400">ราย</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">สมาชิก Gold & Platinum</p>
            <p className="text-2xl font-bold text-[#361F4D]">
              {initialMembers.filter((m: any) => m.memberTier !== "GENERAL").length} <span className="text-sm font-normal text-gray-400">ราย</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">แต้มสะสมรวมทั้งระบบ</p>
            <p className="text-2xl font-bold text-[#361F4D]">
              {initialMembers.reduce((sum: number, m: any) => sum + m.points, 0).toLocaleString()} <span className="text-sm font-normal text-gray-400">แต้ม</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือเบอร์โทร..." 
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
                <th className="px-6 py-4 font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-4 font-medium">เบอร์โทรศัพท์</th>
                <th className="px-6 py-4 font-medium text-center">ระดับสมาชิก</th>
                <th className="px-6 py-4 font-medium text-right">แต้มสะสม</th>
                <th className="px-6 py-4 font-medium text-center">ประวัติการซื้อ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((m: any) => (
                <tr key={m.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{m.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{m.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</td>
                  <td className="px-6 py-4 text-center">{getTierBadge(m.memberTier)}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#E85D75]">{m.points.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-gray-500">{m._count.orders} บิล</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(m.id, m.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    ไม่พบข้อมูลสมาชิกลูกค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไขสมาชิก */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <h3 className="font-bold text-lg text-[#361F4D]">{editingId ? "แก้ไขข้อมูลลูกค้า" : "สมัครสมาชิกลูกค้าใหม่"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (10 หลัก) <span className="text-red-500">*</span></label>
                <input type="tel" required pattern="[0-9]{10}" maxLength={10} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="08XXXXXXXX" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ระดับสมาชิก <span className="text-red-500">*</span></label>
                <select required value={formData.memberTier} onChange={(e) => setFormData({...formData, memberTier: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                  <option value="GENERAL">ทั่วไป (General)</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แต้มสะสม</label>
                <input type="number" min="0" value={formData.points} onChange={(e) => setFormData({...formData, points: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none font-bold text-[#E85D75]" />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
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