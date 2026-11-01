"use client";

import { useState } from "react";
import { SerializedProject, SerializedTask, resetProjectPlanAction } from "@/app/actions/planning";
import { TaskDetailModal } from "./TaskDetailModal";
import { RotateCcw, Edit3, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

interface PlanTableProps {
  project: SerializedProject;
  onRefresh: () => void;
}

export function PlanTable({ project, onRefresh }: PlanTableProps) {
  const [selectedTask, setSelectedTask] = useState<SerializedTask | null>(null);
  const [resettingPkg, setResettingPkg] = useState<string | null>(null);

  async function handleResetPlan(packageId: string) {
    if (!confirm("คุณต้องการจัดเรียงวันแผนงานใหม่ตามระยะเวลามาตรฐานของหมวดงานนี้หรือไม่?")) {
      return;
    }

    setResettingPkg(packageId);
    try {
      await resetProjectPlanAction(project.id, packageId);
      onRefresh();
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดในการจัดแผนใหม่");
    } finally {
      setResettingPkg(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3.5 text-xs flex items-center justify-between">
          <div>
            <span className="font-bold">คำแนะนำ:</span> ระยะเวลานับเป็นวันปฏิทิน
            รวมวันเริ่มและวันสิ้นสุด จุดอนุมัติ Gate มีระยะเวลา 1 วัน
            สามารถคลิกปุ่ม <b>“แก้ไข”</b> เพื่อปรับวันและกำหนดผู้รับผิดชอบรายกิจกรรมได้
          </div>
        </div>

        {project.packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border border-[#E4EAF4] rounded-2xl overflow-hidden shadow-xs"
          >
            {/* Package Head */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4EAF4] bg-[#F8FAFD]">
              <div>
                <h3 className="text-sm font-bold text-[#0D255B]">
                  {pkg.name} · {pkg.zone}
                </h3>
                <p className="text-xs text-[#596780] mt-0.5">
                  รหัส {pkg.code} · เป้าหมาย {pkg.target} {pkg.unit} · สัดส่วนน้ำหนัก {pkg.weight}%
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleResetPlan(pkg.id)}
                disabled={resettingPkg === pkg.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5E4FD] hover:bg-[#EFF6FF] text-[#075DD8] rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resettingPkg === pkg.id ? "animate-spin" : ""}`} />
                จัดแผนใหม่ตามระยะเวลา
              </button>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                    <th className="py-3 px-4 w-24">รหัส</th>
                    <th className="py-3 px-4">กิจกรรมตาม Workflow</th>
                    <th className="py-3 px-4 w-32">ชนิดงาน</th>
                    <th className="py-3 px-4 w-28">งานก่อนหน้า</th>
                    <th className="py-3 px-4 w-28">เริ่มตามแผน</th>
                    <th className="py-3 px-4 w-28">สิ้นสุดตามแผน</th>
                    <th className="py-3 px-4 w-20 text-center">ระยะเวลา</th>
                    <th className="py-3 px-4 w-36">ผู้รับผิดชอบ</th>
                    <th className="py-3 px-4 w-20 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EAF4]">
                  {pkg.tasks.map((task) => {
                    const isMile = task.isGate || ["Milestone", "Hold Point"].includes(task.type);
                    const isDone = task.status === "completed";

                    return (
                      <tr key={task.id} className="hover:bg-[#F5F8FC] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#075DD8]">
                          {task.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#0D255B]">
                            {task.name}
                          </div>
                          {isMile && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              จุดอนุมัติ Gate
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#596780]">
                          {isMile ? "Milestone" : "Task"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#596780]">
                          {task.dependsOn.length > 0 ? task.dependsOn.join(", ") : "—"}
                        </td>
                        <td className="py-3 px-4 text-[#0D255B]">
                          {task.plannedStart
                            ? new Date(task.plannedStart).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-[#0D255B]">
                          {task.plannedEnd
                            ? new Date(task.plannedEnd).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-[#0D255B]">
                          {task.duration} วัน
                        </td>
                        <td className="py-3 px-4 text-[#596780]">
                          {task.responsible || "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#075DD8] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-md transition"
                          >
                            <Edit3 className="w-3 h-3" />
                            แก้ไข
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

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
