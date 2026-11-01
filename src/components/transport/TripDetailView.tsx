"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  Truck,
  ArrowRight,
} from "lucide-react";

interface TripDetailViewProps {
  trip: {
    id: string;
    tripNo: string;
    projectCode: string;
    projectName: string;
    packageCode: string;
    packageName: string;
    zone: string;
    origin: string;
    destination: string;
    scheduledAt: string;
    arrivedAt: string;
    coordinator: string;
    referenceDoc: string;
    driverName: string;
    plateNo: string;
    deliveryNoteNo: string;
    cargo: {
      itemCode: string;
      name: string;
      qty: number;
      unit: string;
      deliveryNoteNo: string;
    };
    timeline: Array<{
      title: string;
      at: string;
      done: boolean;
    }>;
    status: string;
  };
}

export function TripDetailView({ trip }: TripDetailViewProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title matching SVG 17 */}
      <div>
        <div className="text-[11px] text-[#596780] mb-1">
          PCC PMS / พื้นที่ทำงาน / รายละเอียดเที่ยวรถ {trip.tripNo}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/transport"
            className="p-1.5 rounded-lg border border-[#D0D9E7] text-[#596780] hover:text-[#0D255B] hover:bg-[#F5F8FD] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              รายละเอียดเที่ยวรถ {trip.tripNo}
            </h1>
            <p className="text-xs text-[#596780] mt-0.5">
              โครงการตัวอย่าง PCC · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout matching SVG 17 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Shipment & Cargo Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: ข้อมูลจัดส่ง */}
          <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-[#0D255B] border-b border-[#E4EAF4] pb-3">
              ข้อมูลจัดส่ง
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#F8FAFD]">
                <span className="text-[#596780]">โครงการ / ชุดงาน</span>
                <span className="font-bold text-[#0D255B]">{trip.projectCode} / {trip.packageCode}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#F8FAFD]">
                <span className="text-[#596780]">ต้นทาง &gt; ปลายทาง</span>
                <span className="font-bold text-[#0D255B]">{trip.origin} &gt; {trip.destination}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#F8FAFD]">
                <span className="text-[#596780]">วันนัด / ถึงจริง</span>
                <span className="font-bold text-[#0D255B]">{trip.scheduledAt} / {trip.arrivedAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#F8FAFD]">
                <span className="text-[#596780]">ผู้ประสาน / ผู้รับ</span>
                <span className="font-bold text-[#0D255B]">{trip.coordinator}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1">
                <span className="text-[#596780]">เอกสารอ้างอิง</span>
                <span className="font-bold text-[#0D255B]">{trip.referenceDoc}</span>
              </div>
            </div>
          </div>

          {/* Card 2: รายการส่งมอบ */}
          <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-[#0D255B] border-b border-[#E4EAF4] pb-3">
              รายการส่งมอบ
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                    <th className="py-2.5 px-4">วัสดุ</th>
                    <th className="py-2.5 px-4 text-center">ส่ง</th>
                    <th className="py-2.5 px-4 text-center">หน่วย</th>
                    <th className="py-2.5 px-4 text-right">ใบส่งของ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0D255B]">
                      {trip.cargo.name}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0D255B]">
                      {trip.cargo.qty}
                    </td>
                    <td className="py-3 px-4 text-center text-[#596780]">
                      {trip.cargo.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[#075DD8]">
                      {trip.cargo.deliveryNoteNo}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Alert Box matching SVG 17 */}
            <div className="bg-[#FFF7EB] rounded-xl p-4 border border-[#FBE0B5] flex items-start gap-3 mt-4">
              <AlertTriangle className="w-4 h-4 text-[#B25E09] flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-[#B25E09] font-bold block">
                  แยกสถานะรถจากสถานะตรวจรับ
                </strong>
                <p className="text-[#844306] text-[11px] mt-0.5 leading-relaxed">
                  รถถึงไซต์ไม่ได้แปลว่าวัสดุผ่านรับทั้งหมด ต้องตรวจจำนวนและความเสียหายก่อน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Events Timeline & Actions matching SVG 17 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Events Timeline Card */}
          <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs p-6">
            <h3 className="text-sm font-bold text-[#0D255B] mb-4">
              เหตุการณ์ขนส่ง
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4EAF4]">
              {trip.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                      event.done
                        ? "bg-[#EAF7F0] text-[#147747]"
                        : "bg-[#FFF7EB] text-[#B25E09]"
                    }`}
                  >
                    {event.done ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Clock className="w-3 h-3 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0D255B] block">
                      {event.title}
                    </strong>
                    <p className="text-[11px] text-[#596780] mt-0.5">
                      {event.at}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4EAF4]">
              <button
                type="button"
                onClick={() => alert("ระบบอัปเดตสถานะรถขนส่ง")}
                className="w-full py-2.5 px-4 rounded-xl border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all text-center shadow-xs"
              >
                อัปเดตสถานะรถ
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link
              href={`/transport/receiving/${trip.tripNo}`}
              className="w-full py-3 px-4 rounded-xl bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              เริ่มตรวจรับวัสดุ
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/materials/dispatch/req-260012`}
              className="w-full py-2.5 px-4 rounded-xl border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <FileText className="w-4 h-4" />
              ดูเอกสารที่เกี่ยวข้อง
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
