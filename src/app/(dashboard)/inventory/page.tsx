import { getInventory } from "./actions";
import InventoryClient from "./inventory-client";
import { auth } from "@/auth"; // แก้เป็น "@/lib/auth" หากไฟล์ auth ของคุณอยู่ใน lib

export default async function InventoryPage() {
  const session = await auth();
  const inventory = await getInventory();
  
  // จำเป็นต้องมี employeeId เพื่อบันทึกว่าใครเป็นคนปรับสต๊อก
  const employeeId = session?.user?.id || "";

  return (
    <InventoryClient initialInventory={inventory} employeeId={employeeId} />
  );
}