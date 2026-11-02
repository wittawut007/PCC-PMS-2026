"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  FileCode,
  Database,
  History,
  Info,
  CheckCircle2,
  Lock,
  UserCheck,
} from "lucide-react";

interface RolePermission {
  role: string;
  roleLabel: string;
  createPerms: string;
  approvePerms: string;
  scope: string;
}

interface SettingsSystemViewProps {
  rolePermissions: RolePermission[];
  policyNotice: string;
}

export function SettingsSystemView({
  rolePermissions,
  policyNotice,
}: SettingsSystemViewProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "workflow" | "master" | "audit">("roles");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 31 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  พื้นที่ทำงาน  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">ตั้งค่าระบบและสิทธิ์</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">ตั้งค่าระบบและสิทธิ์</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#075DD8] border border-blue-200">
                PCC PMS 2026
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              การจัดการบทบาท สิทธิ์การเข้าถึง แม่แบบ Workflow และประวัติระบบ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
            >
              <History className="w-4 h-4 text-gray-500" />
              ดูประวัติการเปลี่ยนแปลง
            </button>
          </div>
        </div>

        {/* 4 Tabs Bar matching SVG 31 */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === "roles"
                ? "border-[#075DD8] text-[#075DD8] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            บทบาทและสิทธิ์
          </button>
          <button
            onClick={() => setActiveTab("workflow")}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === "workflow"
                ? "border-[#075DD8] text-[#075DD8] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Workflow / Template
          </button>
          <button
            onClick={() => setActiveTab("master")}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === "master"
                ? "border-[#075DD8] text-[#075DD8] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            ข้อมูลหลัก
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === "audit"
                ? "border-[#075DD8] text-[#075DD8] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            ประวัติระบบ
          </button>
        </div>
      </div>

      {/* Main Table: บทบาทตัวอย่างและขอบเขตสิทธิ์ matching SVG 31 */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#075DD8]" />
                  บทบาทตัวอย่างและขอบเขตสิทธิ์
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  การแบ่งแยกหน้าที่ (Separation of Duties) ตามมาตรฐานบริหารโครงการ
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                5 บทบาทหลัก
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">บทบาท</th>
                    <th className="py-3 px-4">สร้าง / บันทึก</th>
                    <th className="py-3 px-4">พิจารณา / อนุมัติ</th>
                    <th className="py-3 px-4">ขอบเขตข้อมูล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rolePermissions.map((rp, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition">
                      <td className="py-3.5 px-4 font-bold text-[#132142]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#075DD8]" />
                          <span>{rp.role}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-normal pl-4 block mt-0.5">
                          {rp.roleLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">{rp.createPerms}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">{rp.approvePerms}</td>
                      <td className="py-3.5 px-4 text-gray-600">{rp.scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflow Notice matching SVG 31 */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#075DD8] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-[#075DD8]">Workflow มี Version และผู้รับรอง</h4>
              <p className="text-gray-700 mt-1 leading-relaxed">
                {policyNotice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow / Template Tab */}
      {activeTab === "workflow" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#132142]">แม่แบบกระบวนการทำงาน (Standard WBS & QC Checklists)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-bold text-[#132142] mb-1">รั้วสำเร็จรูป (Fence F)</h4>
              <p className="text-gray-500 mb-2">Version 3.2 · 5 ขั้นตอนหลัก · Checklist Rev.02</p>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200">
                Active Template
              </span>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-bold text-[#132142] mb-1">กำแพงกันดิน (L-Wall RW)</h4>
              <p className="text-gray-500 mb-2">Version 2.8 · 5 ขั้นตอนหลัก · Checklist Rev.03</p>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200">
                Active Template
              </span>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-bold text-[#132142] mb-1">โพสเทนชั่น (PT AP1-AP7)</h4>
              <p className="text-gray-500 mb-2">Version 4.0 · 7 Approval Gates · SPEC-PT Rev.02</p>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200">
                Active Template
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Master Data Tab */}
      {activeTab === "master" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#132142]">ข้อมูลหลัก (Master Data & Cost Codes)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <span className="text-gray-500 block">Cost Code: ค่าแรงติดตั้ง</span>
              <span className="font-bold text-[#132142]">CC-F-LAB (งานรั้ว) / CC-RW-LAB (กำแพงกันดิน)</span>
            </div>
            <div className="p-3 border rounded-lg">
              <span className="text-gray-500 block">Cost Code: เครื่องจักร / รถยก</span>
              <span className="font-bold text-[#132142]">CC-F-EQP (รถยกและเครนสนาม)</span>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#132142]">ประวัติระบบและการตรวจสอบย้อนหลัง (Audit Logs)</h3>
          <p className="text-gray-500">บันทึกทุกการเปลี่ยนแปลงสิทธิ์ การอนุมัติเอกสาร และการปรับปรุงงบประมาณ</p>
          <div className="p-3 border rounded-lg bg-gray-50 font-mono text-[11px] text-gray-700">
            [2026-09-12 15:00] QC_INSPECTOR สมชาย บันทึกผลตรวจ IR-260023 -&gt; RE_INSPECT<br />
            [2026-09-12 15:05] SYSTEM สร้างบันทึกข้อบกพร่องอัตโนมัติ NCR-260006<br />
            [2026-09-12 16:30] PM ประชา บันทึก Daily Log วันที่ 12 ก.ย. 2569 (20 แผ่น)
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#132142] flex items-center gap-2">
              <History className="w-5 h-5 text-[#075DD8]" />
              ประวัติการเปลี่ยนแปลงสิทธิ์ (Audit Trail)
            </h3>
            <p className="text-xs text-gray-600">
              ทุกการปรับเปลี่ยนสิทธิ์ต้องระบุเหตุผลและบันทึกประวัติไว้ในระบบ
            </p>
            <div className="space-y-2 text-xs border p-3 rounded-lg bg-gray-50">
              <div>• 01 ส.ค. 2569: แต่งตั้ง นายสมชาย เป็น QC Inspector ประจำโครงการ PCC-26001</div>
              <div>• 15 ส.ค. 2569: อนุมัติสิทธิ์ Project Manager แก่ นายประชา</div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHistoryModal(false)}
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
