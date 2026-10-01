"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Store, ClipboardList, IceCream, Tags, 
  Package, Truck, Users, Gift, Briefcase, Trash2, 
  BarChart3, LogOut, X
} from "lucide-react";

// กำหนด Roles ให้แต่ละเมนู (ADMIN, MANAGER, CASHIER)
const menuGroups = [
  {
    title: "ภาพรวม",
    items: [
      { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER"] }
    ],
  },
  {
    title: "จัดการร้าน",
    items: [
      { title: "ขายหน้าร้าน", href: "/pos", icon: Store, roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { title: "ออเดอร์", href: "/orders", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { title: "สินค้า", href: "/products", icon: IceCream, roles: ["ADMIN", "MANAGER"] },
      { title: "หมวดหมู่", href: "/categories", icon: Tags, roles: ["ADMIN", "MANAGER"] },
      { title: "สต๊อกและคลัง", href: "/inventory", icon: Package, roles: ["ADMIN", "MANAGER"] },
      { title: "ซัพพลายเออร์", href: "/suppliers", icon: Truck, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    title: "ลูกค้าและทีม",
    items: [
      { title: "สมาชิก", href: "/members", icon: Users, roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { title: "โปรโมชั่น", href: "/promotions", icon: Gift, roles: ["ADMIN", "MANAGER"] },
      { title: "พนักงาน", href: "/employees", icon: Briefcase, roles: ["ADMIN"] }, // เฉพาะ ADMIN เท่านั้น
    ],
  },
  {
    title: "วิเคราะห์",
    items: [
      { title: "ของเสีย", href: "/waste", icon: Trash2, roles: ["ADMIN", "MANAGER"] },
      { title: "รายงาน", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
    ],
  },
];

export default function Sidebar({ 
  session, 
  isOpen, 
  setIsOpen 
}: { 
  session: any; 
  isOpen: boolean; 
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  
  // ดึง Role ของผู้ใช้จาก Session (ถ้าไม่มีให้มองเป็น CASHIER เพื่อความปลอดภัยสูงสุด)
  const userRole = session?.user?.role || "CASHIER";

  // กรองเมนูตามสิทธิ์ (Role)
  const filteredMenuGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(userRole))
    }))
    .filter(group => group.items.length > 0); // ซ่อนหัวข้อที่ไม่มีเมนูย่อยเลย

  return (
    <>
      {/* Overlay สำหรับ Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#361F4D] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-[#F4A5C9]">
            <IceCream size={24} />
            <span className="font-bold text-lg tracking-wide text-white">Xiumei 秀美</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {filteredMenuGroups.map((group, index) => (
            <div key={index} className="mb-6">
              <h3 className="px-6 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 mx-4 my-1 text-sm font-medium transition-colors rounded-2xl ${
                        isActive
                          ? "bg-[#F8A8C9] text-[#361F4D] shadow-sm font-semibold"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Logout (Bottom) */}
        <div className="p-4 border-t border-white/10 shrink-0 bg-black/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-[#F4A5C9] text-[#4A2B63] flex items-center justify-center font-bold text-sm shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Guest User"}
              </p>
              <p className="text-xs text-[#F4A5C9] truncate uppercase font-bold">
                {userRole}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}