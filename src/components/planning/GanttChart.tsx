"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { SerializedProject, SerializedTask } from "@/app/actions/planning";
import { TaskDetailModal } from "./TaskDetailModal";
import { Calendar, Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronDown, ChevronRight, Folder } from "lucide-react";
import "./planning.css";

const DAY_MS = 86400000;
const utc = (d: string) => new Date(d + "T00:00:00Z").getTime();
const bangkokToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

interface GanttChartProps {
  project: SerializedProject;
  onRefresh: () => void;
}

export function GanttChart({ project, onRefresh }: GanttChartProps) {
  const [mode, setMode] = useState<"week" | "month">("week");
  const [zoom, setZoom] = useState<number>(1);
  const [foldedPackages, setFoldedPackages] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<SerializedTask | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = bangkokToday();
  const scale = (mode === "month" ? 16 : 34) * zoom;

  // Flatten rows from packages
  const { allTasks, rows, minDate, maxDate } = useMemo(() => {
    const taskList: SerializedTask[] = [];
    const rowList: { kind: "package" | "task"; pkg: any; task?: SerializedTask; number?: number }[] = [];

    let count = 0;
    for (const pkg of project.packages) {
      rowList.push({ kind: "package", pkg });
      const isFolded = foldedPackages.has(pkg.id);

      for (const t of pkg.tasks) {
        taskList.push(t);
        count++;
        if (!isFolded) {
          rowList.push({ kind: "task", pkg, task: t, number: count });
        }
      }
    }

    // Determine timeline start & end bounds
    const dates = [today, project.startDate, ...taskList.map((t) => t.plannedStart)].filter(Boolean) as string[];
    const ends = [today, project.targetDate, ...taskList.map((t) => t.plannedEnd)].filter(Boolean) as string[];

    dates.sort();
    ends.sort();

    const firstDate = dates[0] || today;
    const lastDate = ends[ends.length - 1] || today;

    const startDate = new Date(utc(firstDate));
    const endDate = new Date(utc(lastDate));

    // Pad beginning to month start, and end to month end
    const begin = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
    const finish = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 0);

    return {
      allTasks: taskList,
      rows: rowList,
      minDate: begin,
      maxDate: finish,
    };
  }, [project, foldedPackages, today]);

  const daysCount = Math.max(1, Math.round((maxDate - minDate) / DAY_MS) + 1);
  const chartWidth = daysCount * scale;

  // Generate month headers
  const monthHeaders = useMemo(() => {
    const list: { label: string; width: number }[] = [];
    for (let cursor = minDate; cursor <= maxDate; ) {
      const d = new Date(cursor);
      const monthEnd = Math.min(maxDate, Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
      const mDays = Math.round((monthEnd - cursor) / DAY_MS) + 1;
      const label = d.toLocaleDateString("th-TH", { month: "long", year: "numeric", timeZone: "UTC" });
      list.push({ label, width: mDays * scale });
      cursor = monthEnd + DAY_MS;
    }
    return list;
  }, [minDate, maxDate, scale]);

  // Position helper for task bars
  const getTaskPos = (t: SerializedTask) => {
    const s = utc(t.plannedStart || today);
    const e = utc(t.plannedEnd || t.plannedStart || today);
    const x = ((s - minDate) / DAY_MS) * scale;
    const isMile = t.isGate || ["Milestone", "Hold Point"].includes(t.type);
    const size = isMile ? 16 : Math.max(1, Math.round((e - s) / DAY_MS) + 1) * scale;
    return { x, size, isMile };
  };

  const todayOffset = ((utc(today) - minDate) / DAY_MS + 0.5) * scale;
  const todayLabel = `วันนี้ · ${new Date(today).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}`;

  // Dependency connector paths
  const dependencyPaths = useMemo(() => {
    const paths: string[] = [];
    rows.forEach((r, i) => {
      if (!r.task || !r.task.dependsOn || r.task.dependsOn.length === 0) return;
      const predCode = r.task.dependsOn[0].split(" ")[0];

      const j = rows.findIndex((other) => other.task?.code === predCode && other.pkg.id === r.pkg.id);
      if (j < 0) return;

      const prev = getTaskPos(rows[j].task!);
      const next = getTaskPos(r.task);

      const x1 = prev.x + prev.size;
      const x2 = next.x;
      const y1 = j * 44 + 22;
      const y2 = i * 44 + 22;
      const turn = Math.max(x1 + 8, x2 - 8);

      paths.push(`M${x1} ${y1}H${turn}V${y2}H${x2}`);
    });
    return paths;
  }, [rows, scale, minDate]);

  function scrollToToday() {
    if (!scrollRef.current) return;
    const metaWidth = 446;
    const targetScroll = Math.max(0, todayOffset - 180);
    scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  }

  useEffect(() => {
    // Initial auto-scroll to today
    const timer = setTimeout(() => {
      scrollToToday();
    }, 150);
    return () => clearTimeout(timer);
  }, [minDate, scale]);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  function toggleFoldPackage(pkgId: string) {
    setFoldedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  }

  return (
    <>
      <section ref={containerRef} className="plan-gantt">
        {/* Toolbar */}
        <div className="plan-toolbar">
          <div>
            <h3>แผนงานโครงการ (Gantt Plan)</h3>
            <small>
              {project.startDate && project.targetDate
                ? `${new Date(project.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(project.targetDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}`
                : "กำหนดการดำเนินงานตามสัญญา"}
            </small>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode Controls */}
            <div className="plan-controls">
              <button
                type="button"
                onClick={() => setMode("week")}
                aria-pressed={mode === "week"}
              >
                รายสัปดาห์
              </button>
              <button
                type="button"
                onClick={() => setMode("month")}
                aria-pressed={mode === "month"}
              >
                รายเดือน
              </button>
              <button type="button" onClick={scrollToToday} title={todayLabel}>
                วันนี้
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="plan-controls">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                aria-label="ย่อ Gantt"
                title="ย่อแผนงาน"
              >
                −
              </button>
              <span className="font-semibold text-xs px-1 text-[#0D255B]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                aria-label="ขยาย Gantt"
                title="ขยายแผนงาน"
              >
                +
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="เต็มหน้าจอ"
                title="เปิดเต็มหน้าจอ"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="plan-legend">
          <span className="done">● เสร็จแล้ว</span>
          <span className="planned">● ตามแผน</span>
          <span className="phase">━ Phase</span>
          <span className="approval">◆ จุดอนุมัติ</span>
          <span className="today">│ {todayLabel}</span>
          <small>คลิกชื่องานหรือแท่งกราฟเพื่อดูรายละเอียดและปรับปรุงกำหนดการ</small>
        </div>

        {/* Scrollable Canvas */}
        <div ref={scrollRef} className="plan-scroll">
          <div
            className="plan-canvas"
            style={{
              ["--chart-width" as any]: `${chartWidth}px`,
              ["--day-width" as any]: `${scale}px`,
            }}
          >
            {/* Header */}
            <div className="plan-head">
              <div className="plan-meta">
                <span>ลำดับ</span>
                <span>WBS / Phase / Task</span>
                <span className="text-center">คืบหน้า</span>
                <span className="text-center">สถานะ</span>
              </div>

              <div>
                {/* Months */}
                <div className="plan-months">
                  {monthHeaders.map((m, idx) => (
                    <div key={idx} style={{ width: `${m.width}px` }}>
                      {m.label}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="plan-days">
                  {Array.from({ length: daysCount }, (_, i) => {
                    const d = new Date(minDate + i * DAY_MS);
                    const dayNum = d.getUTCDate();
                    const dayOfWeek = d.getUTCDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const showNum = mode === "week" || dayNum === 1 || dayOfWeek === 1;

                    return (
                      <span
                        key={i}
                        style={{ width: `${scale}px` }}
                        className={isWeekend ? "weekend" : ""}
                      >
                        {showNum ? dayNum : ""}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Sticky Today badge in header */}
              <div
                className="plan-head-today"
                style={{ left: `calc(var(--meta-width) + ${todayOffset}px)` }}
                title={todayLabel}
              >
                <b>{todayLabel}</b>
              </div>
            </div>

            {/* Body */}
            <div className="plan-body">
              {/* Dependency SVG lines */}
              <svg
                className="plan-dependencies"
                width={chartWidth}
                height={rows.length * 44}
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="gantt-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M0 0L10 5L0 10Z" fill="#458eff" />
                  </marker>
                </defs>
                <g fill="none" stroke="#458eff" strokeWidth="2">
                  {dependencyPaths.map((p, idx) => (
                    <path key={idx} d={p} markerEnd="url(#gantt-arrow)" />
                  ))}
                </g>
              </svg>

              {/* Today vertical line */}
              <div
                className="plan-today"
                style={{ left: `calc(var(--meta-width) + ${todayOffset}px)` }}
                aria-label={todayLabel}
              />

              {/* Rows */}
              {rows.map((r, i) => {
                if (r.kind === "package") {
                  const isFolded = foldedPackages.has(r.pkg.id);
                  return (
                    <div key={`pkg-${r.pkg.id}`} className="plan-row package">
                      <div className="plan-meta package-title">
                        <button
                          type="button"
                          onClick={() => toggleFoldPackage(r.pkg.id)}
                          className="flex items-center gap-1.5 text-[#075DD8] hover:underline"
                        >
                          {isFolded ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <Folder className="w-4 h-4" />
                          <span>{r.pkg.name} · {r.pkg.zone}</span>
                        </button>
                      </div>
                      <div className="plan-track" />
                    </div>
                  );
                }

                const t = r.task!;
                const { x, size, isMile } = getTaskPos(t);

                const isDone = t.status === "completed";
                const isProgress = t.status === "in_progress";
                const percent = isDone ? 100 : isProgress ? 50 : 0;

                const statusLabel = isDone
                  ? "เสร็จแล้ว"
                  : isProgress
                  ? "กำลังดำเนินงาน"
                  : isMile
                  ? "รออนุมัติ"
                  : "ยังไม่เริ่ม";

                const tone = isDone ? "done" : isMile ? "diamond" : isProgress ? "planned" : "planned";

                return (
                  <div key={t.id} className="plan-row">
                    <div className="plan-meta">
                      <span className="text-gray-400 text-xs">{r.number}</span>
                      <span className="plan-task-name">
                        <button
                          type="button"
                          onClick={() => setSelectedTask(t)}
                          title={`${t.code} ${t.name}`}
                        >
                          <span className="font-semibold text-[#075DD8] mr-1">{t.code}</span>
                          {t.name}
                        </button>
                      </span>
                      <span className="plan-percent text-center">{percent}%</span>
                      <span className="text-center">
                        <b className={`plan-status ${isDone ? "done" : isProgress ? "planned" : "waiting"}`}>
                          {statusLabel}
                        </b>
                      </span>
                    </div>

                    <div className="plan-track">
                      <button
                        type="button"
                        className={`plan-bar ${tone}`}
                        onClick={() => setSelectedTask(t)}
                        style={{
                          left: `${x}px`,
                          width: `${size}px`,
                        }}
                        title={`${t.code} • ${t.name} • ${t.plannedStart} ถึง ${t.plannedEnd}`}
                        aria-label={`รายละเอียด ${t.code}`}
                      />
                      {isMile && (
                        <small
                          className="plan-milestone-text"
                          style={{ left: `${x + 24}px` }}
                        >
                          {t.code}
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
