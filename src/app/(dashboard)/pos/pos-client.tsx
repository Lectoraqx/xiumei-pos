"use client";

import toast from "react-hot-toast";
import React, { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, IceCream, Gift, Tag } from "lucide-react";
import { processCheckout } from "./actions";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sellingPrice: number | string;
  stockQty: number;
  categoryId: string;
  category: { name: string };
}

interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export default function PosClient({ initialProducts, categories, customers, promotions, rewards, employeeId }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [orderType, setOrderType] = useState<string>("DINE_IN");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [selectedPromoId, setSelectedPromoId] = useState<string>("");
  const [selectedReward, setSelectedReward] = useState<string>("");

  const router = useRouter();

  const currentCustomer = customers?.find((c: any) => c.id === selectedCustomer);

  const filteredProducts = initialProducts.filter((p: Product) => {
    const matchesCategory = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      toast.error("สินค้านี้หมดสต๊อก");
      return;
    }

    setCart((prev: CartItem[]) => {
      const existing = prev.find((item: CartItem) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) {
          toast.error("สินค้าในสต๊อกมีไม่เพียงพอ");
          return prev;
        }
        return prev.map((item: CartItem) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.sellingPrice),
          quantity: 1,
          maxStock: product.stockQty,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev: CartItem[]) =>
      prev
        .map((item: CartItem) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              toast.error("เกินจำนวนสต๊อกที่มี");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.productId !== productId));
  };

  const handleRewardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedReward(val);
    const chosenReward = rewards?.find((r: any) => r.id === val);
    if (chosenReward && chosenReward.rewardType === "FREE_ITEM") {
      toast.success(`แลกรับ "${chosenReward.name}" (โปรดมอบของแถมให้ลูกค้า)`);
    }
  };

  // --- คำนวณยอดเงินและส่วนลด ---
  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + (item.unitPrice * item.quantity), 0);
  
  let calculatedDiscount = 0;

  // 1. ส่วนลดจากโปรโมชั่น
  if (selectedPromoId) {
    const promo = promotions?.find((p: any) => p.id === selectedPromoId);
    if (promo) {
      if (promo.discountType === "PERCENTAGE") {
        calculatedDiscount += subtotal * (Number(promo.discountValue) / 100);
      } else {
        calculatedDiscount += Number(promo.discountValue);
      }
    }
  }

  // 2. ส่วนลดจาก Reward จากฐานข้อมูล
  if (selectedReward) {
    const chosenReward = rewards?.find((r: any) => r.id === selectedReward);
    if (chosenReward && chosenReward.rewardType === "DISCOUNT") {
      calculatedDiscount += Number(chosenReward.discountValue || 0);
    }
  }

  const actualDiscount = Math.min(calculatedDiscount, subtotal);
  const afterDiscount = subtotal - actualDiscount;
  const tax = afterDiscount * 0.07;
  const netTotal = afterDiscount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const res = await processCheckout({
      employeeId,
      customerId: selectedCustomer || undefined,
      promoId: selectedPromoId || undefined,
      orderType: orderType as any,
      items: cart.map((i: CartItem) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      paymentMethod: paymentMethod as any,
      discount: actualDiscount,
      tax,
      subtotal,
      netTotal,
      rewardType: selectedReward || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("ชำระเงินสำเร็จ!");
      setCart([]);
      setSelectedCustomer("");
      setSelectedPromoId("");
      setSelectedReward("");
      router.refresh();
    } else {
      toast.error(`เกิดข้อผิดพลาด: ${res.error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)] relative">
      
      {/* ฝั่งซ้าย: พื้นที่ขายหน้าร้าน */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden pr-2">
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div>
            <p className="text-xs font-semibold text-[#E85D75] mb-1">ขายหน้าร้าน</p>
            <h2 className="text-3xl font-extrabold text-[#361F4D] tracking-tight">สกู๊ปพร้อมเสิร์ฟ</h2>
            <p className="text-sm text-gray-500 mt-1">เลือกสินค้า แล้วปิดการขายในไม่กี่ขั้นตอน</p>
          </div>
          <div className="bg-emerald-50/80 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            ระบบพร้อมใช้งาน
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 shrink-0 flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาสินค้าหรือ SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FDFBF7] border border-gray-100 rounded-2xl focus:outline-none focus:border-[#E85D75] focus:bg-white transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                selectedCategory === "ALL"
                  ? "bg-[#E85D75] text-white border-[#E85D75]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              ทั้งหมด
            </button>
            {categories?.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? "bg-[#E85D75] text-white border-[#E85D75]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:border-[#E85D75] group h-56"
              >
                <div className="w-full h-24 bg-[#F8F5F0] rounded-2xl flex items-center justify-center text-[#E85D75] mb-3 group-hover:scale-95 transition-transform duration-300 shrink-0">
                  <IceCream size={32} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="font-bold text-[#361F4D] text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{product.category.name}</p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="font-extrabold text-[#361F4D] text-base">฿{Number(product.sellingPrice).toFixed(2)}</span>
                  <span className={`text-[10px] font-semibold ${product.stockQty > 0 ? 'text-gray-400' : 'text-red-500'}`}>
                    เหลือ {product.stockQty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: ตะกร้าและชำระเงิน */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h3 className="font-extrabold text-[#361F4D] text-lg">ออเดอร์ใหม่</h3>
            <p className="text-xs text-gray-500 font-medium">{cart.length} รายการในตะกร้า</p>
          </div>
          <button onClick={() => setCart([])} className="text-[11px] font-bold text-gray-400 hover:text-red-500 hover:underline">
            ล้างทั้งหมด
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center text-[#E85D75] mb-4 shadow-sm border border-pink-50">
              <ShoppingCart size={28} strokeWidth={1.5} />
            </div>
            <h4 className="font-bold text-[#361F4D] text-base mb-1">ยังไม่มีสินค้า</h4>
            <p className="text-xs text-gray-400">เลือกเมนูทางซ้ายเพื่อเริ่มออเดอร์</p>
          </div>
        ) : (
          <div className="flex flex-col bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden flex-1">
            
            <div className="space-y-4 mb-4 shrink-0">
              <select
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value);
                  setSelectedReward("");
                }}
                className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:border-[#E85D75]"
              >
                <option value="">-- เลือกลูกค้าสมาชิก (ถ้ามี) --</option>
                {customers?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>

              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button onClick={() => setOrderType("DINE_IN")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${orderType === "DINE_IN" ? "bg-[#361F4D] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}>ทานที่ร้าน</button>
                <button onClick={() => setOrderType("TAKEAWAY")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${orderType === "TAKEAWAY" ? "bg-[#361F4D] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}>กลับบ้าน</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar my-2 min-h-[100px]">
              {cart.map((item: CartItem) => (
                <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-bold text-[#361F4D] truncate">{item.name}</p>
                    <p className="text-[11px] font-semibold text-[#E85D75]">฿{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"><Minus size={14} /></button>
                    <span className="text-xs font-extrabold w-5 text-center text-[#361F4D]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"><Plus size={14} /></button>
                    <button onClick={() => removeFromCart(item.productId)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors ml-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 mt-2 border-t border-gray-100 pt-4">
              
              {currentCustomer && (
                <div className="bg-pink-50/50 border border-[#E85D75]/20 rounded-xl p-3 mb-3">
                  <div className="flex justify-between items-center border-b border-pink-100 pb-2 mb-2">
                    <div>
                      <p className="text-xs font-bold text-[#361F4D]">{currentCustomer.name}</p>
                      <p className="text-[10px] text-gray-500">{currentCustomer.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-yellow-200">
                        {currentCustomer.tier || "MEMBER"}
                      </span>
                      <p className="text-[11px] font-medium text-gray-600 mt-1 flex items-center gap-1 justify-end">
                        <Gift size={12} className="text-[#E85D75]" /> แต้ม: <span className="text-[#E85D75] font-bold">{currentCustomer.points || 0}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* แสดงรายการ Reward แบบไดนามิก */}
                  <select 
                    value={selectedReward}
                    onChange={handleRewardChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#E85D75] text-gray-600 bg-white"
                  >
                    <option value="">-- แลกแต้มรับสิทธิพิเศษ --</option>
                    {rewards?.map((r: any) => (
                      <option 
                        key={r.id} 
                        value={r.id} 
                        disabled={(currentCustomer.points || 0) < r.pointsRequired}
                      >
                        แลก {r.pointsRequired.toLocaleString()} แต้ม - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <select 
                    value={selectedPromoId}
                    onChange={(e) => setSelectedPromoId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75] bg-white appearance-none"
                  >
                    <option value="">-- เลือกใช้โปรโมชั่นแคมเปญ --</option>
                    {promotions?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ลด {Number(p.discountValue)}{p.discountType === 'PERCENTAGE' ? '%' : ' บาท'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-xs font-medium px-2 mb-4">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toFixed(2)}</span>
                </div>
                
                {actualDiscount > 0 && (
                  <div className="flex justify-between text-[#E85D75] font-bold">
                    <span>ส่วนลด</span>
                    <span>- ฿{actualDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-500">
                  <span>VAT (7%)</span>
                  <span>฿{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#361F4D] text-base pt-3 border-t border-gray-100">
                  <span>ยอดรวมสุทธิ</span>
                  <span className="text-[#E85D75]">฿{netTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[{ id: "CASH", label: "เงินสด" }, { id: "PROMPTPAY", label: "PromptPay" }, { id: "CREDIT_CARD", label: "บัตรเครดิต" }].map((m) => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${paymentMethod === m.id ? "border-[#E85D75] bg-[#FFF5F7] text-[#E85D75]" : "border-gray-200 text-gray-500 bg-white"}`}>{m.label}</button>
                ))}
              </div>

              <button onClick={handleCheckout} disabled={cart.length === 0 || isSubmitting} className="w-full bg-[#E85D75] hover:bg-[#D14D63] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                <CheckCircle2 size={20} />
                {isSubmitting ? "กำลังดำเนินการ..." : `ชำระเงิน ฿${netTotal.toFixed(2)}`}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}