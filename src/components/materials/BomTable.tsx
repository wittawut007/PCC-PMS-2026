"use client";

import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight, PlusCircle, AlertCircle } from "lucide-react";
import { DrawingData } from "@/app/actions/materials";

interface BomTableProps {
  projectId: string;
  projectCode: string;
  projectName: string;
  drawing: DrawingData | null;
}

export function BomTable({ projectId, projectCode, projectName, drawing }: BomTableProps) {
  if (!drawing) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E4EAF4] text-center shadow-xs">
        <FileText className="w-12 h-12 text-[#7086A8] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#0D255B]">ยังไม่มีข้อมูล BOM สำหรับโครงการนี้</h3>
        <p className="text-xs text-[#596780] mt-1">สามารถเพิ่มแบบและรายการ BOM เพื่อเริ่มต้นบริหารจัดการวัสดุ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BOM Table Card matching SVG 09 */}
      <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[#E4EAF4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#0D255B]">
              BOM Rev.{drawing.revision} · {drawing.packageCode} ({drawing.packageName?.split(" ")[1] || "โซน A"}) · อ้างอิง {drawing.code} Rev.{drawing.revision}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF7F0] text-[#147747]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            อนุมัติแล้ว
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                <th className="py-3 px-6">วัสดุ / รหัส</th>
                <th className="py-3 px-6 text-center">หน่วย</th>
                <th className="py-3 px-6 text-right">ตาม BOM</th>
                <th className="py-3 px-6 text-right">ปรับเพิ่ม</th>
                <th className="py-3 px-6 text-right">รวมต้องใช้</th>
                <th className="py-3 px-6 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4FA]">
              {drawing.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FBFE] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#0D255B]">{item.name}</div>
                    {item.spec && <div className="text-[11px] text-[#7086A8] mt-0.5">{item.spec}</div>}
                  </td>
                  <td className="py-4 px-6 text-center text-[#596780] font-medium">
                    {item.unit}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-[#0D255B]">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-[#596780]">
                    {item.additionalQty}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-[#0D255B]">
                    {item.totalRequired.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EAF7F0] text-[#147747]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info matching SVG 09 */}
        <div className="px-6 py-3.5 bg-[#FCFDFF] border-t border-[#E4EAF4] text-[11px] text-[#596780]">
          {drawing.approvedBy ? `อนุมัติโดย${drawing.approvedBy}` : "อนุมัติโดยวิศวกรโครงการ (นายวิชาญ วิศวกรรม)"} · 9 ก.ย. 2569 · ควบคุมประวัติ Rev.01–{drawing.revision}
        </div>
      </div>

      {/* Bottom Two Columns matching SVG 09 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Change Request */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
          <h3 className="text-sm font-bold text-[#0D255B]">
            การเปลี่ยนแปลงหลังอนุมัติ (Change Request)
          </h3>
          <p className="text-xs text-[#596780] mt-1.5 leading-relaxed">
            สร้าง Revision ใหม่ ระบุเหตุผลและผลกระทบต่อปริมาณ แผน และงบประมาณโครงการ
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => alert("ระบบสร้างร่าง Revision ใหม่ (อยู่ระหว่างการยืนยันสิทธิ์วิศวกร)")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#075DD8]" />
              สร้างร่าง Revision ใหม่
            </button>
          </div>
        </div>

        {/* Right Column: Approved Ref & Create Request Button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5]">
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-[#0D255B] block">
                  อ้างอิงฉบับอนุมัติ
                </strong>
                <p className="text-[11px] text-[#596780] mt-1 leading-normal">
                  คำขอวัสดุต้องบันทึก BOM Revision ณ วันที่ส่งคำขอ BOM Rev.{drawing.revision} ใช้สำหรับขอเบิกในหน้า 12 และ 13
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/materials/request/new?projectId=${projectId}&packageId=${drawing.packageCode}`}
            className="w-full py-3 px-4 rounded-xl bg-[#075DD8] hover:bg-[#054bb2] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            สร้างคำขอวัสดุ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
