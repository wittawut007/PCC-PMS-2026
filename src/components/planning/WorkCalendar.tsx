"use client";

import { useState, useMemo } from "react";
import { SerializedProject, SerializedTask } from "@/app/actions/planning";
import { TaskDetailModal } from "./TaskDetailModal";
import { ChevronLeft, ChevronRight, Search, CheckCircle2, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { CallyDatePicker } from "@/components/common/CallyDatePicker";
import "./planning.css";

const DAY_MS = 86400000;
const bangkokToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

interface WorkCalendarProps {
  project: SerializedProject;
  onRefresh: () => void;
}

const CATEGORIES = [
  { id: "logistics", label: "ส่งมอบ / Logistics", color: "#1477ef" },
  { id: "installation", label: "ติดตั้ง", color: "#15975b" },
  { id: "qc", label: "QC / ตรวจสอบ", color: "#8151d7" },
  { id: "milestone", label: "จุดอนุมัติ / Milestone", color: "#d97706" },
  { id: "other", label: "เตรียมงาน / อื่นๆ", color: "#4b5563" },
];

function getCategory(task: SerializedTask): string {
  if (task.isGate || ["Milestone", "Hold Point"].includes(task.type)) return "milestone";
  if (/QC|ตรวจสอบ|ตรวจคุณภาพ|ลูกปูน|สอบเทียบ|เกณฑ์ตรวจ/.test(task.name)) return "qc";
  if (/ขนส่ง|ส่งมอบ|เบิก|รับวัสดุ|ยกติดตั้ง|เข้าแนว|ชิ้นงาน/.test(task.name)) return "logistics";
  if (/ติดตั้ง|สอดแผ่น|ยาแนว|หล่อ|เจาะ|ลงเสาเข็ม|เทคอนกรีต|ดึงลวด|อัดน้ำปูน/.test(task.name)) return "installation";
  return "other";
}

export function WorkCalendar({ project, onRefresh }: WorkCalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const todayStr = bangkokToday();

  // Anchor date (defaults to project start or today)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return project.startDate ? new Date(project.startDate + "T00:00:00Z") : new Date(todayStr + "T00:00:00Z");
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedTask, setSelectedTask] = useState<SerializedTask | null>(null);

  // All tasks in project
  const allTasks = useMemo(() => {
    return project.packages.flatMap((pkg) => pkg.tasks);
  }, [project]);

  // Navigate forward / back
  function movePeriod(delta: number) {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setUTCDate(1);
        next.setUTCMonth(next.getUTCMonth() + delta);
      } else if (viewMode === "week") {
        next.setUTCDate(next.getUTCDate() + delta * 7);
      } else {
        next.setUTCDate(next.getUTCDate() + delta);
      }
      return next;
    });
  }

  function goToToday() {
    setCurrentDate(new Date(todayStr + "T00:00:00Z"));
  }

  // Calculate calendar grid days
  const { days, periodLabel } = useMemo(() => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();

    let begin: Date;
    let count: number;
    let label = "";

    if (viewMode === "month") {
      const firstOfMonth = new Date(Date.UTC(year, month, 1));
      const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));
      const startDayOfWeek = firstOfMonth.getUTCDay(); // 0 = Sun

      begin = new Date(firstOfMonth.getTime() - startDayOfWeek * DAY_MS);
      count = Math.ceil((startDayOfWeek + lastOfMonth.getUTCDate()) / 7) * 7;
      label = currentDate.toLocaleDateString("th-TH", { month: "long", year: "numeric", timeZone: "UTC" });
    } else if (viewMode === "week") {
      const dayOfWeek = currentDate.getUTCDay();
      begin = new Date(currentDate.getTime() - dayOfWeek * DAY_MS);
      count = 7;
      const endWeek = new Date(begin.getTime() + 6 * DAY_MS);
      label = `${begin.toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" })} – ${endWeek.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;
    } else {
      begin = currentDate;
      count = 1;
      label = currentDate.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    }

    const dayCells = Array.from({ length: count }, (_, i) => {
      const d = new Date(begin.getTime() + i * DAY_MS);
      const iso = d.toISOString().slice(0, 10);
      const isToday = iso === todayStr;
      const isOutside = viewMode === "month" && d.getUTCMonth() !== month;
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;

      // Filter tasks occurring on this date
      const matchingTasks = allTasks.filter((t) => {
        const start = t.plannedStart;
        const end = t.plannedEnd || start;
        return start <= iso && end >= iso;
      });

      return {
        date: d,
        iso,
        isToday,
        isOutside,
        isWeekend,
        tasks: matchingTasks,
      };
    });

    return { days: dayCells, periodLabel: label };
  }, [currentDate, viewMode, allTasks, todayStr]);

  // Filter tasks based on controls
  const filterTask = (t: SerializedTask) => {
    const cat = getCategory(t);
    if (selectedCategory && cat !== selectedCategory) return false;

    if (selectedStatus === "completed" && t.status !== "completed") return false;
    if (selectedStatus === "pending" && t.status === "completed") return false;
    if (selectedStatus === "late") {
      const isLate = t.status !== "completed" && t.plannedEnd < todayStr;
      if (!isLate) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.responsible.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  };

  // Count total matching events
  const totalVisibleCount = useMemo(() => {
    let count = 0;
    for (const d of days) {
      count += d.tasks.filter(filterTask).length;
    }
    return count;
  }, [days, selectedCategory, selectedStatus, searchQuery]);

  return (
    <>
      <section className="project-calendar">
        {/* Toolbar */}
        <div className="pc-toolbar">
          <h3>
            ปฏิทินโครงการ <span>(Project Calendar)</span>
          </h3>

          {/* Navigation */}
          <div className="pc-navigation flex items-center gap-2">
            <button
              type="button"
              onClick={() => movePeriod(-1)}
              aria-label="ช่วงก่อนหน้า"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <strong>{periodLabel}</strong>
            <button
              type="button"
              onClick={() => movePeriod(1)}
              aria-label="ช่วงถัดไป"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button type="button" onClick={goToToday}>
              วันนี้
            </button>
            <div className="w-[155px]">
              <CallyDatePicker
                value={currentDate.toISOString().slice(0, 10)}
                onChange={(val) => {
                  if (val) setCurrentDate(new Date(val + "T00:00:00Z"));
                }}
                size="sm"
                placeholder="เลือกวัน..."
                align="left"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="pc-filters">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="ประเภทงาน"
            >
              <option value="">ประเภทงานทั้งหมด</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="สถานะงาน"
            >
              <option value="">ทุกสถานะ</option>
              <option value="pending">ยังไม่เสร็จ</option>
              <option value="completed">เสร็จแล้ว</option>
              <option value="late">เกินกำหนด</option>
            </select>

            {/* Search */}
            <label className="pc-search">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหากิจกรรม..."
              />
            </label>
          </div>

          {/* Views */}
          <div className="pc-views" aria-label="มุมมองปฏิทิน">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              aria-pressed={viewMode === "month"}
            >
              เดือน
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              aria-pressed={viewMode === "week"}
            >
              สัปดาห์
            </button>
            <button
              type="button"
              onClick={() => setViewMode("day")}
              aria-pressed={viewMode === "day"}
            >
              วัน
            </button>
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="pc-scroll">
          <div className={`pc-grid ${viewMode}`}>
            {/* Weekday headers */}
            {viewMode !== "day" &&
              ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((label, idx) => (
                <div key={idx} className={`pc-weekday ${idx === 0 || idx === 6 ? "weekend" : ""}`}>
                  {label}
                </div>
              ))}

            {/* Day cells */}
            {days.map((cell) => {
              const visibleTasks = cell.tasks.filter(filterTask);

              return (
                <section
                  key={cell.iso}
                  className={`pc-day ${cell.isToday ? "is-today" : ""} ${cell.isOutside ? "outside" : ""} ${cell.isWeekend ? "weekend" : ""}`}
                  aria-label={cell.iso}
                >
                  <div className="pc-date">
                    <b>{viewMode === "day" ? cell.iso : cell.date.getUTCDate()}</b>
                    {cell.isToday && <span>วันนี้</span>}
                    {viewMode === "week" && (
                      <small>
                        {cell.date.toLocaleDateString("th-TH", { month: "short", timeZone: "UTC" })}
                      </small>
                    )}
                  </div>

                  <div className="pc-events">
                    {visibleTasks.map((t) => {
                      const cat = getCategory(t);
                      const isCompleted = t.status === "completed";
                      const isLate = !isCompleted && t.plannedEnd < todayStr;

                      return (
                        <button
                          key={`${cell.iso}-${t.id}`}
                          type="button"
                          className={`pc-event ${cat} ${isCompleted ? "completed" : ""}`}
                          onClick={() => setSelectedTask(t)}
                          title={`${t.code} · ${t.name} (${t.plannedStart} – ${t.plannedEnd})`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9.5px] font-bold opacity-90">
                              {t.code}
                            </span>
                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isLate && <AlertTriangle className="w-3 h-3 text-red-500" />}
                          </div>
                          <span className="pc-event-title">{t.name}</span>
                        </button>
                      );
                    })}

                    {visibleTasks.length === 0 && viewMode === "day" && (
                      <p className="pc-no-events">ไม่มีกิจกรรมในวันนี้</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Footer Legend */}
        <footer className="pc-footer">
          <b>คำอธิบาย:</b>
          {CATEGORIES.map((c) => (
            <span key={c.id} className={c.id}>
              <i></i>
              {c.label}
            </span>
          ))}
          <small className="ml-auto text-gray-500 font-medium">
            แสดง {totalVisibleCount} รายการในช่วงเวลานี้
          </small>
        </footer>
      </section>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={onRefresh}
        />
      )}
    </>
  );
}
