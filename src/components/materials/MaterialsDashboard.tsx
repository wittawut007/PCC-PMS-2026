"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  Factory,
  AlertTriangle,
  FileText,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Download,
} from "lucide-react";
import { MaterialKpiSummary, MaterialDocumentItem } from "@/app/actions/materials";

interface MaterialsDashboardProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
    workType: string;
    status: string;
    clientName: string;
    siteAddress?: string | null;
  }>;
  currentProject: any;
  kpis: MaterialKpiSummary | null;
  documents: MaterialDocumentItem[];
  drawingRev: string;
}

export function MaterialsDashboard({
  allProjects,
  currentProject,
  kpis,
  documents,
  drawingRev,
}: MaterialsDashboardProps) {
  const router = useRouter();

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    router.push(`/materials?projectId=${selectedId}`);
  };

  const projectTabs = [
    { label: "ภาพรวม", href: `/projects/${currentProject.id}` },
    { label: "ชุดงาน", href: `/projects/${currentProject.id}` },
    { label: "แผนงาน", href: `/planning?projectId=${currentProject.id}` },
    { label: "แบบ / BOM", href: `/projects/${currentProject.id}?tab=bom` },
    { label: "วัสดุ", href: `/materials?projectId=${currentProject.id}`, active: true },
    { label: "ขนส่ง", href: `/transport?projectId=${currentProject.id}` },
    { label: "ติดตั้ง / QC", href: `/installation?projectId=${currentProject.id}` },
    { label: "เอกสาร", href: `/documents?projectId=${currentProject.id}` },
    { label: "รูปภาพ", href: `/photos?projectId=${currentProject.id}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Project Switcher matching SVG 12 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-[#596780] mb-1">
            PCC PMS / โครงการทั้งหมด / {currentProject.name} / วัสดุและเอกสารส่งคลัง
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              {currentProject.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3FF] text-[#075DD8]">
              งาน{currentProject.workType === "F" ? "เสารั้ว (F)" : currentProject.workType === "RW" ? "กำแพงกันดิน (RW)" : currentProject.workType === "RWF" ? "กำแพงพร้อมรั้ว (RWF)" : "พื้นโพสเทนชั่น (PT)"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF7F0] text-[#147747]">
              กำลังดำเนินงาน
            </span>
          </div>
          <p className="text-xs text-[#596780] mt-1">
            {currentProject.code} · ผู้ว่าจ้าง: {currentProject.clientName} · สัญญา 4.85 ลบ. (4 งวด) · 1 ก.ย. – 30 พ.ย. 2569 (90 วัน)
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
            href={`/projects/${currentProject.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all"
          >
            เปิดศูนย์กลางโครงการ
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-[#E4EAF4] overflow-x-auto gap-6 text-xs font-medium">
        {projectTabs.map((tab, idx) => (
          <Link
            key={idx}
            href={tab.href}
            className={`pb-3 whitespace-nowrap transition-colors border-b-2 ${
              tab.active
                ? "border-[#075DD8] text-[#075DD8] font-bold"
                : "border-transparent text-[#596780] hover:text-[#0D255B]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 4 KPI Cards matching SVG 12 */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: ต้องใช้ตาม BOM */}
          <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#596780]">ต้องใช้ตาม BOM</span>
              <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0D255B] mt-2">
              {kpis.required.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
              {kpis.unit}
            </div>
          </div>

          {/* Card 2: คลังยืนยันพร้อม */}
          <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#596780]">คลังยืนยันพร้อม</span>
              <div className="w-7 h-7 rounded-lg bg-[#EAF7F0] text-[#147747] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#147747] mt-2">
              {kpis.allocated.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
              {kpis.allocatedRef}
            </div>
          </div>

          {/* Card 3: กำลังผลิตเดิม */}
          <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#596780]">กำลังผลิตเดิม</span>
              <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#075DD8] mt-2">
              {kpis.producing.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
              {kpis.producingNote}
            </div>
          </div>

          {/* Card 4: ต้องจัดหาเพิ่ม */}
          <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#596780]">ต้องจัดหาเพิ่ม</span>
              <div className="w-7 h-7 rounded-lg bg-[#FFF7EB] text-[#B25E09] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#B25E09] mt-2">
              {kpis.shortage.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7086A8] mt-1 font-medium">
              {kpis.shortageFormula}
            </div>
          </div>
        </div>
      )}

      {/* Info Banner matching SVG 12 */}
      <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5] flex items-start gap-3">
        <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-[#0D255B] block font-bold">
            ข้อมูลจากระบบคลังภายนอก
          </strong>
          <p className="text-[#596780] mt-0.5 leading-relaxed text-[11px]">
            ยืนยันล่าสุด 11 ก.ย. 2569 เวลา 16:30 • จำนวนพร้อมใช้ต้องตรวจสอบอีกครั้งก่อนปล่อยขนส่ง • ระบบนี้ไม่ตัดสต็อก
          </p>
        </div>
      </div>

      {/* Material Documents Table Card matching SVG 12 */}
      <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[#E4EAF4]">
          <h2 className="text-base font-bold text-[#0D255B]">
            เอกสารวัสดุและการตอบกลับ ({currentProject.code} · ผูกกับ {drawingRev})
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                <th className="py-3 px-6">เอกสาร</th>
                <th className="py-3 px-6">ชุดงาน / Revision</th>
                <th className="py-3 px-6">วันที่ต้องใช้</th>
                <th className="py-3 px-6">การตอบกลับ</th>
                <th className="py-3 px-6 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4FA]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F9FBFE] transition-colors">
                  <td className="py-4 px-6 font-bold text-[#075DD8]">
                    {doc.kind === "REQUEST" ? (
                      <Link href={`/materials/dispatch/${doc.id}`} className="hover:underline">
                        {doc.docNo}
                      </Link>
                    ) : (
                      doc.docNo
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-[#0D255B]">
                    {doc.packageAndRev}
                  </td>
                  <td className="py-4 px-6 text-[#596780]">
                    {doc.neededByDate}
                  </td>
                  <td className="py-4 px-6 font-medium text-[#0D255B]">
                    {doc.responseInfo}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        doc.statusTone === "orange"
                          ? "bg-[#FFF7EB] text-[#B25E09]"
                          : doc.statusTone === "green"
                          ? "bg-[#EAF7F0] text-[#147747]"
                          : doc.statusTone === "blue"
                          ? "bg-[#EAF3FF] text-[#075DD8]"
                          : "bg-[#F3F5F9] text-[#596780]"
                      }`}
                    >
                      {doc.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons matching SVG 12 */}
        <div className="p-6 bg-[#FCFDFF] border-t border-[#E4EAF4] flex flex-wrap items-center gap-3">
          <Link
            href={`/materials/request/new?projectId=${currentProject.id}`}
            className="px-5 py-2.5 rounded-lg bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            สร้างคำขอวัสดุ
          </Link>

          <Link
            href={`/materials/dispatch/req-260012`}
            className="px-4 py-2.5 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all inline-flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-[#075DD8]" />
            เตรียมไฟล์ส่งคลัง
          </Link>

          <Link
            href={`/production?projectId=${currentProject.id}`}
            className="px-4 py-2.5 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all inline-flex items-center gap-2"
          >
            <Factory className="w-3.5 h-3.5 text-[#075DD8]" />
            ติดตามคำขอผลิต
          </Link>
        </div>
      </div>

      {/* Bottom Lifecycle Box matching SVG 12 */}
      <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5] flex items-start gap-3">
        <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-[#0D255B] block font-bold">
            ติดตามเอกสารได้ครบวงจร
          </strong>
          <p className="text-[#596780] mt-0.5 leading-relaxed text-[11px]">
            เก็บเลขอ้างอิงภายนอก ผู้ยืนยัน เวลา ไฟล์ตอบกลับ และปริมาณที่ยืนยัน • สถานะเอกสารแยกจากสถานะวัสดุ
          </p>
        </div>
      </div>
    </div>
  );
}
