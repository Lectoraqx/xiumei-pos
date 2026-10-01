import ReportsClient from "./reports-client";
import { auth } from "@/auth";
import { ShieldAlert } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // 🔒 Server-Side Guard: CASHIER ห้ามเข้าเด็ดขาด (เข้าได้แค่ ADMIN กับ MANAGER)
  if (userRole === "CASHIER" || !userRole) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#361F4D] mb-2">ไม่มีสิทธิ์ดูรายงานยอดขาย</h2>
        <p className="text-gray-500 text-sm max-w-md">
          พนักงานขาย (Cashier) ไม่สามารถเข้าถึงข้อมูลการวิเคราะห์และยอดขายรวมได้
        </p>
      </div>
    );
  }

  // ถ้าผ่าน Guard มาได้ ค่อยแสดงหน้า Client
  return <ReportsClient />;
}