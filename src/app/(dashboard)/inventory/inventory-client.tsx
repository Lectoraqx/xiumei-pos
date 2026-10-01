"use client";

import React, { useState } from "react";
import { Search, Package, AlertCircle, ArrowDownToLine, ArrowUpFromLine, RefreshCw, X, AlertTriangle } from "lucide-react";
import { adjustStock } from "./actions";

export default function InventoryClient({ initialInventory, employeeId }: { initialInventory: any[], employeeId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Form State สำหรับปรับสต๊อก
  const [adjType, setAdjType] = useState<"STOCK_IN" | "ADJUST_ADD" | "ADJUST_MINUS" | "WASTE">("STOCK_IN");
  const [adjQty, setAdjQty] = useState<number | "">("");
  const [adjReason, setAdjReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // กรองสินค้าตามคำค้นหา
  const filteredData = initialInventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdjustModal = (product: any) => {
    setSelectedProduct(product);
    setAdjType("STOCK_IN");
    setAdjQty("");
    setAdjReason("");
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjQty || adjQty <= 0) return;
    
    setIsSubmitting(true);
    const res = await adjustStock({
      productId: selectedProduct.id,
      type: adjType,
      quantity: Number(adjQty),
      reason: adjReason || (adjType === "STOCK_IN" ? "รับสินค้าเข้าใหม่" : "ปรับปรุงสต๊อก"),
      employeeId
    });
    setIsSubmitting(false);

    if (res.success) {
      alert("ปรับปรุงสต๊อกสำเร็จ!");
      setIsModalOpen(false);
    } else {
      alert(`เกิดข้อผิดพลาด: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Package className="text-[#E85D75]" />
            สต๊อกและคลังสินค้า
          </h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการสินค้ารับเข้า ปรับปรุงยอด และดูสถานะคงเหลือ</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">สินค้าทั้งหมด</p>
            <p className="text-2xl font-bold text-[#361F4D]">{initialInventory.length} <span className="text-sm font-normal text-gray-400">รายการ</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-yellow-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-yellow-600">สินค้าใกล้หมด (Low Stock)</p>
            <p className="text-2xl font-bold text-[#361F4D]">{initialInventory.filter(i => i.stockQty > 0 && i.stockQty <= i.minStock).length} <span className="text-sm font-normal text-gray-400">รายการ</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-red-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-red-500">หมดสต๊อก (Out of Stock)</p>
            <p className="text-2xl font-bold text-[#361F4D]">{initialInventory.filter(i => i.stockQty === 0).length} <span className="text-sm font-normal text-gray-400">รายการ</span></p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า หรือหมวดหมู่..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อสินค้า</th>
                <th className="px-6 py-4 font-medium">หมวดหมู่</th>
                <th className="px-6 py-4 font-medium text-right">สต๊อกปัจจุบัน</th>
                <th className="px-6 py-4 font-medium text-right">จุดสั่งซื้อ (Min)</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-center">จัดการสต๊อก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((item) => {
                const isOutOfStock = item.stockQty === 0;
                const isLowStock = !isOutOfStock && item.stockQty <= item.minStock;
                
                return (
                  <tr key={item.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.category.name}</td>
                    <td className={`px-6 py-4 text-right font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-600' : 'text-[#361F4D]'}`}>
                      {item.stockQty} <span className="text-xs font-normal text-gray-400">{item.unitType}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{item.minStock}</td>
                    <td className="px-6 py-4 text-center">
                      {isOutOfStock ? (
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">หมดสต๊อก</span>
                      ) : isLowStock ? (
                        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100">ใกล้หมด</span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">พร้อมขาย</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openAdjustModal(item)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-2"
                      >
                        <RefreshCw size={14} /> ปรับสต๊อก
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">ไม่พบข้อมูลสินค้าที่ค้นหา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ปรับสต๊อก */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <div>
                <h3 className="font-bold text-lg text-[#361F4D]">ปรับปรุงสต๊อกสินค้า</h3>
                <p className="text-sm text-[#E85D75] font-medium">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm text-gray-500 font-medium">สต๊อกปัจจุบัน:</span>
                <span className="text-2xl font-bold text-[#361F4D]">{selectedProduct.stockQty} <span className="text-sm text-gray-400 font-normal">{selectedProduct.unitType}</span></span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการทำรายการ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAdjType("STOCK_IN")} className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${adjType === "STOCK_IN" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-600"}`}><ArrowDownToLine size={16}/> รับเข้า</button>
                  <button type="button" onClick={() => setAdjType("ADJUST_MINUS")} className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${adjType === "ADJUST_MINUS" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-gray-200 text-gray-600"}`}><ArrowUpFromLine size={16}/> ปรับลด</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">จำนวน ({selectedProduct.unitType})</label>
                <input type="number" min="1" required value={adjQty} onChange={(e) => setAdjQty(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75]" placeholder="ระบุจำนวนตัวเลข..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ / เหตุผล (ถ้ามี)</label>
                <input type="text" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75]" placeholder="เช่น รับของจาก Supplier A..." />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#E85D75] hover:bg-[#D14D63] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการปรับสต๊อก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}