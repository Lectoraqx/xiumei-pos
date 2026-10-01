// src/components/ui/layout/Topbar.tsx
"use client";

import { Menu } from "lucide-react";

export default function Topbar({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden shrink-0">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>
      <div className="font-bold text-[#361F4D]">Xiumei 秀美</div>
      <div className="w-10"></div>
    </header>
  );
}