import { getCategories } from "./actions";
import { Plus, Search, Tags, Edit, Trash2 } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <Tags className="text-[#E85D75]" />
            หมวดหมู่สินค้า
          </h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการประเภทของสินค้าภายในร้าน</p>
        </div>
        
        <button className="bg-[#E85D75] hover:bg-[#D14D63] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm text-sm">
          <Plus size={18} />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาหมวดหมู่..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75] text-sm"
          />
        </div>
        <div className="text-sm text-gray-500 w-full sm:w-auto text-right">
          ทั้งหมด <span className="font-bold text-[#361F4D]">{categories.length}</span> รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ชื่อหมวดหมู่</th>
                <th className="px-6 py-4 font-medium">รายละเอียด</th>
                <th className="px-6 py-4 font-medium text-center">จำนวนสินค้า</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="text-[#361F4D] hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{category.name}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-pink-50 text-[#E85D75] px-3 py-1 rounded-full text-xs font-bold">
                        {category._count.products}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Tags size={32} className="text-gray-300" />
                      <p>ยังไม่มีข้อมูลหมวดหมู่สินค้า</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}