"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, FileText, ArrowLeft, Send, Save, Eye } from "lucide-react";
import { createMaterialRequestAction } from "@/app/actions/materials";

interface MaterialRequestFormProps {
  projects: Array<{ id: string; code: string; name: string }>;
  currentProjectId: string;
  packages: Array<{ id: string; code: string; name: string; zone?: string | null }>;
  bomRevision: string;
  initialItems: Array<{
    bomItemId?: string;
    itemCode: string;
    name: string;
    bomQty: number;
    unit: string;
  }>;
}

export function MaterialRequestForm({
  projects,
  currentProjectId,
  packages,
  bomRevision,
  initialItems,
}: MaterialRequestFormProps) {
  const router = useRouter();

  const [projectId, setProjectId] = useState(currentProjectId);
  const [packageId, setPackageId] = useState(packages[0]?.id || "");
  const [neededBy, setNeededBy] = useState("2026-09-14");
  const [notes, setNotes] = useState("ส่งโซน A · ติดต่อผู้รับเหมาหน้างานก่อนเข้าพื้นที่");
  const [itemQuantities, setItemQuantities] = useState<{ [itemCode: string]: number }>(
    initialItems.reduce((acc, item) => ({ ...acc, [item.itemCode]: item.bomQty }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQtyChange = (code: string, val: string) => {
    const num = parseFloat(val) || 0;
    setItemQuantities((prev) => ({ ...prev, [code]: num }));
  };

  const handleSubmit = async (submitForApproval: boolean) => {
    setIsSubmitting(true);
    setError(null);

    const itemsPayload = initialItems.map((item) => ({
      bomItemId: item.bomItemId,
      itemCode: item.itemCode,
      description: item.name,
      quantity: itemQuantities[item.itemCode] || 0,
      unit: item.unit,
    }));

    const res = await createMaterialRequestAction({
      projectId,
      packageId,
      drawingRev: bomRevision,
      neededBy,
      notes,
      items: itemsPayload,
      submitForApproval,
    });

    setIsSubmitting(false);

    if (res.success) {
      router.push(`/materials?projectId=${projectId}`);
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการบันทึกคำขอ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title matching SVG 13 */}
      <div>
        <div className="text-[11px] text-[#596780] mb-1">
          PCC PMS / พื้นที่ทำงาน / สร้างคำขอเบิกวัสดุ
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/materials?projectId=${projectId}`}
            className="p-1.5 rounded-lg border border-[#D0D9E7] text-[#596780] hover:text-[#0D255B] hover:bg-[#F5F8FD] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              สร้างคำขอเบิกวัสดุ
            </h1>
            <p className="text-xs text-[#596780] mt-0.5">
              โครงการตัวอย่าง PCC · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FFF0F1] border border-[#FCD0D5] text-xs text-[#B72839] font-medium">
          {error}
        </div>
      )}

      {/* Main 2-Column Layout matching SVG 13 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6 space-y-6">
          <div className="border-b border-[#E4EAF4] pb-3">
            <h2 className="text-base font-bold text-[#0D255B]">
              REQ-260012 · ร่าง
            </h2>
          </div>

          {/* Form Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                โครงการ *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                ชุดงาน / พื้นที่ *
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.code} / {pkg.zone || pkg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                อ้างอิง BOM
              </label>
              <input
                type="text"
                readOnly
                value={`${bomRevision} · อนุมัติแล้ว`}
                className="w-full bg-[#F8FAFD] border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#596780] font-medium cursor-not-allowed"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                วันที่ต้องใช้หน้างาน *
              </label>
              <input
                type="date"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
              />
            </div>
          </div>

          {/* Items Table matching SVG 13 */}
          <div>
            <div className="overflow-x-auto rounded-lg border border-[#E4EAF4]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                    <th className="py-3 px-4">รายการวัสดุ</th>
                    <th className="py-3 px-4 text-center">BOM</th>
                    <th className="py-3 px-4 text-center">ขอครั้งนี้</th>
                    <th className="py-3 px-4 text-center">หน่วย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4FA]">
                  {initialItems.map((item) => (
                    <tr key={item.itemCode}>
                      <td className="py-3 px-4 font-semibold text-[#0D255B]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center text-[#596780] font-medium">
                        {item.bomQty}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          value={itemQuantities[item.itemCode] ?? item.bomQty}
                          onChange={(e) => handleQtyChange(item.itemCode, e.target.value)}
                          className="w-24 text-center font-bold text-[#0D255B] border border-[#D0D9E7] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
                        />
                      </td>
                      <td className="py-3 px-4 text-center text-[#596780]">
                        {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
              หมายเหตุและข้อกำหนดส่งมอบ
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-[#D0D9E7] rounded-lg p-3 text-xs text-[#0D255B] focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
            />
          </div>
        </div>

        {/* Right Column: Workflow Timeline & Action Buttons matching SVG 13 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Timeline Card */}
          <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6">
            <h3 className="text-sm font-bold text-[#0D255B] mb-4">
              ลำดับดำเนินการ
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4EAF4]">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#EAF7F0] border-2 border-white text-[#147747] flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#0D255B] block">
                    ผู้วางแผนจัดทำ
                  </strong>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    ตรวจรายการและวันที่ต้องใช้
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
                    PM อนุมัติคำขอ
                  </strong>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    ยังไม่ส่งข้อมูลออกภายนอก
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#F3F5F9] border-2 border-white text-[#7086A8] flex items-center justify-center shadow-xs">
                  <Clock className="w-3 h-3 stroke-[2]" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#596780] block">
                    เจ้าหน้าที่ส่งเอกสาร
                  </strong>
                  <p className="text-[11px] text-[#7086A8] mt-0.5">
                    บันทึกเลขอ้างอิงคลังตอบกลับ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate check warning */}
          <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5] flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-[#0D255B] font-bold block">
                ตรวจรายการซ้ำ
              </strong>
              <p className="text-[#596780] text-[11px] mt-0.5 leading-normal">
                ใช้ยอดขอสะสมและยอดที่คลังตอบกลับป้องกันเบิกซ้ำ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full py-2.5 px-4 rounded-xl border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4 text-[#7086A8]" />
              บันทึกร่าง
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              ส่ง PM อนุมัติ
            </button>

            <button
              type="button"
              onClick={() => router.push("/materials/dispatch/req-260012")}
              className="w-full py-2.5 px-4 rounded-xl border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Eye className="w-4 h-4" />
              ดูตัวอย่างเอกสารส่งออก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
