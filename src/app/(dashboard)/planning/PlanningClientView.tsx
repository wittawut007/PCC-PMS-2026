"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SerializedProject } from "@/app/actions/planning";
import { GanttChart } from "@/components/planning/GanttChart";
import { WorkCalendar } from "@/components/planning/WorkCalendar";
import { PlanTable } from "@/components/planning/PlanTable";
import {
  Calendar as CalendarIcon,
  BarChart2,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ListTodo,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface PlanningClientViewProps {
  projects: { id: string; code: string; name: string; workType: string }[];
  currentProject: SerializedProject | null;
}

export function PlanningClientView({
  projects,
  currentProject,
}: PlanningClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") || "gantt";
  const [activeTab, setActiveTab] = useState<"gantt" | "calendar" | "table">(
    (initialView as any) || "gantt"
  );

  function handleSelectProject(projectId: string) {
    router.push(`/planning?projectId=${projectId}&view=${activeTab}`);
  }

  function handleTabChange(tab: "gantt" | "calendar" | "table") {
    setActiveTab(tab);
    if (currentProject) {
      router.push(`/planning?projectId=${currentProject.id}&view=${tab}`, { scroll: false });
    }
  }

  if (!currentProject) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[#E4EAF4]">
        <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#0D255B]">ไม่พบโครงการในระบบ</h3>
        <p className="text-xs text-[#596780] mt-1">
          กรุณาสร้างโครงการใหม่เพื่อเริ่มจัดการแผนงานและปฏิทิน
        </p>
      </div>
    );
  }

  // Calculate task counts
  const allTasks = currentProject.packages.flatMap((pkg) => pkg.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "in_progress").length;
  const milestoneCount = allTasks.filter((t) => t.isGate || ["Milestone", "Hold Point"].includes(t.type)).length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const typeColorMap: Record<string, { bg: string; text: string; label: string }> = {
    F: { bg: "bg-purple-100", text: "text-purple-700", label: "งานเสารั้ว (F)" },
    RW: { bg: "bg-cyan-100", text: "text-cyan-800", label: "กำแพงกันดิน (RW)" },
    RWF: { bg: "bg-emerald-100", text: "text-emerald-800", label: "กำแพงพร้อมรั้ว (RWF)" },
    PT: { bg: "bg-amber-100", text: "text-amber-800", label: "พื้นโพสเทนชั่น (PT)" },
  };

  const currentType = typeColorMap[currentProject.workType] || {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: currentProject.workType,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Project Selector */}
      <div className="bg-white border border-[#E4EAF4] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${currentType.bg} ${currentType.text}`}>
                {currentType.label}
              </span>
              <span className="text-xs text-[#596780]">
                {currentProject.code}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0D255B]">
              {currentProject.name}
            </h1>
            <p className="text-xs text-[#596780] mt-1">
              ผู้ว่าจ้าง: {currentProject.clientName || "—"} · สถานที่: {currentProject.siteAddress || "—"} · ความก้าวหน้า {overallPercent}%
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Project Switcher Select */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-[#596780] mb-1">
                สลับโครงการ:
              </label>
              <select
                value={currentProject.id}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="h-10 px-3 bg-white border border-[#D5E4FD] rounded-xl text-xs font-semibold text-[#0D255B] focus:border-[#075DD8] outline-none shadow-2xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name} ({p.workType})
                  </option>
                ))}
              </select>
            </div>

            {/* Link to Project Hub */}
            <div className="flex flex-col justify-end">
              <span className="text-[11px] font-semibold text-transparent mb-1">
                .
              </span>
              <Link
                href={`/projects/${currentProject.id}`}
                className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#F5F8FC] hover:bg-[#EAF3FF] text-[#075DD8] rounded-xl text-xs font-semibold border border-[#E4EAF4] transition"
              >
                เปิดศูนย์กลางโครงการ
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E4EAF4]">
          <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-[#EDF2F9]">
            <div className="flex items-center justify-between text-[#596780] text-xs">
              <span>กิจกรรมทั้งหมด</span>
              <ListTodo className="w-4 h-4 text-[#075DD8]" />
            </div>
            <div className="text-xl font-extrabold text-[#0D255B] mt-1">
              {totalTasks} <span className="text-xs font-normal text-gray-500">Tasks</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">ใน {currentProject.packages.length} ชุดงาน WBS</div>
          </div>

          <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-[#EDF2F9]">
            <div className="flex items-center justify-between text-[#596780] text-xs">
              <span>เสร็จสิ้นแล้ว</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">
              {completedTasks} <span className="text-xs font-normal text-gray-500">Tasks</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{overallPercent}% ของงานทั้งหมด</div>
          </div>

          <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-[#EDF2F9]">
            <div className="flex items-center justify-between text-[#596780] text-xs">
              <span>กำลังดำเนินการ</span>
              <Clock className="w-4 h-4 text-[#075DD8]" />
            </div>
            <div className="text-xl font-extrabold text-[#075DD8] mt-1">
              {inProgressTasks} <span className="text-xs font-normal text-gray-500">Tasks</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">ตามกำหนดการดำเนินงาน</div>
          </div>

          <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-[#EDF2F9]">
            <div className="flex items-center justify-between text-[#596780] text-xs">
              <span>จุดอนุมัติ Gate</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-extrabold text-amber-600 mt-1">
              {milestoneCount} <span className="text-xs font-normal text-gray-500">Gates</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">ควบคุมคุณภาพมาตรฐาน</div>
          </div>
        </div>
      </div>

      {/* Main View Tabs (Gantt, Calendar, Table) */}
      <div className="flex items-center justify-between border-b border-[#E4EAF4] pb-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("gantt")}
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === "gantt"
                ? "border-[#1673FF] text-[#075DD8] bg-white rounded-t-xl"
                : "border-transparent text-[#596780] hover:text-[#0D255B]"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            แผนภูมิแกนต์ (Interactive Gantt)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("calendar")}
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === "calendar"
                ? "border-[#1673FF] text-[#075DD8] bg-white rounded-t-xl"
                : "border-transparent text-[#596780] hover:text-[#0D255B]"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            ปฏิทินโครงการ (Project Calendar)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("table")}
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === "table"
                ? "border-[#1673FF] text-[#075DD8] bg-white rounded-t-xl"
                : "border-transparent text-[#596780] hover:text-[#0D255B]"
            }`}
          >
            <TableIcon className="w-4 h-4" />
            ตารางแผนงาน (WBS Tasks Table)
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === "gantt" && (
        <GanttChart project={currentProject} onRefresh={() => router.refresh()} />
      )}

      {activeTab === "calendar" && (
        <WorkCalendar project={currentProject} onRefresh={() => router.refresh()} />
      )}

      {activeTab === "table" && (
        <PlanTable project={currentProject} onRefresh={() => router.refresh()} />
      )}
    </div>
  );
}
