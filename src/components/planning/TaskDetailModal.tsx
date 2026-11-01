"use client";

import { useState } from "react";
import { SerializedTask, updateTaskScheduleAction } from "@/app/actions/planning";
import { X, Calendar, Clock, UserCheck, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface TaskDetailModalProps {
  task: SerializedTask | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function TaskDetailModal({ task, onClose, onUpdated }: TaskDetailModalProps) {
  if (!task) return null;

  const [start, setStart] = useState(task.plannedStart);
  const [end, setEnd] = useState(task.plannedEnd);
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">(task.status as any);
  const [responsible, setResponsible] = useState(task.responsible || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMilestone = task.isGate || ["Milestone", "Hold Point"].includes(task.type);

  // Auto calculate duration
  const startMs = start ? new Date(start + "T00:00:00Z").getTime() : 0;
  const endMs = end ? new Date(end + "T00:00:00Z").getTime() : 0;
  const duration = startMs && endMs ? Math.max(1, Math.round((endMs - startMs) / 86400000) + 1) : 1;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!start || !end) {
      setError("กรุณาระบุวันที่เริ่มและสิ้นสุด");
      return;
    }
    if (end < start) {
      setError("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateTaskScheduleAction({
        taskId: task!.id,
        plannedStart: start,
        plannedEnd: isMilestone ? start : end,
        status,
        responsible,
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  }

  const typeThai =
    task.type === "Milestone"
      ? "จุดอนุมัติ (Milestone)"
      : task.type === "Hold Point"
      ? "จุดพักรออนุมัติ (Strict Hold Point)"
      : task.type === "Summary"
      ? "ภาพรวมขั้นตอน (Summary Phase)"
      : "กิจกรรมดำเนินงาน (Task)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#075DD8] border border-blue-200">
                {task.code}
              </span>
              {isMilestone && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  จุดอนุมัติ Gate
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-[#0D255B] mt-1.5 leading-snug">
              {task.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFD] p-3 rounded-xl border border-[#E5ECF5]">
            <div>
              <span className="text-[#596780] block mb-0.5">ประเภทงาน:</span>
              <span className="font-semibold text-[#0D255B]">{typeThai}</span>
            </div>
            <div>
              <span className="text-[#596780] block mb-0.5">งานก่อนหน้า (Predecessor):</span>
              <span className="font-mono font-semibold text-[#0D255B]">
                {task.dependsOn.length > 0 ? task.dependsOn.join(", ") : "ไม่มีงานก่อนหน้า"}
              </span>
            </div>
          </div>

          {/* Date & Schedule */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                  วันที่เริ่มตามแผน *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      if (isMilestone) setEnd(e.target.value);
                    }}
                    required
                    className="w-full h-10 px-3 border border-[#D5E4FD] rounded-lg text-xs text-[#0D255B] bg-white focus:border-[#075DD8] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                  วันที่สิ้นสุดตามแผน *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={isMilestone ? start : end}
                    disabled={isMilestone}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                    className="w-full h-10 px-3 border border-[#D5E4FD] rounded-lg text-xs text-[#0D255B] bg-white disabled:bg-gray-100 disabled:text-gray-500 focus:border-[#075DD8] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#596780] px-1">
              <span>ระยะเวลาคำนวณตามแผน:</span>
              <span className="font-semibold text-[#075DD8] font-mono">
                {isMilestone ? "1 วัน (จุดอนุมัติ)" : `${duration} วันปฏิทิน`}
              </span>
            </div>
          </div>

          {/* Responsible & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                ผู้รับผิดชอบ
              </label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="เช่น วิศวกรโครงการ, QC"
                className="w-full h-10 px-3 border border-[#D5E4FD] rounded-lg text-xs text-[#0D255B] bg-white focus:border-[#075DD8] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                สถานะความคืบหน้า
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 border border-[#D5E4FD] rounded-lg text-xs text-[#0D255B] bg-white focus:border-[#075DD8] outline-none"
              >
                <option value="pending">ยังไม่เริ่ม (Pending)</option>
                <option value="in_progress">กำลังดำเนินงาน (In Progress)</option>
                <option value="completed">เสร็จสิ้นแล้ว (Completed)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#075DD8] hover:bg-[#064eb8] rounded-lg transition shadow-xs disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
