"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  User,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";
import { processApprovalTaskAction } from "@/app/actions/phase4";

interface ApprovalTaskItem {
  id: string;
  requestCode: string;
  title: string;
  category: string;
  requestedBy: string;
  assignedRole: string;
  packageCode?: string | null;
  bomRef?: string | null;
  requiredDate?: Date | null;
  dueDate?: Date | null;
  status: string;
  statusLabel: string;
  details?: any;
  referenceDoc?: string | null;
  project?: {
    code: string;
    name: string;
  };
}

interface ApprovalTasksViewProps {
  tasks: ApprovalTaskItem[];
  counts: {
    waitingMe: number;
    sentByMe: number;
    returned: number;
    history: number;
  };
  currentTab: string;
}

export function ApprovalTasksView({
  tasks,
  counts,
  currentTab,
}: ApprovalTasksViewProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const filteredTasks = tasks.filter(
    (t) =>
      t.requestCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.project?.code && t.project.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedTask) return;
    try {
      setIsProcessing(true);
      await processApprovalTaskAction(selectedTask.id, action);
      alert(action === "APPROVE" ? `อนุมัติคำขอ ${selectedTask.requestCode} เรียบร้อยแล้ว` : `ส่งกลับแก้ไขคำขอ ${selectedTask.requestCode} เรียบร้อยแล้ว`);
      router.refresh();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 32 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  พื้นที่ทำงาน  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">งานรออนุมัติและการส่งต่อ</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">งานรออนุมัติและการส่งต่อ</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                รอพิจารณา {counts.waitingMe} รายการ
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              คิวงานข้ามกระบวนการ พร้อมผู้รับผิดชอบ วันครบกำหนด และหลักฐานประกอบการตัดสินใจ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.refresh()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              รีเฟรชรายการ
            </button>
          </div>
        </div>

        {/* Search & Sub-header Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาคำขอ โครงการ หรือผู้รับผิดชอบ…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
            />
          </div>

          {/* 4 Tabs matching SVG 32 */}
          <div className="flex items-center gap-1 text-xs font-semibold w-full sm:w-auto overflow-x-auto">
            <button
              className={`px-3 py-1.5 rounded-lg border transition ${
                currentTab === "WAITING_ME"
                  ? "bg-[#075DD8] text-white border-[#075DD8] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              รอฉัน {counts.waitingMe}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 transition"
            >
              ส่งโดยฉัน {counts.sentByMe}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 transition"
            >
              ส่งกลับแก้ไข {counts.returned}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 transition"
            >
              ประวัติ {counts.history}
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid matching SVG 32 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): รายการรอพิจารณา Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#132142]">รายการรอพิจารณา</h2>
              <span className="text-[11px] text-gray-500">คลิกที่แถวเพื่อดูรายละเอียด</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">คำขอ / เรื่อง</th>
                    <th className="py-3 px-4">โครงการ</th>
                    <th className="py-3 px-4">กำหนด</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((t) => {
                    const isSelected = selectedTask?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/70 border-l-4 border-l-[#075DD8]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#132142]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#075DD8]" />
                            <span>{t.requestCode} / {t.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {t.project?.code || "PCC-26001"}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                              })
                            : "12 ก.ย."}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                            {t.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-gray-50/70 border-t border-gray-100 text-[11px] text-gray-500 text-center">
              แสดงตามสิทธิ์และอำนาจอนุมัติของผู้เข้าสู่ระบบ
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Task Detail Preview matching SVG 32 */}
        <div className="lg:col-span-5">
          {selectedTask ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#132142]">
                  {selectedTask.requestCode} · {selectedTask.title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                  {selectedTask.statusLabel}
                </span>
              </div>

              {/* Task Attributes */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">ผู้ส่ง</span>
                  <span className="font-semibold text-gray-800">{selectedTask.requestedBy}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">ชุดงาน</span>
                  <span className="font-semibold text-[#075DD8]">
                    {selectedTask.packageCode || "WP-F-01"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">BOM / เกณฑ์</span>
                  <span className="font-semibold text-gray-800">
                    {selectedTask.bomRef || "Rev.03 / อนุมัติ"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">วันที่ต้องใช้</span>
                  <span className="font-semibold text-gray-800">
                    {selectedTask.requiredDate
                      ? new Date(selectedTask.requiredDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "14 ก.ย. 2569"}
                  </span>
                </div>
              </div>

              {/* Summary description */}
              {selectedTask.details?.summary && (
                <div className="p-3 rounded-lg bg-gray-50 border text-xs text-gray-700">
                  {selectedTask.details.summary}
                </div>
              )}

              {/* Notice Box matching SVG 32 */}
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ตรวจข้อมูลก่อนตัดสิน
                </div>
                <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                  เปิดรายละเอียดปริมาณ วันต้องใช้ และหลักฐานก่อนอนุมัติ
                </p>
              </div>

              {/* Action Buttons matching SVG 32 */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <Link
                  href={
                    selectedTask.category === "QC"
                      ? "/installation/inspection/IR-260023"
                      : selectedTask.category === "GATE"
                      ? "/installation/gates/pt"
                      : selectedTask.category === "MATERIAL"
                      ? "/materials"
                      : "/costs"
                  }
                  className="w-full py-2 text-xs font-semibold text-[#075DD8] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  เปิดรายละเอียดคำขอ
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction("REJECT")}
                    className="py-2.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
                  >
                    ส่งกลับพร้อมเหตุผล
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction("APPROVE")}
                    className="py-2.5 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
                  >
                    อนุมัติตามอำนาจ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-xs text-gray-500">
              กรุณาเลือกรายการที่ต้องการดูรายละเอียด
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
