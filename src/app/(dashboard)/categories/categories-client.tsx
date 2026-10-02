'use client';

import { useState } from "react";
import { Plus, Search, Tags, Edit, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "./actions";

export default function CategoriesClient({ categories }: { categories: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State สำหรับฟอร์ม
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State สำหรับ Popup แจ้งเตือน (Toast)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ฟังก์ชันแสดง Popup (จะหายไปเองใน 3 วินาที)
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setIsModalOpen(false);
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      let result;
      if (editingId) {
        result = await updateCategory(editingId, { name, description });
      } else {
        result = await createCategory({ name, description });
      }
      
      if (result.success) {
        // แทนที่การเงียบๆ ไปด้วยการเรียก Popup สำเร็จ
        showToast(editingId ? "แก้ไขหมวดหมู่สำเร็จ" : "เพิ่มหมวดหมู่ใหม่สำเร็จ", "success");
        resetForm();
      } else {
        // แทนที่ alert ด้วย Popup Error
        showToast(result.error || "เกิดข้อผิดพลาด", "error");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อระบบได้", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`คุณต้องการลบหมวดหมู่ "${categoryName}" ใช่หรือไม่?`)) return;

    try {
      const result = await deleteCategory(id);
      if (result.success) {
        showToast("ลบหมวดหมู่สำเร็จ", "success");
      } else {
        showToast(result.error || "ไม่สามารถลบข้อมูลได้", "error");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้", "error");
    }
  };

  return (
    <div className="space-y-6 pb-10 relative">
      {/* ส่วนหัวและปุ่มเพิ่ม */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Tags className="text-[#E85D75]" />
            หมวดหมู่สินค้า
          </h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการประเภทของสินค้าภายในร้าน</p>
        </div>
        
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <Plus size={18} />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* ช่องค้นหา */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาหมวดหมู่..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75] text-sm"
          />
        </div>
        <div className="text-sm text-gray-500 w-full sm:w-auto text-right">
          ทั้งหมด <span className="font-bold text-[#361F4D]">{filteredCategories.length}</span> รายการ
        </div>
      </div>

      {/* ตารางแสดงผล */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อหมวดหมู่</th>
                <th className="px-6 py-4 font-medium">รายละเอียด</th>
                <th className="px-6 py-4 font-medium text-center">จำนวนสินค้า</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{category.name}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-pink-50 text-[#E85D75] px-3 py-1 rounded-full text-xs font-bold">
                        {category._count?.products || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Tags size={32} className="text-gray-300" />
                      <p>ไม่พบข้อมูลหมวดหมู่สินค้า</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไขหมวดหมู่ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#361F4D]">
                {editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85D75]" 
                  placeholder="เช่น ไอศกรีม, ท็อปปิ้ง" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (ไม่บังคับ)</label>
                <textarea 
                  rows={3} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85D75]"
                ></textarea>
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="px-4 py-2 bg-[#E85D75] text-white rounded-lg hover:bg-[#D14D63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI Popup แจ้งเตือน (Toast) */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            toast.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className="text-sm font-medium pr-4">{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
              toast.type === "success" ? "hover:bg-green-100 text-green-600" : "hover:bg-red-100 text-red-600"
            }`}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}