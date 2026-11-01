"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Factory,
  CheckCircle2,
  Package,
  Plus,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ProductionDashboardProps {
  allProjects: Array<{ id: string; code: string; name: string; workType: string }>;
  currentProject: any;
  kpis: {
    required: number;
    itemLabel: string;
    confirmed: number;
    confirmedRef: string;
    existingQty: number;
    existingRef: string;
    requestedAddQty: number;
    requestedAddRef: string;
  };
  orders: Array<{
    id: string;
    orderNo: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unit: string;
    readyDate: string;
    latestUpdate: string;
    status: string;
    history: Array<{ date: string; text: string }>;
  }>;
  detailOrder: {
    orderNo: string;
    history: Array<{ date: string; text: string }>;
  } | null;
}

export function ProductionDashboard({
  allProjects,
  currentProject,
  kpis,
  orders,
  detailOrder,
}: ProductionDashboardProps) {
  const router = useRouter();

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    router.push(`/production?projectId=${selectedId}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching SVG 15 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-[#596780] mb-1">
            PCC PMS / พื้นที่ทำงาน / ติดตามคำขอผลิต
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              ติดตามคำขอผลิต
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3FF] text-[#075DD8]">
              {currentProject.code} · {currentProject.name}
            </span>
          </div>
          <p className="text-xs text-[#596780] mt-0.5">
            โครงการตัวอย่าง PCC · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <select
              value={currentProject.id}
              onChange={handleProjectChange}
              className="appearance-none bg-white border border-[#D0D9E7] text-xs font-semibold text-[#0D255B] rounded-lg py-2 pl-3 pr-8 hover:border-[#075DD8] focus:outline-none focus:ring-1 focus:ring-[#075DD8] shadow-xs cursor-pointer"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name} ({p.workType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#596780] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <Link
            href={`/materials?projectId=${currentProject.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all"
          >
            คลังวัสดุ
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards matching SVG 15 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: รายการต้องใช้ */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#596780]">รายการต้องใช้</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0D255B] mt-2">
            {kpis.required.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
            {kpis.itemLabel}
          </div>
        </div>

        {/* Card 2: พร้อมจากคลัง */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#596780]">พร้อมจากคลัง</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF7F0] text-[#147747] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#147747] mt-2">
            {kpis.confirmed.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
            {kpis.confirmedRef}
          </div>
        </div>

        {/* Card 3: ผลิตอยู่เดิม */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#596780]">ผลิตอยู่เดิม</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#075DD8] mt-2">
            {kpis.existingQty.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
            {kpis.existingRef}
          </div>
        </div>

        {/* Card 4: ขอผลิตเพิ่ม */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#596780]">ขอผลิตเพิ่ม</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFF7EB] text-[#B25E09] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#B25E09] mt-2">
            {kpis.requestedAddQty.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
            {kpis.requestedAddRef}
          </div>
        </div>
      </div>

      {/* Production Orders Table Card matching SVG 15 */}
      <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4EAF4]">
          <h2 className="text-base font-bold text-[#0D255B]">
            คำขอผลิตที่เกี่ยวข้อง
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                <th className="py-3 px-6">เลขคำขอ / รายการ</th>
                <th className="py-3 px-6 text-center">จำนวน</th>
                <th className="py-3 px-6">กำหนดพร้อม</th>
                <th className="py-3 px-6">อัปเดตล่าสุด</th>
                <th className="py-3 px-6 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4FA]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F9FBFE] transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#0D255B]">
                    <span className="text-[#075DD8]">{order.orderNo}</span> · {order.itemName}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-[#0D255B]">
                    {order.quantity} {order.unit}
                  </td>
                  <td className="py-4 px-6 text-[#596780]">
                    {order.readyDate}
                  </td>
                  <td className="py-4 px-6 font-medium text-[#0D255B]">
                    {order.latestUpdate}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        order.status === "PRODUCING"
                          ? "bg-[#EAF3FF] text-[#075DD8]"
                          : "bg-[#FFF7EB] text-[#B25E09]"
                      }`}
                    >
                      {order.status === "PRODUCING" ? "กำลังผลิต" : "รอยืนยัน"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons matching SVG 15 */}
        <div className="p-6 bg-[#FCFDFF] border-t border-[#E4EAF4] flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => alert("กำลังพิมพ์ใบสั่งผลิต")}
            className="px-4 py-2.5 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all inline-flex items-center gap-2 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            ออกเอกสารคำขอผลิต
          </button>

          <button
            type="button"
            onClick={() => alert("ระบบบันทึกสถานะล่าสุด")}
            className="px-5 py-2.5 rounded-lg bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            บันทึกสถานะล่าสุด
          </button>
        </div>
      </div>

      {/* Bottom Two Cards matching SVG 15 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: History Log */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
          <h3 className="text-sm font-bold text-[#0D255B] mb-4">
            ประวัติ {detailOrder?.orderNo || "PRD-260009"}
          </h3>

          <div className="space-y-3">
            {detailOrder?.history.map((h, i) => (
              <div key={i} className="text-xs text-[#0D255B] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#075DD8]" />
                <span className="font-semibold">{h.date}</span> · {h.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Transport Warning & Action */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5]">
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-[#0D255B] block">
                  พร้อมผลิต ≠ พร้อมติดตั้ง
                </strong>
                <p className="text-[11px] text-[#596780] mt-1 leading-normal">
                  ต้องผ่านการรับวัสดุและเงื่อนไขของชุดงานก่อนปล่อยกิจกรรม
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/transport?projectId=${currentProject.id}`}
            className="w-full py-3 px-4 rounded-xl border border-[#D0D9E7] bg-white hover:bg-[#F5F8FD] text-[#075DD8] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            วางแผนการขนส่ง
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
