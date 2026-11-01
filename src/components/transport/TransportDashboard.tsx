"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Search,
  Filter,
  Plus,
  ExternalLink,
  ChevronDown,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { TripListItem } from "@/app/actions/transport";

interface TransportDashboardProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
    workType: string;
    status: string;
    clientName: string;
  }>;
  currentProject: any;
  trips: TripListItem[];
}

export function TransportDashboard({
  allProjects,
  currentProject,
  trips,
}: TransportDashboardProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"all" | "in_transit" | "waiting" | "issues">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTripNo, setSelectedTripNo] = useState("TRN-260018");

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    router.push(`/transport?projectId=${selectedId}`);
  };

  const projectTabs = [
    { label: "ภาพรวม", href: `/projects/${currentProject.id}` },
    { label: "ชุดงาน", href: `/projects/${currentProject.id}` },
    { label: "แผนงาน", href: `/planning?projectId=${currentProject.id}` },
    { label: "แบบ / BOM", href: `/projects/${currentProject.id}?tab=bom` },
    { label: "วัสดุ", href: `/materials?projectId=${currentProject.id}` },
    { label: "ขนส่ง", href: `/transport?projectId=${currentProject.id}`, active: true },
    { label: "ติดตั้ง / QC", href: `/installation?projectId=${currentProject.id}` },
    { label: "เอกสาร", href: `/documents?projectId=${currentProject.id}` },
    { label: "รูปภาพ", href: `/photos?projectId=${currentProject.id}` },
  ];

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.tripNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "in_transit") {
      return t.status === "IN_TRANSIT" || t.status === "ARRIVED";
    }
    if (activeTab === "waiting") {
      return t.tripNo === "TRN-260018" || t.receivingLabel.includes("รับบางส่วน") || t.receivingLabel.includes("ยังไม่รับ");
    }
    if (activeTab === "issues") {
      return t.badQty > 0 || t.missingQty > 0 || t.receivingLabel.includes("รับบางส่วน");
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header matching SVG 16 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-[#596780] mb-1">
            PCC PMS / โครงการทั้งหมด / {currentProject.name} / การขนส่งและตรวจรับ
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0D255B] tracking-tight">
              {currentProject.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3FF] text-[#075DD8]">
              งาน{currentProject.workType === "F" ? "เสารั้ว (F)" : currentProject.workType === "RW" ? "กำแพงกันดิน (RW)" : currentProject.workType === "RWF" ? "กำแพงพร้อมรั้ว (RWF)" : "พื้นโพสเทนชั่น (PT)"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF7F0] text-[#147747]">
              กำลังดำเนินงาน
            </span>
          </div>
          <p className="text-xs text-[#596780] mt-1">
            {currentProject.code} · ผู้ว่าจ้าง: {currentProject.clientName} · สัญญา 4.85 ลบ. (4 งวด) · 1 ก.ย. – 30 พ.ย. 2569 (90 วัน)
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <select
              value={currentProject.id}
              onChange={handleProjectChange}
              className="appearance-none bg-white border border-[#D0D9E7] text-xs font-semibold text-[#0D255B] rounded-lg py-2 pl-3 pr-8 hover:border-[#075DD8] focus:outline-none focus:ring-1 focus:ring-[#075DD8] shadow-xs cursor-pointer"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name} ({p.workType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#596780] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <Link
            href={`/projects/${currentProject.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] transition-all"
          >
            เปิดศูนย์กลางโครงการ
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-[#E4EAF4] overflow-x-auto gap-6 text-xs font-medium">
        {projectTabs.map((tab, idx) => (
          <Link
            key={idx}
            href={tab.href}
            className={`pb-3 whitespace-nowrap transition-colors border-b-2 ${
              tab.active
                ? "border-[#075DD8] text-[#075DD8] font-bold"
                : "border-transparent text-[#596780] hover:text-[#0D255B]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search & Actions Bar matching SVG 16 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#7086A8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาเลขเที่ยวรถ โครงการ หรือทะเบียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D0D9E7] rounded-lg pl-9 pr-3 py-2 text-xs text-[#0D255B] placeholder-[#7086A8] focus:outline-none focus:ring-1 focus:ring-[#075DD8] shadow-xs"
            />
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Filter className="w-3.5 h-3.5 text-[#7086A8]" />
            ตัวกรอง
          </button>
        </div>

        <button
          type="button"
          onClick={() => alert("ระบบเปิดแบบฟอร์มวางแผนเที่ยวรถขนส่งใหม่")}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          วางแผนเที่ยวรถ
        </button>
      </div>

      {/* Filter Tabs matching SVG 16 */}
      <div className="flex items-center gap-2 border-b border-[#E4EAF4] overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "all"
              ? "border-[#075DD8] text-[#075DD8]"
              : "border-transparent text-[#596780] hover:text-[#0D255B]"
          }`}
        >
          เที่ยวรถทั้งหมด ({trips.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("in_transit")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "in_transit"
              ? "border-[#075DD8] text-[#075DD8]"
              : "border-transparent text-[#596780] hover:text-[#0D255B]"
          }`}
        >
          ระหว่างขนส่ง
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("waiting")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "waiting"
              ? "border-[#075DD8] text-[#075DD8]"
              : "border-transparent text-[#596780] hover:text-[#0D255B]"
          }`}
        >
          รอตรวจรับ (TRN-260018)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("issues")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "issues"
              ? "border-[#075DD8] text-[#075DD8]"
              : "border-transparent text-[#596780] hover:text-[#0D255B]"
          }`}
        >
          มีข้อผิดพลาด / ขาด
        </button>
      </div>

      {/* Trips Table Card matching SVG 16 */}
      <div className="bg-white rounded-xl border border-[#E4EAF4] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4EAF4]">
          <h2 className="text-base font-bold text-[#0D255B]">
            เที่ยวขนส่งและตรวจรับหน้างาน ({currentProject.code} · งาน{currentProject.workType === "F" ? "เสารั้ว (F)" : "โครงสร้าง"})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                <th className="py-3 px-6">เที่ยวรถ / โครงการ</th>
                <th className="py-3 px-6">วันนัด</th>
                <th className="py-3 px-6">รายการ / ปริมาณ</th>
                <th className="py-3 px-6 text-center">สถานะรถ</th>
                <th className="py-3 px-6 text-center">ตรวจรับ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4FA]">
              {filteredTrips.map((trip) => {
                const isSelected = selectedTripNo === trip.tripNo;
                return (
                  <tr
                    key={trip.id}
                    onClick={() => setSelectedTripNo(trip.tripNo)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-[#F3F7FC]" : "hover:bg-[#F9FBFE]"
                    }`}
                  >
                    <td className="py-4 px-6 font-semibold text-[#0D255B]">
                      <span className="text-[#075DD8]">{trip.tripNo}</span> / {trip.projectCode}
                    </td>
                    <td className="py-4 px-6 text-[#596780]">
                      {trip.scheduledTime}
                    </td>
                    <td className="py-4 px-6 font-medium text-[#0D255B]">
                      {trip.cargoDescription}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          trip.statusTone === "blue"
                            ? "bg-[#EAF3FF] text-[#075DD8]"
                            : trip.statusTone === "green"
                            ? "bg-[#EAF7F0] text-[#147747]"
                            : "bg-[#F3F5F9] text-[#596780]"
                        }`}
                      >
                        {trip.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          trip.receivingTone === "orange"
                            ? "bg-[#FFF7EB] text-[#B25E09]"
                            : trip.receivingTone === "green"
                            ? "bg-[#EAF7F0] text-[#147747]"
                            : "bg-[#F3F5F9] text-[#596780]"
                        }`}
                      >
                        {trip.receivingLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons matching SVG 16 */}
        <div className="p-6 bg-[#FCFDFF] border-t border-[#E4EAF4] flex flex-wrap items-center gap-3">
          <Link
            href={`/transport/${selectedTripNo}`}
            className="px-5 py-2.5 rounded-lg bg-[#075DD8] hover:bg-[#054bb2] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
          >
            เปิดรายละเอียดเที่ยวรถ
          </Link>

          <Link
            href={`/transport/receiving/${selectedTripNo}`}
            className="px-4 py-2.5 rounded-lg border border-[#D0D9E7] bg-white text-xs font-semibold text-[#0D255B] hover:bg-[#F5F8FD] transition-all inline-flex items-center gap-2 shadow-xs"
          >
            บันทึกการตรวจรับ
          </Link>
        </div>
      </div>

      {/* Bottom Alert matching SVG 16 */}
      <div className="bg-[#F3F7FC] rounded-xl p-4 border border-[#E2EAF5] flex items-start gap-3">
        <FileText className="w-4 h-4 text-[#075DD8] flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-[#0D255B] block font-bold">
            ติดตามสถานะโดยเจ้าหน้าที่
          </strong>
          <p className="text-[#596780] mt-0.5 leading-relaxed text-[11px]">
            บันทึกผู้เปลี่ยนสถานะและเวลาจริงในแต่ละเหตุการณ์ • ใช้วันนัดและเวลาถึงจริง ไม่แสดงตำแหน่ง GPS แบบสด • แยกสถานะรถจากสถานะตรวจรับ
          </p>
        </div>
      </div>
    </div>
  );
}
