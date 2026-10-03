"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { IceCream, Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // เรียกใช้ฟังก์ชัน signIn ของ NextAuth แบบไม่ redirect ทันที เพื่อดักจับ Error
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, 
    });

    if (res?.error) {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsSubmitting(false);
    } else if (res?.ok) {
      toast.success("เข้าสู่ระบบสำเร็จ!");
      // ใช้ window.location.href เพื่อบังคับเบราว์เซอร์โหลดหน้าใหม่ 
      // เป็นการเคลียร์แคชและอัปเดต Session 100%
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header แถบสีม่วง */}
        <div className="bg-[#361F4D] p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F4A5C9] rounded-full flex items-center justify-center text-[#361F4D] mb-4 shadow-inner">
            <IceCream size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Xiumei 秀美</h1>
          <p className="text-[#F4A5C9] text-sm mt-1">ระบบจัดการหน้าร้าน (POS System)</p>
        </div>

        {/* Form Login */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#361F4D] mb-6 text-center">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลพนักงาน</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:bg-white focus:outline-none transition-colors text-sm"
                  placeholder="employee@xiumei.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#E85D75] focus:bg-white focus:outline-none transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E85D75] hover:bg-[#D14D63] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}