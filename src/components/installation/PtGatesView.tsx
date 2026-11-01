"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  FileCheck,
  Lock,
  Layers,
  ExternalLink,
  Info,
} from "lucide-react";

interface PtGateItem {
  id: string;
  gateCode: string;
  title: string;
  unlockedAction: string;
  status: string;
  pourZone?: string | null;
  testResult?: string | null;
  standardRef?: string | null;
  approver?: string | null;
  notes?: string | null;
}

interface PtGatesViewProps {
  project: any;
  gates: PtGateItem[];
}

export function PtGatesView({ project, gates }: PtGatesViewProps) {
  const [selectedGateCode, setSelectedGateCode] = useState("AP3");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");

  const activeGate = gates.find((g) => g.gateCode === selectedGateCode) || gates[2] || {
    gateCode: "AP3",
    title: "AP3 · กำลังอัดคอนกรีต",
    unlockedAction: "Assign อุปกรณ์จริง > AP4",
    status: "UNDER_REVIEW",
    pourZone: "ชั้น 2 / P01",
    testResult: "LAB-P01-003",
    standardRef: "SPEC-PT Rev.02",
    approver: "ผู้มีอำนาจ AP3",
    notes: "ยังไม่อนุญาตดึง ต้องผ่าน AP3 และ AP4 การเตรียมเอกสารทำล่วงหน้าได้",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ผ่าน
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            รอพิจารณา
          </span>
        );
      case "WAITING_PREV":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            รอ AP3
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
            ยังไม่เริ่ม
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 23 */}
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
              งานพื้นโพสเทนชั่น (PT) · AP1–AP7
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#132142]">
              งานพื้นโพสเทนชั่น (PT) · AP1–AP7
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              PCC-26004
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            อาคาร B / ชั้น 2 / Pour Zone P01 / Work Cycle PT-01
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/installation"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            กลับสู่หน้าภาพรวม
          </Link>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: จุดอนุมัติและกิจกรรมที่ปล่อยได้ (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#075DD8]" />
                  จุดอนุมัติและกิจกรรมที่ปล่อยได้
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Approval Gates AP1 ถึง AP7 สำหรับรอบงานเทและดึงลวดอัดแรง
                </p>
              </div>
              <span className="text-xs font-bold text-[#075DD8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                AP1–AP7
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">จุดอนุมัติ</th>
                    <th className="py-3 px-4">เมื่อผ่านแล้ว</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gates.map((gate) => {
                    const isSelected = selectedGateCode === gate.gateCode;
                    return (
                      <tr
                        key={gate.id}
                        onClick={() => setSelectedGateCode(gate.gateCode)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/70 border-l-4 border-l-[#075DD8]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-[#132142]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                gate.status === "PASSED"
                                  ? "bg-emerald-500"
                                  : gate.status === "UNDER_REVIEW"
                                  ? "bg-amber-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span>{gate.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{gate.unlockedAction}</td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(gate.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* แบบและเกณฑ์เฉพาะโครงการ (Blue Box matching SVG 23) */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#075DD8] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#075DD8]">แบบและเกณฑ์เฉพาะโครงการ</h4>
              <p className="text-xs text-blue-900 mt-0.5 leading-relaxed">
                กำลังอัด แรงดึง Elongation และ Grout ใช้ Specification / Design Revision ที่อนุมัติ
              </p>
            </div>
          </div>

          {/* ก่อนตัดปลายและปิดรอบงาน (Bottom Notice matching SVG 23) */}
          <div className="bg-white border-2 border-blue-100 rounded-xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-[#075DD8] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              ก่อนตัดปลายและปิดรอบงาน
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              ตัดปลายต้องมี AP5 และ AP6 ตาม Workflow นี้ • AP7 ไม่แทนบันทึกการทำงานจริงและเงื่อนไขถอดค้ำยัน
            </p>
          </div>
        </div>

        {/* Right Column: AP3 รายการรอพิจารณา (4 cols matching SVG 23) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="text-sm font-bold text-[#132142]">
                  {activeGate.gateCode} · รายการรอพิจารณา
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                  รอพิจารณา
                </span>
              </div>

              {/* Specs Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Pour Zone</span>
                  <span className="font-semibold text-gray-800">
                    {activeGate.pourZone || "ชั้น 2 / P01"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">ผลทดสอบ</span>
                  <span className="font-semibold text-[#075DD8]">
                    {activeGate.testResult || "LAB-P01-003"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">อ้างอิงเกณฑ์</span>
                  <span className="font-semibold text-gray-800">
                    {activeGate.standardRef || "SPEC-PT Rev.02"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">ผู้อนุมัติ</span>
                  <span className="font-semibold text-gray-800">
                    {activeGate.approver || "ผู้มีอำนาจ AP3"}
                  </span>
                </div>
              </div>

              {/* Warning Banner: ยังไม่อนุญาตดึง */}
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  ยังไม่อนุญาตดึง
                </div>
                <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                  ต้องผ่าน AP3 และ AP4 • การเตรียมเอกสารทำล่วงหน้าได้
                </p>
              </div>

              {/* Checklist: หลักฐานที่ต้องเชื่อม */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-[#132142] mb-2.5">หลักฐานที่ต้องเชื่อม</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700">Pour / Specimen / Lab Result</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700">Tendon Schedule / Design Rev.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700">Serial / Curve / Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700">FM-PTC-PRD-04 / FM-DSN-07</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowApprovalModal(true)}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                เปิดคำขออนุมัติ AP3
              </button>
              <Link
                href="/installation"
                className="w-full block text-center py-2 text-xs font-semibold text-[#075DD8] bg-blue-50/70 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                ดูประวัติ AP ทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Approval Request */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#132142]">
              เปิดคำขออนุมัติ {activeGate.gateCode} ({activeGate.title})
            </h3>
            <p className="text-xs text-gray-500">
              ส่งผลทดสอบกำลังอัดคอนกรีต LAB-P01-003 และแบบหล่อให้กับผู้มีอำนาจเพื่อปลดล็อก Gate
            </p>
            <textarea
              rows={3}
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="ระบุหมายเหตุหรือข้อสั่งการเพิ่มเติม..."
              className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("บันทึกส่งคำขออนุมัติ AP3 เรียบร้อยแล้ว");
                  setShowApprovalModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700"
              >
                ยืนยันส่งอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
