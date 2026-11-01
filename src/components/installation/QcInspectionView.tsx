"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Camera,
  FileText,
  AlertTriangle,
  Send,
  ExternalLink,
} from "lucide-react";
import { submitQcInspectionDecisionAction } from "@/app/actions/installation";

interface ChecklistItem {
  item: string;
  ref: string;
  status: "passed" | "failed";
  statusLabel: string;
}

interface QcInspectionViewProps {
  inspection: {
    id: string;
    inspectionNo: string;
    projectId: string;
    packageId?: string | null;
    scope: string;
    drawingRef?: string | null;
    status: string;
    inspector: string;
    inspectedAt: Date;
    checklist: ChecklistItem[];
    notes?: string | null;
    ncrCode?: string | null;
    photos: string[];
    project?: any;
    workPackage?: any;
  };
}

export function QcInspectionView({ inspection }: QcInspectionViewProps) {
  const router = useRouter();

  const [scope, setScope] = useState(inspection.scope || "F01–F10");
  const [notes, setNotes] = useState(
    inspection.notes || "แก้ไขผิวและรอยต่อ F08 แนบหลักฐานก่อนตรวจซ้ำ"
  );
  const [rejectEntirely, setRejectEntirely] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checklistItems: ChecklistItem[] = (Array.isArray(inspection.checklist) &&
  inspection.checklist.length > 0
    ? inspection.checklist
    : [
        { item: "แนวและระดับ", ref: "ผลวัดแนบ SUR-F-012", status: "passed", statusLabel: "ผ่าน" },
        { item: "ส่วนประกอบ / การยึด", ref: "Checklist F Rev.02", status: "passed", statusLabel: "ผ่าน" },
        { item: "ผิวและรอยต่อ F08", ref: "ภาพ defect-F08.jpg", status: "failed", statusLabel: "ไม่ผ่าน" },
        { item: "ความครบถ้วนเอกสาร", ref: "แบบ / วัสดุ / ผลวัด", status: "passed", statusLabel: "ครบ" },
      ]) as ChecklistItem[];

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "RE_INSPECT") => {
    try {
      setIsSubmitting(true);
      await submitQcInspectionDecisionAction({
        inspectionNo: inspection.inspectionNo,
        decision,
        scope,
        notes,
      });
      if (decision === "REJECTED" || decision === "RE_INSPECT") {
        router.push(`/installation/ncr/${inspection.ncrCode || "NCR-260006"}`);
      } else {
        router.push("/installation");
      }
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 24 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/installation"
              className="text-xs font-medium text-gray-500 hover:text-[#075DD8] transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              การติดตั้งและตรวจคุณภาพ
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-gray-700">พื้นที่ทำงาน</span>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-[#075DD8]">
              ตรวจและพิจารณาคำขอ QC
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#132142]">
              ตรวจและพิจารณาคำขอ QC
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
              รอตรวจซ้ำ
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {inspection.inspectionNo} · WP-F-01 โซน A ({inspection.scope}) · {inspection.drawingRef || "Drawing F-101 Rev.03"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inspection.ncrCode && (
            <Link
              href={`/installation/ncr/${inspection.ncrCode}`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              ดู NCR: {inspection.ncrCode}
            </Link>
          )}
        </div>
      </div>

      {/* 2-Column Grid matching SVG 24 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Checklist & Evidence Photos */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: รายการตรวจสอบและผลตรวจ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#132142]">รายการตรวจสอบและผลตรวจ</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  ตรวจสอบตามเกณฑ์ Checklist งานเสารั้วสำเร็จรูป (F)
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                4 รายการ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">รายการตรวจ</th>
                    <th className="py-3 px-4">เกณฑ์ / เอกสารอ้างอิง</th>
                    <th className="py-3 px-4 text-center">ผลตรวจ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {checklistItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={item.status === "failed" ? "bg-rose-50/30" : "hover:bg-gray-50/50"}
                    >
                      <td className="py-3 px-4 font-semibold text-[#132142]">{item.item}</td>
                      <td className="py-3 px-4 text-gray-600">{item.ref}</td>
                      <td className="py-3 px-4 text-center">
                        {item.status === "passed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {item.statusLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 font-bold">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            {item.statusLabel}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: ภาพหลักฐาน · เชื่อมตำแหน่งและรายการตรวจ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#132142] mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#075DD8]" />
              ภาพหลักฐาน · เชื่อมตำแหน่งและรายการตรวจ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1 */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                <div className="h-36 rounded-md bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-400">
                  <Camera className="w-8 h-8 mb-2 opacity-60" />
                  <span className="text-[11px] font-semibold text-blue-700">ภาพแนวเสา F01–F07</span>
                  <span className="text-[10px] text-gray-500">survey-01.jpg · ผ่านเกณฑ์</span>
                </div>
                <div className="mt-2 text-xs flex items-center justify-between text-gray-600">
                  <span>ตำแหน่ง F01–F07</span>
                  <span className="text-emerald-600 font-semibold">ผ่าน</span>
                </div>
              </div>

              {/* Photo 2: Defect */}
              <div className="border border-rose-200 rounded-lg p-3 bg-rose-50/30">
                <div className="h-36 rounded-md bg-rose-100/50 border border-rose-200 flex flex-col items-center justify-center text-rose-500">
                  <AlertTriangle className="w-8 h-8 mb-2 opacity-70" />
                  <span className="text-[11px] font-bold text-rose-700">defect-F08.jpg</span>
                  <span className="text-[10px] text-rose-600">รอยต่อผิวคอนกรีตไม่เรียบเนียน</span>
                </div>
                <div className="mt-2 text-xs flex items-center justify-between">
                  <span className="text-rose-800 font-medium">ตำแหน่ง F08</span>
                  <span className="text-rose-600 font-bold">ไม่ผ่าน (รอแก้ไข)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>ผู้ตรวจ: {inspection.inspector}</span>
              <span>12 ก.ย. 2569 เวลา 15:00</span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): คำตัดสินและขอบเขต */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#132142] pb-3 border-b border-gray-100">
              คำตัดสินและขอบเขต
            </h3>

            {/* Alert Banner: มีรายการไม่ผ่าน */}
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                มีรายการไม่ผ่าน
              </div>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                พบข้อบกพร่องที่จุด F08 ไม่สามารถปล่อยงานทั้งขอบเขตได้จนกว่าจะแก้ไข
              </p>
            </div>

            {/* Field: ขอบเขตที่ตรวจ */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ขอบเขตที่ตรวจ
              </label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>

            {/* Field: เหตุผล / ข้อแก้ไข */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                เหตุผล / ข้อแก้ไข *
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>

            {/* Option Radio */}
            <div className="space-y-2 text-xs text-gray-700 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope_reject"
                  checked={rejectEntirely}
                  onChange={() => setRejectEntirely(true)}
                  className="text-[#075DD8] focus:ring-[#075DD8]"
                />
                <span className="font-semibold text-rose-700">ไม่ผ่านทั้งคำขอนี้</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope_reject"
                  checked={!rejectEntirely}
                  onChange={() => setRejectEntirely(false)}
                  className="text-[#075DD8] focus:ring-[#075DD8]"
                />
                <span className="text-gray-500">
                  หากแบ่งรับบางส่วน ต้องระบุขอบเขตและผู้มีอำนาจตาม Template
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision("RE_INSPECT")}
                className="w-full py-2.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                ส่งกลับแก้ไข / เปิด NCR
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision("APPROVED")}
                className="w-full py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                บันทึกผลตรวจ
              </button>

              <button
                type="button"
                disabled={true}
                className="w-full py-2 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed"
                title="ยังมีรายการไม่ผ่าน ไม่สามารถอนุมัติได้"
              >
                อนุมัติผ่าน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
