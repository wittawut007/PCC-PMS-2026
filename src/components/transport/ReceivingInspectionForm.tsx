"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { recordReceivingAction } from "@/app/actions/transport";

interface ReceivingInspectionFormProps {
  data: {
    id: string;
    tripNo: string;
    zone: string;
    inspector: string;
    inspectedAt: string;
    item: {
      itemCode: string;
      name: string;
      deliveredQty: number;
      actualQty: number;
      goodQty: number;
      badQty: number;
      missingQty: number;
    };
    damageNotes: string;
    attachedFiles: string[];
    status: string;
  };
}

export function ReceivingInspectionForm({ data }: ReceivingInspectionFormProps) {
  const router = useRouter();

  const [inspector, setInspector] = useState(data.inspector);
  const [inspectedAt, setInspectedAt] = useState(data.inspectedAt);
  const [actualQty, setActualQty] = useState(data.item.actualQty);
  const [goodQty, setGoodQty] = useState(data.item.goodQty);
  const [badQty, setBadQty] = useState(data.item.badQty);
  const [missingQty, setMissingQty] = useState(data.item.missingQty);
  const [damageNotes, setDamageNotes] = useState(data.damageNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (isDraft: boolean) => {
    setIsSaving(true);
    setSuccess(false);

    const res = await recordReceivingAction({
      tripId: data.tripNo,
      actualQty,
      goodQty,
      badQty,
      missingQty,
      damageNotes,
      inspector,
      inspectedAt,
    });

    setIsSaving(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/transport");
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title matching SVG 18 */}
      <div>
        <div className="text-[11px] text-[#596780] mb-1">
          PCC PMS / พื้นที่ทำงาน / บันทึกตรวจรับวัสดุ
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/transport/${data.tripNo}`}
            className="p-1.5 rounded-lg border border-[#D0D9E7] text-[#596780] hover:text-[#0D255B] hover:bg-[#F5F8FD] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              บันทึกตรวจรับวัสดุ
            </h1>
            <p className="text-xs text-[#596780] mt-0.5">
              โครงการตัวอย่าง PCC · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-[#EAF7F0] border border-[#BDE5D0] text-xs text-[#147747] font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          บันทึกการตรวจรับวัสดุเรียบร้อยแล้ว กำลังนำท่านกลับสู่หน้ารายการ...
        </div>
      )}

      {/* 2-Column Layout matching SVG 18 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inspection Details Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6 space-y-6">
          <div className="border-b border-[#E4EAF4] pb-3">
            <h2 className="text-base font-bold text-[#0D255B]">
              {data.tripNo} · ตรวจรับที่{data.zone}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                ผู้ตรวจรับ *
              </label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                เวลาตรวจจริง *
              </label>
              <input
                type="text"
                value={inspectedAt}
                onChange={(e) => setInspectedAt(e.target.value)}
                className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
              />
            </div>
          </div>

          {/* Table matching SVG 18 */}
          <div className="overflow-x-auto rounded-lg border border-[#E4EAF4]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                  <th className="py-2.5 px-4">รายการ</th>
                  <th className="py-2.5 px-3 text-center">ตามใบส่ง</th>
                  <th className="py-2.5 px-3 text-center">รับจริง</th>
                  <th className="py-2.5 px-3 text-center text-[#147747]">ดี</th>
                  <th className="py-2.5 px-3 text-center text-[#B72839]">เสีย</th>
                  <th className="py-2.5 px-3 text-center text-[#596780]">ขาด</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0D255B]">
                    {data.item.name}
                  </td>
                  <td className="py-3 px-3 text-center text-[#596780] font-medium">
                    {data.item.deliveredQty}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      value={actualQty}
                      onChange={(e) => setActualQty(Number(e.target.value))}
                      className="w-16 text-center font-bold text-[#0D255B] border border-[#D0D9E7] rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      value={goodQty}
                      onChange={(e) => setGoodQty(Number(e.target.value))}
                      className="w-16 text-center font-bold text-[#147747] border border-[#D0D9E7] rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      value={badQty}
                      onChange={(e) => setBadQty(Number(e.target.value))}
                      className="w-16 text-center font-bold text-[#B72839] border border-[#D0D9E7] rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      value={missingQty}
                      onChange={(e) => setMissingQty(Number(e.target.value))}
                      className="w-16 text-center font-bold text-[#596780] border border-[#D0D9E7] rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Alert box matching SVG 18 */}
          <div className="bg-[#FFF7EB] rounded-xl p-4 border border-[#FBE0B5] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#B25E09] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-[#B25E09] font-bold block">
                รับบางส่วนผ่านตรวจ
              </strong>
              <p className="text-[#844306] text-[11px] mt-0.5 leading-relaxed">
                รับจริง {actualQty} = ดี {goodQty} + เสีย {badQty} • ขาด {missingQty} • แยก {badQty} แผ่นไว้รอการจัดการ
              </p>
            </div>
          </div>

          {/* Damage Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
              หมายเหตุความเสียหาย / ตำแหน่ง *
            </label>
            <textarea
              rows={3}
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              className="w-full bg-white border border-[#D0D9E7] rounded-lg p-3 text-xs text-[#0D255B] focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
            />
          </div>

          {/* Attached Files */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => alert("ระบบจำลองเปิดหน้าต่างอัปโหลดไฟล์/รูปภาพ")}
              className="px-4 py-2 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <ImageIcon className="w-4 h-4 text-[#075DD8]" />
              แนบรูป / ใบส่งของ
            </button>
            <div className="text-[11px] text-[#596780]">
              แนบแล้ว: {data.attachedFiles.join(" · ")}
            </div>
          </div>
        </div>

        {/* Right Column: Impact & Escalation Timeline matching SVG 18 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6">
            <h3 className="text-sm font-bold text-[#0D255B] mb-4">
              ผลกระทบและการส่งต่อ
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4EAF4]">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#EAF7F0] border-2 border-white text-[#147747] flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#0D255B] block">
                    รับดี {goodQty} แผ่น
                  </strong>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    ผูกล็อตกับชุดงานที่จะใช้งาน
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FFF7EB] border-2 border-white text-[#B25E09] flex items-center justify-center shadow-xs">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#0D255B] block">
                    เสีย {badQty} แผ่น
                  </strong>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    ส่งแจ้งคลัง / เปิดรายการติดตาม
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FFF7EB] border-2 border-white text-[#B25E09] flex items-center justify-center shadow-xs">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#0D255B] block">
                    อนุมัติพื้นที่พร้อม
                  </strong>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    ปล่อยเฉพาะ Span ที่พร้อม
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Notice */}
          <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5] flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-[#0D255B] font-bold block">
                ตรวจครบก่อนยืนยัน
              </strong>
              <p className="text-[#596780] text-[11px] mt-0.5 leading-normal">
                ต้องมีปริมาณ ผู้รับ เวลา และหลักฐาน ระบบจะเก็บประวัติการแก้ไข
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              บันทึกร่าง
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? "กำลังบันทึก..." : "ยืนยันรับบางส่วน"}
            </button>

            <button
              type="button"
              onClick={() => alert("ระบบแจ้งสั่งผลิตวัสดุทดแทนสำหรับยอดเสีย 2 แผ่น")}
              className="w-full py-2.5 px-4 rounded-xl border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              แจ้งวัสดุทดแทน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
