"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Layers,
  Calendar,
  ShieldCheck,
  Clock,
  Printer,
} from "lucide-react";

interface ProjectReportsViewProps {
  currentProject: any;
  stats: {
    actualProgress: number;
    qcProgress: number;
    pendingIssuesCount: number;
    openNcrCount: number;
  };
  packageProgress: Array<{ name: string; actual: number; qc: number }>;
  sCurveData: Array<{ month: string; planned: number; actual: number | null; qc: number | null }>;
  keyIssues: Array<{ title: string; desc: string; tone: string }>;
}

export function ProjectReportsView({
  currentProject,
  stats,
  packageProgress,
  sCurveData,
  keyIssues,
}: ProjectReportsViewProps) {
  const [reportType, setReportType] = useState<"internal" | "published">("internal");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 28 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  พื้นที่ทำงาน  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">รายงานสรุปโครงการ</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">รายงานสรุปโครงการ</h1>
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
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <FileDown className="w-4 h-4" />
              ส่งออกรายงาน
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards matching SVG 28 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ทำแล้ว */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ทำแล้ว</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#075DD8] mt-2">
              {stats.actualProgress}%
            </div>
            <p className="text-xs text-gray-500 mt-1">กิจกรรมตามบันทึกหน้างาน</p>
          </div>
          <div className="mt-3 w-full bg-blue-100 rounded-full h-2 overflow-hidden">
            <div className="bg-[#075DD8] h-2 rounded-full" style={{ width: `${stats.actualProgress}%` }} />
          </div>
        </div>

        {/* Card 2: ผ่าน QC */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ผ่าน QC</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {stats.qcProgress}%
            </div>
            <p className="text-xs text-gray-500 mt-1">น้ำหนักชุดงานที่อนุมัติ</p>
          </div>
          <div className="mt-3 w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.qcProgress}%` }} />
          </div>
        </div>

        {/* Card 3: งานมีข้อค้าง */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">งานมีข้อค้าง</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">
              {stats.pendingIssuesCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">วัสดุ / AP / งบ</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
            <span>ต้องดำเนินการ</span>
            <span className="font-bold">รอแก้</span>
          </div>
        </div>

        {/* Card 4: NCR เปิดอยู่ */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between bg-rose-50/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">NCR เปิดอยู่</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600 mt-2">
              {stats.openNcrCount}
            </div>
            <p className="text-xs text-rose-600 font-semibold mt-1">รอตรวจซ้ำ F08</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-rose-700 bg-rose-100/60 px-2 py-1 rounded">
            <span>ระดับ Major</span>
            <span className="font-bold">NCR-260006</span>
          </div>
        </div>
      </div>

      {/* Main Grid: ความก้าวหน้าแต่ละชุดงาน & S-Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ความก้าวหน้าแต่ละชุดงาน (5 cols matching SVG 28) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#075DD8]" />
              ความก้าวหน้าแต่ละชุดงาน
            </h2>
            <span className="text-[11px] text-gray-500">ทำแล้ว / ผ่าน QC</span>
          </div>

          <div className="space-y-4">
            {packageProgress.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                  <span>{item.name}</span>
                  <span className="font-bold text-[#075DD8]">
                    {item.actual} / {item.qc}%
                  </span>
                </div>
                {/* 2-bar comparison */}
                <div className="space-y-1">
                  <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#075DD8] h-1.5 rounded-full" style={{ width: `${item.actual}%` }} />
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${item.qc}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg">
            <span className="font-bold text-gray-700 block mb-1">วิธีคำนวณและขอบเขต</span>
            ความก้าวหน้า QC คำนวณจากค่าน้ำหนักชุดงานที่ผ่านการตรวจรับรองเท่านั้น ไม่รวมปริมาณงานที่ทำแล้วแต่ยังไม่ผ่าน QC
          </div>
        </div>

        {/* Right: S-Curve Visualization & Key Issues (7 cols matching SVG 28) */}
        <div className="lg:col-span-7 space-y-6">
          {/* S-Curve Chart Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#132142] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#075DD8]" />
                S-Curve แผนงาน vs ผลงานจริง vs ผ่าน QC
              </h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-2.5 h-0.5 bg-gray-400" /> แผน (Planned)
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <span className="w-2.5 h-0.5 bg-[#075DD8]" /> จริง (Actual)
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-2.5 h-0.5 bg-emerald-500" /> ผ่าน QC
                </span>
              </div>
            </div>

            {/* Custom S-Curve visual display */}
            <div className="py-4">
              <div className="relative h-48 w-full border-b border-l border-gray-200 flex items-end justify-between px-4 pb-1">
                {sCurveData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-end gap-1 h-36">
                      {/* Planned Bar */}
                      <div
                        className="w-3 bg-gray-300 rounded-t"
                        style={{ height: `${(d.planned / 100) * 144}px` }}
                        title={`แผน: ${d.planned}%`}
                      />
                      {/* Actual Bar */}
                      {d.actual !== null && (
                        <div
                          className="w-3 bg-[#075DD8] rounded-t"
                          style={{ height: `${(d.actual / 100) * 144}px` }}
                          title={`ทำจริง: ${d.actual}%`}
                        />
                      )}
                      {/* QC Bar */}
                      {d.qc !== null && (
                        <div
                          className="w-3 bg-emerald-500 rounded-t"
                          style={{ height: `${(d.qc / 100) * 144}px` }}
                          title={`ผ่าน QC: ${d.qc}%`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium mt-1">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Issues Box */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#132142] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              ประเด็นที่ต้องจับตา (Issues & Risks)
            </h3>
            <div className="space-y-2">
              {keyIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    issue.tone === "rose"
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <h4 className="font-bold text-gray-900">{issue.title}</h4>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">{issue.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
