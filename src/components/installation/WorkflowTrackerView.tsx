"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { WorkflowTrackerResult } from "@/app/actions/installation";

interface WorkflowTrackerProps {
  data: WorkflowTrackerResult;
}

export function WorkflowTrackerView({ data }: WorkflowTrackerProps) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb */}
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
            <span className="text-xs font-semibold text-[#075DD8]">{data.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#132142]">{data.title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#075DD8] border border-blue-200">
              {data.subtitle}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {data.projectCode} · {data.projectName}
          </p>
        </div>

        {/* Workflow Switcher Tabs */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <Link
            href="/installation/workflow/f"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              data.type === "f"
                ? "bg-[#075DD8] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            รั้ว (F)
          </Link>
          <Link
            href="/installation/workflow/rw"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              data.type === "rw"
                ? "bg-[#075DD8] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            กำแพงกันดิน (RW)
          </Link>
          <Link
            href="/installation/workflow/rwf"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              data.type === "rwf"
                ? "bg-[#075DD8] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            กำแพง+รั้ว (RWF)
          </Link>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stages Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#075DD8]" />
                ขั้นตอนและสถานะชุดงาน
              </h2>
              <span className="text-[11px] text-gray-500 font-medium">5 ขั้นตอน</span>
            </div>

            {/* Vertical Stepper Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
              {data.stages.map((stage) => {
                const isCompleted = stage.status === "completed";
                const isActive = stage.status === "active";
                return (
                  <div key={stage.id} className="relative flex items-start gap-3">
                    {/* Step Icon */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isActive ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isActive
                              ? "text-[#075DD8]"
                              : isCompleted
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.title}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isActive
                              ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {stage.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/planning"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#075DD8] bg-blue-50/70 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              ดูแผนงานที่เกี่ยวข้อง
            </Link>
          </div>
        </div>

        {/* Right Column: Active Checkpoint & Evidence (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: จุดตรวจปัจจุบัน */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
                {data.currentCheckpoint.title}
              </span>
              <span className="text-[11px] text-gray-500">ขั้นตอนสำคัญ</span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-[#132142]">
                {data.currentCheckpoint.description}
              </h3>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200/70 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">อ้างอิง</span>
                  <span className="font-semibold text-gray-800">
                    {data.currentCheckpoint.drawingRef}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">ผู้ตัดสินผล</span>
                  <span className="font-semibold text-gray-800">
                    {data.currentCheckpoint.approver}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: หลักฐานและผลตรวจ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#132142] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#075DD8]" />
              หลักฐานและผลตรวจ
            </h3>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3.5">รายการ</th>
                    <th className="py-2.5 px-3.5">ข้อมูลอ้างอิง</th>
                    <th className="py-2.5 px-3.5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.evidences.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3.5 font-medium text-gray-800">{ev.label}</td>
                      <td className="py-2.5 px-3.5 text-gray-600">
                        {ev.ref.startsWith("IR-") ? (
                          <Link
                            href={`/installation/inspection/${ev.ref}`}
                            className="text-[#075DD8] font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            {ev.ref}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : ev.ref.startsWith("NCR-") ? (
                          <Link
                            href={`/installation/ncr/${ev.ref}`}
                            className="text-rose-600 font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            {ev.ref}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span>{ev.ref}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ev.statusTone === "green"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : ev.statusTone === "orange"
                              ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                              : ev.statusTone === "rose"
                              ? "bg-rose-50 text-rose-700 border border-rose-300 font-bold"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QC Progress Box */}
            <div className="mt-4 p-4 rounded-lg bg-blue-50/50 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#132142]">ผลงานผ่าน QC</span>
                <span className="text-sm font-extrabold text-[#075DD8]">{data.progressQc}%</span>
              </div>
              <div className="w-full bg-blue-200/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#075DD8] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${data.progressQc}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
                {data.guideline}
              </p>
            </div>
          </div>

          {/* Bottom 3 Action Buttons matching SVGs 20, 21, 22 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href={`/installation/inspection/${data.irRef}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4" />
              เปิดใบตรวจ
            </Link>
            <Link
              href="/installation/daily-log/new"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              บันทึกผลงาน
            </Link>
            <Link
              href={`/installation/ncr/${data.ncrRef}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              ดู NCR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
