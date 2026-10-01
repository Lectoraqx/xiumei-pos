// ลองเปลี่ยนจาก "@/lib/auth" เป็น "@/auth" หากไฟล์ auth.ts ของคุณอยู่หน้าสุดของโฟลเดอร์ src
import { auth } from "@/auth"; 
import { redirect } from "next/navigation";
// แก้ Path ให้ตรงกับโครงสร้างโฟลเดอร์ของคุณ
import AppLayout from "@/components/ui/layout/AppLayout"; 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <AppLayout session={session}>{children}</AppLayout>;
}