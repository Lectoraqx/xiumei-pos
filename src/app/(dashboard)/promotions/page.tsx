import { getPromotions } from "./actions";
import PromotionsClient from "./promotions-client";
import { auth } from "@/auth"; // เปลี่ยนเป็น "@/lib/auth" ถ้าไฟล์ auth อยู่ใน lib

export default async function PromotionsPage() {
  await auth();
  const promotions = await getPromotions();
  return <PromotionsClient initialPromotions={promotions} />;
}