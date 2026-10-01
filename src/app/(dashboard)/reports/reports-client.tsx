"use client";

import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Receipt, Package, Trash2, Calendar, Download, Printer, Loader2 } from "lucide-react";
import { getReportSummary } from "./actions";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { th } from "date-fns/locale";

export default function ReportsClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  
  // Date Filters
  const [dateRange, setDateRange] = useState("7days");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const loadReport = async (start: string, end: string) => {
    setIsLoading(true);
    const res = await getReportSummary(start, end);
    if (res.success) {
      setReportData(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReport(startDate, endDate);
  }, [startDate, endDate]);

  const handleDateFilterChange = (range: string) => {
    setDateRange(range);
    const today = new Date();
    let start = new Date();
    let end = today;

    if (range === "today") {
      start = today;
    } else if (range === "7days") {
      start = subDays(today, 6);
    } else if (range === "30days") {
      start = subDays(today, 29);
    } else if (range === "thisMonth") {
      start = startOfMonth(today);
      end = endOfMonth(today);
    }

    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  };

  // ----------------------------------------------------
  // ฟังก์ชันดาวน์โหลด Excel
  // ----------------------------------------------------
  const handleExportExcel = async () => {
    try {
      alert("กำลังสร้างไฟล์ Excel กรุณารอสักครู่...");
      const response = await fetch(`/api/export/excel?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      saveAs(blob, `Xiumei_秀美_SalesReport_${startDate}_to_${endDate}.xlsx`);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด Excel");
    }
  };

  // ----------------------------------------------------
  // ฟังก์ชัน Print/PDF
  // ----------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  // Custom Tooltip สำหรับกราฟ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-gray-500 text-sm mb-1">{format(new Date(label), "d MMM yyyy", { locale: th })}</p>
          <p className="font-bold text-[#E85D75] text-lg">
            ฿{Number(payload[0].value).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#361F4D] flex items-center gap-2">
            <BarChart3 className="text-[#E85D75]" /> ศูนย์รวมรายงาน
          </h1>
          <p className="text-gray-500 mt-1 text-sm">วิเคราะห์ยอดขาย สต๊อก และผลการดำเนินงานของร้าน</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* เพิ่ม onClick ผูกกับฟังก์ชันที่สร้างไว้ */}
          <button onClick={handleExportExcel} className="flex-1 md:flex-none bg-white border border-gray-200 text-green-700 hover:bg-green-50 px-4 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
            <Download size={16} /> Excel
          </button>
          <button onClick={handlePrint} className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
            <Printer size={16} /> พิมพ์
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "today", label: "วันนี้" },
            { id: "7days", label: "7 วันที่ผ่านมา" },
            { id: "30days", label: "30 วันที่ผ่านมา" },
            { id: "thisMonth", label: "เดือนนี้" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleDateFilterChange(btn.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-colors ${
                dateRange === btn.id
                  ? "bg-[#361F4D] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400"/>
          {/* จัดรูปแบบให้วันที่อยู่บรรทัดเดียวกันและมีเครื่องหมาย - คั่นกลาง */}
          <span>
            {format(new Date(startDate), "d MMM yy", { locale: th })} - {format(new Date(endDate), "d MMM yy", { locale: th })}
          </span>
        </div>
      </div>

      {isLoading || !reportData ? (
        <div className="flex justify-center items-center py-20 text-[#E85D75]">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start"><p className="text-sm font-medium text-gray-500">ยอดขายสุทธิ</p><TrendingUp size={16} className="text-[#E85D75]"/></div>
              <h3 className="text-2xl font-bold text-[#361F4D]">฿{reportData.totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start"><p className="text-sm font-medium text-gray-500">จำนวนออเดอร์</p><Receipt size={16} className="text-blue-500"/></div>
              <h3 className="text-2xl font-bold text-[#361F4D]">{reportData.totalOrders.toLocaleString()} <span className="text-sm font-normal text-gray-400">บิล</span></h3>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start"><p className="text-sm font-medium text-gray-500">ยอดเฉลี่ยต่อบิล</p><BarChart3 size={16} className="text-gray-400"/></div>
              <h3 className="text-2xl font-bold text-[#361F4D]">฿{reportData.avgTicket.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start"><p className="text-sm font-medium text-gray-500">ต้นทุนของเสีย</p><Trash2 size={16} className="text-red-500"/></div>
              <h3 className="text-2xl font-bold text-red-500">฿{reportData.totalWasteCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#361F4D] text-lg mb-6">แนวโน้มยอดขาย</h3>
            <div className="h-[350px] w-full">
              {reportData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E85D75" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E85D75" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => format(new Date(tick), "d MMM", { locale: th })} 
                      axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10}
                    />
                    <YAxis 
                      axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value) => `฿${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sales" stroke="#E85D75" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 size={48} className="mb-2 opacity-20" />
                  <p>ไม่มีข้อมูลยอดขายในช่วงเวลานี้</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}