export { auth as middleware } from "@/auth";

export const config = {
  // กำหนดเส้นทาง (Routes) ที่ต้องการให้ Middleware ทำงานตรวจสอบการ Login
  // จะตรวจทุกหน้า ยกเว้นไฟล์ระบบ ไฟล์ภาพ และหน้า login
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};