"use client";

import React, { useState } from "react";
import { Search, IceCream, Plus, Edit, Trash2, X, PackageOpen } from "lucide-react";
import { saveProduct, deleteProduct } from "./actions";

export default function ProductsClient({ initialProducts, categories, suppliers }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "", categoryId: "", supplierId: "", unitType: "Scoop",
    costPrice: 0, sellingPrice: 0, stockQty: 0, minStock: 10
  });

  const filteredProducts = initialProducts.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        supplierId: product.supplierId || "",
        unitType: product.unitType,
        costPrice: Number(product.costPrice),
        sellingPrice: Number(product.sellingPrice),
        stockQty: product.stockQty,
        minStock: product.minStock
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "", categoryId: categories[0]?.id || "", supplierId: "", unitType: "Scoop",
        costPrice: 0, sellingPrice: 0, stockQty: 0, minStock: 10
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveProduct(formData, editingId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      alert("บันทึกข้อมูลสำเร็จ!");
      setIsModalOpen(false);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) {
      const res = await deleteProduct(id);
      if (res.success) {
        alert(res.message); // แสดงข้อความ (เช่น ถ้าลบไม่ได้จะถูกเปลี่ยนเป็น ปิดการขาย แทน)
      } else {
        alert(res.error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "AVAILABLE": return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">พร้อมขาย</span>;
      case "LOW_STOCK": return <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100">ใกล้หมด</span>;
      case "OUT_OF_STOCK": return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">หมดสต๊อก</span>;
      case "DISCONTINUED": return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">ปิดการขาย</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <IceCream className="text-[#E85D75]" />
            รายการสินค้า
          </h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการข้อมูลสินค้า ราคา และหน่วยนับ</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm text-sm">
          <Plus size={18} /> เพิ่มสินค้าใหม่
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#E85D75] text-sm"
            />
          </div>
          <div className="text-sm text-gray-500">ทั้งหมด <span className="font-bold text-[#361F4D]">{filteredProducts.length}</span> รายการ</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อสินค้า</th>
                <th className="px-6 py-4 font-medium">หมวดหมู่</th>
                <th className="px-6 py-4 font-medium text-right">ต้นทุน</th>
                <th className="px-6 py-4 font-medium text-right">ราคาขาย</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p: any) => (
                <tr key={p.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500">{p.category.name}</td>
                  <td className="px-6 py-4 text-right text-gray-500">฿{Number(p.costPrice).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#E85D75]">฿{Number(p.sellingPrice).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(p.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <PackageOpen size={32} className="mx-auto mb-2 text-gray-300" />
                    ไม่พบข้อมูลสินค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไขสินค้า */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7] shrink-0">
              <h3 className="font-bold text-lg text-[#361F4D]">{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75]" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                  <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ซัพพลายเออร์ (ไม่บังคับ)</label>
                  <select value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                    <option value="">-- เลือกซัพพลายเออร์ --</option>
                    {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยนับ (เช่น Scoop, ชิ้น, ถ้วย)</label>
                  <input type="text" required value={formData.unitType} onChange={(e) => setFormData({...formData, unitType: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">แจ้งเตือนสต๊อกขั้นต่ำ (Min Stock)</label>
                  <input type="number" min="0" required value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ต้นทุน (บาท) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" required value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย (บาท) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" required value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none font-bold text-[#E85D75]" />
                </div>

                {!editingId && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="block text-sm font-medium text-blue-800 mb-1">สต๊อกตั้งต้น (ชิ้น/หน่วย)</label>
                    <input type="number" min="0" value={formData.stockQty} onChange={(e) => setFormData({...formData, stockQty: Number(e.target.value)})} className="w-full px-4 py-2 border border-blue-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                    <p className="text-xs text-blue-600 mt-1">* สามารถเพิ่มสต๊อกภายหลังได้ที่เมนู "สต๊อกและคลังสินค้า"</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกสินค้า"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}