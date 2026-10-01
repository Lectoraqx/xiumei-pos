import { getSuppliers } from "./actions";
import SuppliersClient from "./suppliers-client";
import { auth } from "@/auth"; // เปลี่ยนเป็น "@/lib/auth" ถ้าไฟล์ auth อยู่ใน lib

export default async function SuppliersPage() {
  await auth();
  const suppliers = await getSuppliers();
  return <SuppliersClient initialSuppliers={suppliers} />;
}