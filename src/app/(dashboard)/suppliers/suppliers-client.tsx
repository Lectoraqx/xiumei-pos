"use client";

import React, { useState } from "react";
import { Search, Truck, Plus, Edit, Trash2, X, MapPin, Phone } from "lucide-react";
import { saveSupplier, deleteSupplier } from "./actions";
import toast from "react-hot-toast";

export default function SuppliersClient({ initialSuppliers }: { initialSuppliers: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", contactName: "", phone: "", email: "", address: ""
  });

  const filteredSuppliers = initialSuppliers.filter((sup) => 
    sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sup.contactName && sup.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openModal = (sup?: any) => {
    if (sup) {
      setEditingId(sup.id);
      setFormData({
        name: sup.name, 
        contactName: sup.contactName || "", 
        phone: sup.phone || "", 
        email: sup.email || "", 
        address: sup.address || ""
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", contactName: "", phone: "", email: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveSupplier(formData, editingId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("บันทึกข้อมูลซัพพลายเออร์สำเร็จ!");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบซัพพลายเออร์ "${name}" ใช่หรือไม่?`)) {
      const res = await deleteSupplier(id);
      if (res.success) {
        toast.success(res.message || "ลบข้อมูลซัพพลายเออร์สำเร็จ");
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
            <Truck className="text-[#E85D75]" /> จัดการซัพพลายเออร์
          </h1>
          <p className="text-gray-500 mt-1 text-sm">ข้อมูลติดต่อคู่ค้าและบริษัทที่จัดส่งวัตถุดิบ</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-sm text-sm transition-colors">
          <Plus size={18} /> เพิ่มซัพพลายเออร์
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="ค้นหาชื่อบริษัท หรือผู้ติดต่อ..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#FDFBF7] border border-gray-100 rounded-full focus:outline-none focus:border-[#E85D75] focus:bg-white transition-colors text-sm"
            />
          </div>
          <div className="text-sm text-gray-500">ทั้งหมด <span className="font-bold text-[#361F4D]">{filteredSuppliers.length}</span> รายการ</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อบริษัท / ร้านค้า</th>
                <th className="px-6 py-4 font-medium">ผู้ติดต่อ</th>
                <th className="px-6 py-4 font-medium">เบอร์โทรศัพท์</th>
                <th className="px-6 py-4 font-medium text-center">สินค้าที่จัดส่ง</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{sup.name}</td>
                  <td className="px-6 py-4 text-gray-600">{sup.contactName || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400"/> {sup.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {sup._count.products} รายการ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(sup)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(sup.id, sup.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Truck size={32} className="mx-auto mb-3 opacity-20" />
                    ไม่พบข้อมูลซัพพลายเออร์
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
                <Truck className="text-[#E85D75]"/> {editingId ? "แก้ไขข้อมูลซัพพลายเออร์" : "เพิ่มซัพพลายเออร์ใหม่"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท / ร้านค้า <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="เช่น บริษัท เอส เอ็น ซี จำกัด" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
                  <input type="text" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="ชื่อเซลล์ หรือ พนักงาน" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" placeholder="08X-XXX-XXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14}/> ที่อยู่จัดส่ง / ที่ตั้ง</label>
                <textarea rows={3} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none resize-none" placeholder="รายละเอียดที่อยู่..." />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-gray-50">
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