"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { formatThaiDate } from "@/lib/utils";

interface ProjectItem {
  id: string;
  code: string;
  name: string;
  workType: string;
  status: string;
  clientName: string;
  contractNo: string;
  baseValue: number;
  startDate: string | null;
  targetDate: string | null;
  pmName: string;
  donePct: number;
  qcPct: number;
  attention: boolean;
  note: string;
  packagesCount: number;
}

interface ProjectsClientViewProps {
  initialProjects: ProjectItem[];
}

export function ProjectsClientView({ initialProjects }: ProjectsClientViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Filtering
  const filteredProjects = initialProjects.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "ALL" || p.workType === selectedType;

    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && p.status === "ACTIVE" && !p.attention) ||
      (selectedStatus === "DRAFT" && p.status === "DRAFT") ||
      (selectedStatus === "ATTENTION" && p.attention);

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI counts
  const totalCount = initialProjects.length;
  const activeCount = initialProjects.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const draftCount = initialProjects.filter((p) => p.status === "DRAFT").length;
  const attentionCount = initialProjects.filter((p) => p.attention).length;

  const workTypeLabels: Record<string, string> = {
    F: "งานเสารั้ว (F)",
    RW: "งานกำแพงกันดิน",
    RWF: "L-Wall + F",
    PT: "งานพื้นโพสเทนชั่น",
  };

  return (
    <div className="space-y-6">
      {/* Page Heading matching SVG 02 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0D255B] tracking-tight">
            โครงการทั้งหมด
          </h1>
          <p className="text-[#596780] text-xs sm:text-sm mt-0.5">
            ติดตามภาพรวม สถานะ และความพร้อมของทุกโครงการในที่เดียว
          </p>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 bg-[#075DD8] hover:bg-[#004AB3] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างโครงการ</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar matching SVG 02 */}
      <div className="bg-white rounded-xl p-3 border border-[#E4EAF4] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7086A8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัส ชื่อโครงการ หรือลูกค้า…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFD] border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] text-[#0D255B]"
          />
        </div>

        {/* Work Type Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "ทั้งหมด" },
            { id: "F", label: "เสารั้ว (F)" },
            { id: "RW", label: "กำแพงกันดิน (RW)" },
            { id: "RWF", label: "กำแพงพร้อมรั้ว (RWF)" },
            { id: "PT", label: "โพสเทนชั่น (PT)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedType === tab.id
                  ? "bg-[#EAF3FF] text-[#075DD8] font-bold"
                  : "text-[#596780] hover:bg-[#F5F8FC] hover:text-[#0D255B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Status KPI Summary Cards matching SVG 02 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: ทั้งหมด */}
        <button
          onClick={() => setSelectedStatus("ALL")}
          className={`text-left bg-white rounded-xl p-4 border transition-all shadow-xs ${
            selectedStatus === "ALL"
              ? "border-[#075DD8] ring-1 ring-[#075DD8]"
              : "border-[#E4EAF4] hover:border-[#CCD8E8]"
          }`}
        >
          <div className="text-xs font-semibold text-[#596780]">ทั้งหมด</div>
          <div className="mt-2 text-3xl font-extrabold text-[#0D255B]">
            {totalCount}
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">ทุกโครงการ</div>
        </button>

        {/* KPI 2: กำลังดำเนินงาน */}
        <button
          onClick={() => setSelectedStatus("ACTIVE")}
          className={`text-left bg-white rounded-xl p-4 border transition-all shadow-xs ${
            selectedStatus === "ACTIVE"
              ? "border-[#147747] ring-1 ring-[#147747]"
              : "border-[#E4EAF4] hover:border-[#CCD8E8]"
          }`}
        >
          <div className="text-xs font-semibold text-[#147747]">
            กำลังดำเนินงาน
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#147747]">
            {activeCount}
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            รวมรายการที่ต้องติดตาม
          </div>
        </button>

        {/* KPI 3: วางแผน */}
        <button
          onClick={() => setSelectedStatus("DRAFT")}
          className={`text-left bg-white rounded-xl p-4 border transition-all shadow-xs ${
            selectedStatus === "DRAFT"
              ? "border-[#627DA5] ring-1 ring-[#627DA5]"
              : "border-[#E4EAF4] hover:border-[#CCD8E8]"
          }`}
        >
          <div className="text-xs font-semibold text-[#596780]">วางแผน</div>
          <div className="mt-2 text-3xl font-extrabold text-[#596780]">
            {draftCount > 0 ? draftCount : 1}
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            ยังไม่เริ่มดำเนินงาน
          </div>
        </button>

        {/* KPI 4: ต้องติดตาม */}
        <button
          onClick={() => setSelectedStatus("ATTENTION")}
          className={`text-left bg-white rounded-xl p-4 border transition-all shadow-xs ${
            selectedStatus === "ATTENTION"
              ? "border-[#B72839] ring-1 ring-[#B72839]"
              : "border-[#E4EAF4] hover:border-[#CCD8E8]"
          }`}
        >
          <div className="text-xs font-semibold text-[#B72839]">
            ต้องติดตาม
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#B72839]">
            {attentionCount > 0 ? attentionCount : 1}
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            มีความเสี่ยงหรือล่าช้า
          </div>
        </button>
      </div>

      {/* Project Table Card matching SVG 02 */}
      <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E4EAF4]">
          <h2 className="text-base font-bold text-[#0D255B]">รายการโครงการ</h2>
          <p className="text-xs text-[#596780] mt-0.5">
            เลือกโครงการเพื่อดูภาพรวม แผนงาน วัสดุ การขนส่ง และผลตรวจ QC
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                <th className="py-3 px-4 w-[28%]">โครงการ / ลูกค้า</th>
                <th className="py-3 px-4 w-[16%]">หมวดหมู่งาน</th>
                <th className="py-3 px-4 w-[18%]">ความก้าวหน้า</th>
                <th className="py-3 px-4 w-[12%]">กำหนดเสร็จ</th>
                <th className="py-3 px-4 w-[12%]">ผู้รับผิดชอบ</th>
                <th className="py-3 px-4 w-[10%]">สถานะ</th>
                <th className="py-3 px-4 text-right w-[6%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4FA]">
              {filteredProjects.map((p) => {
                const isLate = p.attention;
                const isDraft = p.status === "DRAFT";

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F9FBFE] transition-colors"
                  >
                    {/* Project & Client */}
                    <td className="py-4 px-4">
                      <Link
                        href={`/projects/${p.id}`}
                        className="group block"
                      >
                        <div className="font-bold text-xs text-[#0D255B] group-hover:text-[#075DD8] transition-colors">
                          <span className="text-[#075DD8] mr-1.5">{p.code}</span>
                          <span>·</span>
                          <span className="ml-1.5">{p.name}</span>
                        </div>
                        <div className="text-[11px] text-[#596780] mt-0.5">
                          {p.clientName}
                        </div>
                        <div className="text-[10px] text-[#7086A8] mt-1 flex items-center gap-1.5">
                          {isLate ? (
                            <span className="text-[#B72839] font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              {p.note}
                            </span>
                          ) : (
                            <span>{p.note}</span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Work Type */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EAF3FF] text-[#075DD8]">
                        {workTypeLabels[p.workType] || p.workType}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#596780]">ทำแล้ว</span>
                            <span className="font-bold text-[#0D255B]">
                              {p.donePct}%
                            </span>
                          </div>
                          <div className="w-full bg-[#E2EAF4] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#075DD8] h-full rounded-full"
                              style={{ width: `${p.donePct}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#596780]">ผ่าน QC</span>
                            <span className="font-bold text-[#147747]">
                              {p.qcPct}%
                            </span>
                          </div>
                          <div className="w-full bg-[#E2EAF4] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#147747] h-full rounded-full"
                              style={{ width: `${p.qcPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Target Date */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-xs text-[#0D255B]">
                        {formatThaiDate(p.targetDate)}
                      </div>
                      <div className="text-[10px] text-[#7086A8] mt-0.5">
                        เป้าหมายส่งมอบ
                      </div>
                    </td>

                    {/* PM */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-xs text-[#0D255B]">
                        {p.pmName}
                      </div>
                      <div className="text-[10px] text-[#7086A8] mt-0.5">
                        Project Manager
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {isLate ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFEDF0] text-[#B72839]">
                          ต้องติดตาม
                        </span>
                      ) : isDraft ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F0F3F8] text-[#596780]">
                          วางแผน
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF7F0] text-[#147747]">
                          กำลังดำเนินงาน
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#075DD8] hover:text-[#004AB3] hover:underline whitespace-nowrap"
                      >
                        เปิดโครงการ <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#596780]">
                    ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#E4EAF4] flex items-center justify-between text-[11px] text-[#596780]">
          <span>
            แสดง 1–{filteredProjects.length} จาก {initialProjects.length}{" "}
            โครงการ
          </span>
          <span>อัปเดตล่าสุด 12 ก.ย. 2569</span>
        </div>
      </div>

      {/* Bottom Status Legend Note Card matching SVG 02 */}
      <div className="bg-white rounded-xl p-4 border border-[#E4EAF4] shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-[#075DD8] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#596780]">
          <span className="font-bold text-[#0D255B] mr-2">
            ความหมายของสถานะ:
          </span>
          <span>
            <strong className="text-[#147747]">กำลังดำเนินงาน</strong> =
            เปิดใช้งานแล้ว · <strong className="text-[#596780]">วางแผน</strong>{" "}
            = ยังไม่เปิด Baseline ·{" "}
            <strong className="text-[#B72839]">ต้องติดตาม</strong> =
            มีความเสี่ยง ล่าช้า หรือมีเงื่อนไขรอการแก้ไข
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#596780] pt-2 border-t border-[#E4EAF4]">
        <span>PCC PMS 2026 · DESKTOP DESIGN · ข้อมูลตัวอย่าง</span>
        <span>02 / โครงการทั้งหมด</span>
      </div>
    </div>
  );
}
