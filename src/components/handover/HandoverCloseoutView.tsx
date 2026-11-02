"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  ChevronRight,
  FileText,
} from "lucide-react";

interface HandoverItemRow {
  id: string;
  title: string;
  ownerRole: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  notes?: string | null;
}

interface HandoverCloseoutViewProps {
  currentProject: any;
  items: HandoverItemRow[];
  readinessPercent: number;
  canClose: boolean;
  alertMessage: string;
}

export function HandoverCloseoutView({
  currentProject,
  items,
  readinessPercent,
  canClose,
  alertMessage,
}: HandoverCloseoutViewProps) {
  const [showDossierModal, setShowDossierModal] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 29 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  พื้นที่ทำงาน  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">ส่งมอบและปิดโครงการ</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">ส่งมอบและปิดโครงการ</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#075DD8] border border-blue-200">
                {currentProject?.code || "PCC-26001"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentProject?.name || "โครงการตัวอย่าง PCC"} · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDossierModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <FolderArchive className="w-4 h-4" />
              เปิดชุดเอกสารส่งมอบ
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid matching SVG 29 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): รายการตรวจความพร้อมส่งมอบ */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#075DD8]" />
                  รายการตรวจความพร้อมส่งมอบ
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  ความพร้อมด้านเทคนิค ตรวจรับ บัญชี และเอกสารควบคุมก่อนปิดโครงการ
                </p>
              </div>
              <span className="text-xs font-bold text-[#075DD8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {items.length} รายการ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">รายการ</th>
                    <th className="py-3 px-4">เจ้าของงาน</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/20 transition">
                      <td className="py-3.5 px-4 font-semibold text-[#132142]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#075DD8]" />
                          <span>{row.title}</span>
                        </div>
                        {row.notes && (
                          <p className="text-[11px] text-gray-500 font-normal pl-4 mt-0.5">
                            {row.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {row.ownerRole}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.statusTone === "rose"
                              ? "bg-rose-50 text-rose-700 border border-rose-300 font-bold"
                              : row.statusTone === "orange"
                              ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                              : row.statusTone === "blue"
                              ? "bg-blue-50 text-blue-700 border border-blue-300"
                              : row.statusTone === "green"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {row.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): สถานะการส่งมอบ & Workflow */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#132142]">สถานะการส่งมอบ</h3>
              <span className="text-xs font-bold text-[#075DD8] bg-blue-50 px-2 py-0.5 rounded">
                ความพร้อม {readinessPercent}%
              </span>
            </div>

            {/* Stepper list */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  1
                </div>
                <h4 className="text-xs font-bold text-gray-900">ตรวจความพร้อม</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  แก้ไขข้อค้างตามผู้รับผิดชอบ
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  2
                </div>
                <h4 className="text-xs font-bold text-gray-400">รับมอบด้านเทคนิค</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  ต้องมีผู้รับมอบ / วัน / ขอบเขต
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  3
                </div>
                <h4 className="text-xs font-bold text-gray-400">ปิดด้านบัญชีและระบบ</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  แยกจากการรับมอบหน้างาน
                </p>
              </div>
            </div>

            {/* Alert box: ยังไม่พร้อมปิดโครงการ */}
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                ยังไม่พร้อมปิดโครงการ
              </div>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                {alertMessage}
              </p>
            </div>

            {/* Action Buttons matching SVG 29 */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link
                href="/installation/ncr/NCR-260006"
                className="w-full py-2.5 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                ติดตามงานค้าง
              </Link>

              <button
                type="button"
                disabled={!canClose}
                className="w-full py-2 text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-center"
              >
                ยืนยันปิดโครงการ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#132142] flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-[#075DD8]" />
              ชุดเอกสารส่งมอบโครงการ (Handover Dossier)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded bg-gray-50 border flex items-center justify-between">
                <span>1. As-Built Drawing F-101 Rev.03</span>
                <span className="text-emerald-600 font-semibold">พร้อมส่งมอบ</span>
              </div>
              <div className="p-3 rounded bg-gray-50 border flex items-center justify-between">
                <span>2. รายงานผลการทดสอบวัสดุ & Mill Certificate</span>
                <span className="text-emerald-600 font-semibold">พร้อมส่งมอบ</span>
              </div>
              <div className="p-3 rounded bg-gray-50 border flex items-center justify-between">
                <span>3. ใบรับรองการตรวจสอบคุณภาพ (QC Certificate)</span>
                <span className="text-amber-600 font-semibold">รอปิด NCR F08</span>
              </div>
              <div className="p-3 rounded bg-gray-50 border flex items-center justify-between">
                <span>4. คู่มือการบำรุงรักษาและการรับประกัน (Warranty)</span>
                <span className="text-emerald-600 font-semibold">พร้อมส่งมอบ</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDossierModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
