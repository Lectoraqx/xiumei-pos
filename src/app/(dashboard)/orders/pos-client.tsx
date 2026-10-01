"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react"
import { processCheckout } from "./actions"

type Product = { id: string, name: string, price: number, category: string }
type CartItem = { id: string, name: string, price: number, qty: number }

export default function PosClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : item
      }
      return item
    }))
  }

  const remove = (id: string) => setCart(prev => prev.filter(item => item.id !== id))
  
  // แก้ไขตรงนี้: เติมเครื่องหมาย * ให้คำนวณราคาถูกต้อง
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  const handleCheckout = () => {
    startTransition(async () => {
      try {
        const result = await processCheckout(cart)
        
        if (result && result.success) {
          alert("🎉 ชำระเงินสำเร็จ!\nรหัสออเดอร์: " + result.orderId)
          setCart([]) // ล้างตะกร้า
          router.refresh() // รีเฟรชหน้า
        } else {
          alert("❌ ยืนยันการชำระเงินล้มเหลว: " + (result?.error || "ไม่ทราบสาเหตุ"))
        }
      } catch (err) {
        console.error("Checkout Error:", err)
        alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์")
      }
    })
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* ฝั่งซ้าย: แคตตาล็อกสินค้า */}
      <div className="flex-1 flex flex-col space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">จุดขายสินค้า (POS)</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
          {products.map(product => (
            <Card key={product.id} className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all" onClick={() => addToCart(product)}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                <div className="w-full flex justify-center mb-2">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium truncate max-w-full">
                    {product.category}
                  </span>
                </div>
                <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                <p className="text-blue-600 font-bold mt-1">฿{product.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ฝั่งขวา: แผงควบคุมตะกร้าสินค้า */}
      <div className="w-96 bg-white rounded-xl shadow-sm border flex flex-col">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> รายการสั่งซื้อ</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{totalItems} ชิ้น</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                <div className="flex-1 pr-2">
                  <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                  <p className="text-slate-500 text-xs">฿{item.price} / ชิ้น</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border rounded-md">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-slate-100 rounded-l-md text-slate-600"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-slate-100 rounded-r-md text-slate-600"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => remove(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="text-blue-600 text-2xl">฿{total.toLocaleString()}</span>
          </div>
          <Button 
            className="w-full h-12 text-lg font-bold flex gap-2 items-center justify-center" 
            disabled={cart.length === 0 || isPending}
            onClick={handleCheckout}
          >
            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {isPending ? "กำลังบันทึก..." : "ชำระเงิน"}
          </Button>
        </div>
      </div>
    </div>
  )
}