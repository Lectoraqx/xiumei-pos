"use client";

import React, { useState } from "react";
import { Search, UsersRound, Plus, Edit, Trash2, X, ShieldCheck, UserCircle } from "lucide-react";
import { saveEmployee, deleteEmployee } from "./actions";
import toast from "react-hot-toast";

export default function EmployeesClient({ initialEmployees }: { initialEmployees: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", role: "CASHIER", status: "ACTIVE"
  });

  const filteredEmployees = initialEmployees.filter((emp) => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (emp?: any) => {
    if (emp) {
      setEditingId(emp.id);
      setFormData({
        firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone || "",
        password: "", role: emp.role, status: emp.status
      });
    } else {
      setEditingId(null);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "CASHIER", status: "ACTIVE" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveEmployee(formData, editingId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("บันทึกข้อมูลพนักงานสำเร็จ!");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const res = await deleteEmployee(id);
      if (res.success) {
        toast.success(res.message || "ดำเนินการสำเร็จ");
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการทำรายการ");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">Admin</span>;
    if (role === "MANAGER") return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Manager</span>;
    return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Cashier</span>;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <UsersRound className="text-[#E85D75]" /> จัดการพนักงาน
          </h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลพนักงาน</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-sm text-sm">
          <Plus size={18} /> เพิ่มพนักงานใหม่
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="ค้นหาชื่อ หรืออีเมล..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#E85D75] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-medium">อีเมล</th>
                <th className="px-6 py-4 font-medium text-center">สิทธิ์การใช้งาน (Role)</th>
                <th className="px-6 py-4 font-medium text-center">ยอดขาย (บิล)</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className={`text-[#361F4D] hover:bg-gray-50/50 ${emp.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 font-semibold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-50 text-[#E85D75] flex items-center justify-center">
                      <UserCircle size={18} />
                    </div>
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                  <td className="px-6 py-4 text-center">{getRoleBadge(emp.role)}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-500">{emp._count.orders}</td>
                  <td className="px-6 py-4 text-center">
                    {emp.status === "ACTIVE" 
                      ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">ปกติ</span> 
                      : <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold">ระงับ</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(emp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(emp.id, emp.firstName)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">ไม่พบข้อมูลพนักงาน</td>
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
                <ShieldCheck className="text-[#E85D75]"/> {editingId ? "แก้ไขพนักงาน" : "เพิ่มพนักงานใหม่"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (ใช้สำหรับเข้าสู่ระบบ) <span className="text-red-500">*</span></label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน {editingId && <span className="text-xs text-gray-400">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span>}</label>
                <input type="password" required={!editingId} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์การใช้งาน</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                    <option value="CASHIER">Cashier (พนักงานขาย)</option>
                    <option value="MANAGER">Manager (ผู้จัดการ)</option>
                    <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:outline-none">
                    <option value="ACTIVE">ปกติ (Active)</option>
                    <option value="INACTIVE">ระงับการใช้งาน (Inactive)</option>
                  </select>
                </div>
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