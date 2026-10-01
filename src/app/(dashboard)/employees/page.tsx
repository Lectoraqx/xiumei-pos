import { getEmployees } from "./actions";
import EmployeesClient from "./employees-client";
import { auth } from "@/auth"; // เปลี่ยนเป็น path ที่คุณเก็บ config auth ไว้ เช่น "@/lib/auth"
import { ShieldAlert } from "lucide-react";

export default async function EmployeesPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // 🔒 Server-Side Guard: ตรวจสอบสิทธิ์ว่าต้องเป็น ADMIN
  if (userRole !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#361F4D] mb-2">ไม่มีสิทธิ์เข้าถึง (Access Denied)</h2>
        <p className="text-gray-500 text-sm max-w-md">
          หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อผู้จัดการร้าน
        </p>
      </div>
    );
  }

  // ถ้าเป็น ADMIN ถึงจะยอมให้ดึงข้อมูลพนักงาน
  const employees = await getEmployees();

  return <EmployeesClient initialEmployees={employees} />;
}