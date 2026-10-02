"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ClipboardList,
  IceCream,
  Tags,
  Package,
  Truck,
  Users,
  Gift,
  Award,
  Briefcase,
  Trash2,
  BarChart,
  X,
  LogOut,
} from "lucide-react";

export default function Sidebar({ session, isOpen, setIsOpen }: { session: any; isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const userRole = session?.user?.role || "ADMIN"; 

  // โครงสร้างเมนูทั้งหมด
  const menuGroups = [
    {
      title: "ภาพรวม",
      items: [
        { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER"] },
      ],
    },
    {
      title: "จัดการร้าน",
      items: [
        { label: "ขายหน้าร้าน", href: "/pos", icon: Store, roles: ["ADMIN", "MANAGER", "CASHIER"] },
        { label: "ออเดอร์", href: "/orders", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "CASHIER"] },
        { label: "สินค้า", href: "/products", icon: IceCream, roles: ["ADMIN", "MANAGER"] },
        { label: "หมวดหมู่", href: "/categories", icon: Tags, roles: ["ADMIN", "MANAGER"] },
        { label: "สต๊อกและคลัง", href: "/inventory", icon: Package, roles: ["ADMIN", "MANAGER"] },
        { label: "ซัพพลายเออร์", href: "/suppliers", icon: Truck, roles: ["ADMIN", "MANAGER"] },
      ],
    },
    {
      title: "ลูกค้าและทีม",
      items: [
        { label: "สมาชิก", href: "/members", icon: Users, roles: ["ADMIN", "MANAGER", "CASHIER"] },
        { label: "โปรโมชั่น", href: "/promotions", icon: Gift, roles: ["ADMIN", "MANAGER"] },
        { label: "ของรางวัล", href: "/rewards", icon: Award, roles: ["ADMIN", "MANAGER"] },
        { label: "พนักงาน", href: "/employees", icon: Briefcase, roles: ["ADMIN"] },
      ],
    },
    {
      title: "วิเคราะห์",
      items: [
        { label: "ของเสีย", href: "/waste", icon: Trash2, roles: ["ADMIN", "MANAGER"] },
        { label: "รายงาน", href: "/reports", icon: BarChart, roles: ["ADMIN", "MANAGER"] },
      ],
    },
  ];

  return (
    <>
      {/* Overlay สำหรับ Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#361F4D] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <IceCream className="text-[#E85D75] mr-2" size={24} />
          <h1 className="text-xl font-bold tracking-wider">Xiumei 秀美</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-6">
          {menuGroups.map((group, index) => {
            // กรองเมนูตามสิทธิ์การเข้าถึง (ใช้ ?. เพื่อป้องกัน Error 18048)
            const allowedItems = group.items.filter(
              (item) => !item.roles || item.roles?.includes(userRole)
            );

            if (allowedItems.length === 0) return null;

            return (
              <div key={index}>
                <p className="px-3 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {allowedItems.map((item) => {
                    const Icon = item.icon;
                    // เช็คว่าเมนูนี้กำลังเปิดอยู่หรือไม่
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-[#E85D75]" : "text-gray-400"} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile & Logout */}
        <div className="shrink-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-[#E85D75] flex items-center justify-center font-bold text-white shrink-0">
              {session?.user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{session?.user?.name || "Super Admin"}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{userRole}</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <LogOut size={18} />
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}