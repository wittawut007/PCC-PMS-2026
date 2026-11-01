"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  FileText,
} from "lucide-react";
import { recordWarehouseResponseAction } from "@/app/actions/materials";

interface WarehouseDispatchFormProps {
  request: {
    id: string;
    requestNo: string;
    projectName: string;
    projectCode: string;
    packageCode: string;
    packageName: string;
    zone: string;
    drawingRev: string;
    neededBy: string | null;
    notes: string;
    items: Array<{
      id: string;
      itemCode: string;
      description: string;
      quantity: number;
      unit: string;
      allocated: number;
      shortage: number;
    }>;
    warehouse: {
      externalRef: string;
      warehouseName: string;
      storageLocation: string;
      confirmedBy: string;
      confirmedAt: string;
      responseFileUrl: string;
      warehouseNotes: string;
    };
  };
}

export function WarehouseDispatchForm({ request }: WarehouseDispatchFormProps) {
  const router = useRouter();

  const [channel, setChannel] = useState("แนบไฟล์ในระบบคลังภายนอก");
  const [externalRef, setExternalRef] = useState(request.warehouse.externalRef);
  const [confirmedByTime, setConfirmedByTime] = useState("เจ้าหน้าที่คลัง · 11 ก.ย. 16:30");
  const [responseFile, setResponseFile] = useState(request.warehouse.responseFileUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDownloadPdf = () => {
    alert(`กำลังส่งออกใบขอเบิกวัสดุ ${request.requestNo} เป็นรูปแบบ PDF`);
  };

  const handleDownloadCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["รหัส / รายการ,จำนวน,หน่วย", ...request.items.map((i) => `"${i.itemCode} - ${i.description}",${i.quantity},"${i.unit}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${request.requestNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResponse = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    const res = await recordWarehouseResponseAction(request.id, {
      externalRef,
      warehouseName: "คลังหลักบางปะอิน",
      storageLocation: "Zone B-04 / Lot 12",
      confirmedBy: confirmedByTime.split("·")[0]?.trim() || "เจ้าหน้าที่คลัง",
      responseFileUrl: responseFile,
      warehouseNotes: "ยืนยันยอดจัดสรรพร้อมปล่อยขนส่ง",
    });

    setIsSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        router.push("/materials");
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title matching SVG 14 */}
      <div>
        <div className="text-[11px] text-[#596780] mb-1">
          PCC PMS / พื้นที่ทำงาน / ส่งเอกสารและบันทึกผลจากคลัง
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/materials"
            className="p-1.5 rounded-lg border border-[#D0D9E7] text-[#596780] hover:text-[#0D255B] hover:bg-[#F5F8FD] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              ส่งเอกสารและบันทึกผลจากคลัง
            </h1>
            <p className="text-xs text-[#596780] mt-0.5">
              โครงการตัวอย่าง PCC · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#EAF7F0] border border-[#BDE5D0] text-xs text-[#147747] font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          บันทึกผลตอบกลับจากคลังเรียบร้อยแล้ว กำลังนำท่านกลับสู่หน้าหลัก...
        </div>
      )}

      {/* 2-Column Layout matching SVG 14 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Document Preview Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-8 space-y-6">
            <div className="text-xs font-semibold text-[#596780] border-b border-[#F0F4FA] pb-2">
              ตัวอย่างเอกสาร · {request.requestNo}
            </div>

            {/* Simulated Official Form Box */}
            <div className="border border-[#E4EAF4] rounded-xl p-6 bg-[#FCFDFF] space-y-5">
              <div className="border-b border-[#E4EAF4] pb-4">
                <h3 className="text-xl font-bold text-[#0D255B]">
                  PCC / ใบขอเบิกวัสดุ
                </h3>
                <p className="text-xs text-[#596780] mt-1 font-medium">
                  โครงการ {request.projectCode} · {request.packageCode} · {request.drawingRev}
                </p>
                <p className="text-xs text-[#596780] mt-0.5">
                  ต้องใช้ 14 ก.ย. 2569 · สถานที่ส่ง: {request.zone}
                </p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F3F7FC] text-[#596780] font-semibold">
                      <th className="py-2.5 px-4 rounded-l-md">รหัส / รายการ</th>
                      <th className="py-2.5 px-4 text-center">จำนวน</th>
                      <th className="py-2.5 px-4 text-right rounded-r-md">หน่วย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4FA]">
                    {request.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 font-semibold text-[#0D255B]">
                          {item.itemCode} / {item.description}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#0D255B]">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-[#596780]">
                          {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-[#E4EAF4] flex items-center justify-between text-xs text-[#596780]">
                <div>ผู้จัดทำ: ผู้วางแผน</div>
                <div>ผู้อนุมัติ: PM โครงการ</div>
              </div>

              <div className="text-[11px] text-[#7086A8] italic">
                หมายเหตุ: กรุณายืนยันปริมาณและวันที่พร้อมส่ง
              </div>
            </div>
          </div>

          {/* Download Buttons matching SVG 14 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="py-2.5 px-5 rounded-lg bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="py-2.5 px-5 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#7086A8]" />
              ดาวน์โหลด CSV
            </button>
          </div>
        </div>

        {/* Right Column: Warehouse Response Form matching SVG 14 */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6 space-y-5">
          <h2 className="text-base font-bold text-[#0D255B] border-b border-[#E4EAF4] pb-3">
            ข้อมูลส่งออก / ตอบกลับ
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
              ช่องทางส่ง
            </label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#FCFDFF] border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
              เลขอ้างอิงภายนอก
            </label>
            <input
              type="text"
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-semibold focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
              ผู้ยืนยัน / เวลา
            </label>
            <input
              type="text"
              value={confirmedByTime}
              onChange={(e) => setConfirmedByTime(e.target.value)}
              className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
              ไฟล์ตอบกลับ
            </label>
            <input
              type="text"
              value={responseFile}
              onChange={(e) => setResponseFile(e.target.value)}
              className="w-full bg-white border border-[#D0D9E7] rounded-lg px-3 py-2 text-xs text-[#0D255B] font-medium focus:outline-none focus:ring-1 focus:ring-[#075DD8]"
            />
          </div>

          {/* Alert box matching SVG 14 */}
          <div className="bg-[#FFF7EB] rounded-xl p-4 border border-[#FBE0B5] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#B25E09] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-[#B25E09] font-bold block">
                สถานะส่งเอกสาร
              </strong>
              <p className="text-[#844306] text-[11px] mt-0.5 leading-relaxed">
                ดาวน์โหลดไฟล์ ≠ ส่งสำเร็จ เจ้าหน้าที่ต้องยืนยันการส่งและแนบหลักฐาน
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveResponse}
            className="w-full py-3 px-4 rounded-xl bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            {isSaving ? "กำลังบันทึก..." : "บันทึกผลตอบกลับ"}
          </button>
        </div>
      </div>
    </div>
  );
}
