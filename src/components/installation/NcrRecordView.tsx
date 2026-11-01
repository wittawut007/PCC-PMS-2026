"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Paperclip,
  Send,
  Calendar,
  User,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { submitNcrAction } from "@/app/actions/installation";

interface NcrHistoryItem {
  title: string;
  at: string;
  done: boolean;
}

interface NcrRecordViewProps {
  ncr: {
    id: string;
    code: string;
    projectId: string;
    description: string;
    severity: string;
    location?: string | null;
    referenceDoc?: string | null;
    assignedTo?: string | null;
    dueDate?: Date | null;
    status: string;
    correctiveAction?: string | null;
    verificationNotes?: string | null;
    history?: any;
    project?: any;
  };
}

export function NcrRecordView({ ncr }: NcrRecordViewProps) {
  const router = useRouter();

  const [correctiveAction, setCorrectiveAction] = useState(
    ncr.correctiveAction || "ดำเนินการตามวิธีที่วิศวกรอนุมัติ และขอตรวจซ้ำ"
  );
  const [evidenceAttached, setEvidenceAttached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const historyItems: NcrHistoryItem[] = (Array.isArray(ncr.history) && ncr.history.length > 0
    ? ncr.history
    : [
        { title: "พบข้อบกพร่อง", at: "12 ก.ย. 15:00 · QC โครงการ", done: true },
        { title: "มอบหมายแก้ไข", at: "ทีมติดตั้ง · กำหนด 14 ก.ย.", done: true },
        { title: "ส่งตรวจซ้ำ", at: "รอหลักฐานหลังแก้ไข", done: false },
        { title: "ปิด NCR", at: "ผู้มีอำนาจตรวจผ่านเท่านั้น", done: false },
      ]) as NcrHistoryItem[];

  const handleSendReinspect = async () => {
    try {
      setIsSubmitting(true);
      await submitNcrAction({
        code: ncr.code,
        actionType: "REQUEST_REINSPECT",
        correctiveAction,
        verificationNotes: "แนบภาพซ่อมผิวและรอยต่อ F08 วันที่ 13 ก.ย. 2569",
      });
      alert("ส่งขอตรวจซ้ำเรียบร้อยแล้ว แจ้งเตือนวิศวกร QC แล้ว");
      router.refresh();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 25 */}
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
            <span className="text-xs font-semibold text-[#075DD8]">
              แก้ไขข้อบกพร่อง NCR
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#132142]">
              แก้ไขข้อบกพร่อง NCR
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {ncr.severity}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
              {ncr.status === "OPEN" ? "รอแก้ไข" : ncr.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {ncr.code} · ตำแหน่ง {ncr.location || "F08"} · อ้างอิง {ncr.referenceDoc || "IR-260023"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ncr.referenceDoc && (
            <Link
              href={`/installation/inspection/${ncr.referenceDoc}`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#075DD8] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              เปิดใบตรวจ {ncr.referenceDoc}
            </Link>
          )}
        </div>
      </div>

      {/* 2-Column Grid matching SVG 25 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): รายละเอียดและแนวทางแก้ไข */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                รายละเอียดและแนวทางแก้ไข
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                รอแก้ไข
              </span>
            </div>

            {/* Field: ปัญหาที่พบ */}
            <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100">
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                ปัญหาที่พบ
              </label>
              <p className="text-xs text-rose-900 font-medium">
                {ncr.description}
              </p>
            </div>

            {/* Row: ผู้รับผิดชอบ & กำหนดเสร็จ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  ผู้รับผิดชอบ *
                </label>
                <input
                  type="text"
                  disabled
                  value={ncr.assignedTo || "ทีมติดตั้ง / วิศวกรหน้างาน"}
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  กำหนดเสร็จ *
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    ncr.dueDate
                      ? new Date(ncr.dueDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "14 ก.ย. 2569"
                  }
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium"
                />
              </div>
            </div>

            {/* Field: วิธีแก้ไขที่รับรอง */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                วิธีแก้ไขที่รับรอง
              </label>
              <textarea
                rows={3}
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>

            {/* Field: หลักฐานหลังแก้ไข */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                หลักฐานหลังแก้ไข
              </label>
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 flex flex-col items-center justify-center text-center">
                {evidenceAttached ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>แนบหลักฐานภาพถ่ายซ่อมผิว F08 (2 ไฟล์) เรียบร้อยแล้ว</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      ยังไม่แนบ · ต้องระบุวันและผู้ดำเนินงาน
                    </p>
                    <p className="text-[11px] text-gray-400 mb-3">
                      แนบภาพถ่ายจุดซ่อมผิวคอนกรีตรอยต่อเสารั้ว F08
                    </p>
                    <button
                      type="button"
                      onClick={() => setEvidenceAttached(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition flex items-center gap-1.5"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                      แนบหลักฐานหลังแก้ไข
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEvidenceAttached(!evidenceAttached)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {evidenceAttached ? "เปลี่ยนไฟล์หลักฐาน" : "แนบหลักฐานหลังแก้ไข"}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSendReinspect}
                className="px-5 py-2 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                ส่งตรวจซ้ำ
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): ประวัติ NCR & Notice Box */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card: ประวัติ NCR matching SVG 25 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#132142] pb-3 border-b border-gray-100 mb-4">
              ประวัติ NCR
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {historyItems.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-2.5">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white ${
                      item.done
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{item.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Card: ยังไม่นับเป็นผลงานผ่าน QC matching SVG 25 */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              ยังไม่นับเป็นผลงานผ่าน QC
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              ผลแก้ไขต้องผ่านการตรวจซ้ำก่อนเพิ่มความก้าวหน้าที่รับรอง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
