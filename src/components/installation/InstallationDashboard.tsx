"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  ClipboardList,
  Layers,
  ArrowRight,
  FileCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { InstallationSummaryItem } from "@/app/actions/installation";

interface InstallationDashboardProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
    workType: string;
    status: string;
    clientName: string;
  }>;
  currentProject: any;
  packages: InstallationSummaryItem[];
  stats: {
    totalTasks: number;
    actualProgress: number;
    qcProgress: number;
    pendingIrCount: number;
    openNcrCount: number;
  };
  pendingInspections: any[];
  ncrRecords: any[];
}

export function InstallationDashboard({
  allProjects,
  currentProject,
  packages,
  stats,
  pendingInspections,
  ncrRecords,
}: InstallationDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    router.push(`/installation?projectId=${selectedId}`);
  };

  const projectTabs = [
    { label: "ภาพรวม", href: `/projects/${currentProject.id}` },
    { label: "ชุดงาน", href: `/projects/${currentProject.id}` },
    { label: "แผนงาน", href: `/planning?projectId=${currentProject.id}` },
    { label: "แบบ / BOM", href: `/projects/${currentProject.id}?tab=bom` },
    { label: "วัสดุ", href: `/materials?projectId=${currentProject.id}` },
    { label: "ขนส่ง", href: `/transport?projectId=${currentProject.id}` },
    { label: "ติดตั้ง / QC", href: `/installation?projectId=${currentProject.id}`, active: true },
    { label: "เอกสาร", href: `/documents?projectId=${currentProject.id}` },
    { label: "รูปภาพ", href: `/photos?projectId=${currentProject.id}` },
  ];

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.stageDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.ncrCode && pkg.ncrCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pkg.inspectionNo && pkg.inspectionNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Project Header matching SVG 19 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  โครงการทั้งหมด  /</span>
              <span className="text-xs font-semibold text-gray-700">{currentProject.name}  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">การติดตั้งและตรวจคุณภาพ</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">{currentProject.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#075DD8] border border-blue-200">
                งานเสารั้ว (F)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                กำลังดำเนินงาน
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentProject.code} · ผู้ว่าจ้าง: {currentProject.clientName || "บริษัทลูกค้าตัวอย่าง จำกัด"} · สัญญา 4.85 ลบ. (4 งวด) · 1 ก.ย. – 30 พ.ย. 2569 (90 วัน)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentProject.id}
              onChange={handleProjectChange}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
            <Link
              href={`/projects/${currentProject.id}`}
              className="px-3.5 py-2 text-xs font-semibold text-[#132142] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              แก้ไขโครงการ
            </Link>
          </div>
        </div>

        {/* 9 Tabs navigation */}
        <div className="flex items-center gap-1 border-b border-gray-200 mt-5 overflow-x-auto text-xs font-medium">
          {projectTabs.map((tab, idx) => (
            <Link
              key={idx}
              href={tab.href}
              className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition ${
                tab.active
                  ? "border-[#075DD8] text-[#075DD8] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Subheader Search and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชุดงาน Span หรือเลขที่ IR / NCR…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            ตัวกรอง
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/installation/daily-log/new"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            บันทึกผลงานประจำวัน
          </Link>
          <Link
            href="/installation/inspection/IR-260023"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            ส่งคำขอตรวจ QC
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards matching SVG 19 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: งานติดตั้งและ QC ทั้งหมด */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">งานติดตั้งและ QC ทั้งหมด</span>
              <ShieldCheck className="w-4 h-4 text-[#075DD8]" />
            </div>
            <div className="text-2xl font-bold text-[#132142] mt-2">10 Tasks</div>
            <p className="text-xs text-gray-500 mt-0.5">78% ทำงานจริง (รอตรวจ 19%)</p>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-emerald-600">59% รับรองคุณภาพ</span>
              <span className="text-gray-400">78% ติดตั้งแล้ว</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
              <div className="bg-emerald-500 h-2" style={{ width: "59%" }} />
              <div className="bg-amber-400 h-2" style={{ width: "19%" }} />
            </div>
          </div>
        </div>

        {/* Card 2: ชุดงาน WP-F-01 (โซน A) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ชุดงาน WP-F-01 (โซน A)</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-[#132142] mt-2">78% / 59%</div>
            <p className="text-xs text-gray-500 mt-0.5">ช่วงเสา F01–F10 · 10 Tasks</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              ทำงานจริง 78%
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              QC ผ่าน 59%
            </span>
          </div>
        </div>

        {/* Card 3: คำขอรอตรวจ (IR) */}
        <Link
          href="/installation/inspection/IR-260023"
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">คำขอรอตรวจ (IR)</span>
              <ClipboardList className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2">1 ฉบับ</div>
            <p className="text-xs text-gray-500 mt-0.5">IR-260023 · ช่วงเสา F01–F10</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              กำหนดตรวจวันนี้ 15:00
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
          </div>
        </Link>

        {/* Card 4: ข้อบกพร่อง (NCR) */}
        <Link
          href="/installation/ncr/NCR-260006"
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-rose-400 hover:shadow-md transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ข้อบกพร่อง (NCR)</span>
              <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2">1 รายการ</div>
            <p className="text-xs text-gray-500 mt-0.5">NCR-260006 · จุด F08</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              ระดับ ร้ายแรง (Major) · กำหนด 14 ก.ย.
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
          </div>
        </Link>
      </div>

      {/* Main Table: งานติดตั้งและสถานะคุณภาพตามชุดงาน matching SVG 19 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#132142]">
              งานติดตั้งและสถานะคุณภาพตามชุดงาน ({currentProject.code} · งานเสารั้ว (F) · 10 Tasks)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              แสดงความก้าวหน้าการทำงานจริง เปรียบเทียบกับผลการตรวจรับรองคุณภาพ QC
            </p>
          </div>
          <span className="text-xs font-semibold text-[#075DD8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            รวม 3 ชุดงาน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">ชุดงาน / จุดตรวจ QC</th>
                <th className="py-3 px-4 text-center">ทำแล้ว</th>
                <th className="py-3 px-4 text-center">ผ่าน QC</th>
                <th className="py-3 px-4">ขั้นตอน / ขอบเขตงาน</th>
                <th className="py-3 px-4 text-center">สถานะคุณภาพ</th>
                <th className="py-3 px-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-blue-50/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-[#132142]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#075DD8]" />
                      <span>{pkg.packageName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                    <span className={pkg.progressActual > 0 ? "text-blue-600" : "text-gray-400"}>
                      {pkg.progressActual}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={pkg.progressQc > 0 ? "text-emerald-600" : "text-gray-400"}>
                      {pkg.progressQc}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {pkg.stageDescription}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {pkg.qcBadgeTone === "orange" && (
                      <Link
                        href={`/installation/ncr/${pkg.ncrCode || "NCR-260006"}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        {pkg.qcStatus}
                      </Link>
                    )}
                    {pkg.qcBadgeTone === "gray" && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        {pkg.qcStatus}
                      </span>
                    )}
                    {pkg.qcBadgeTone === "green" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {pkg.qcStatus}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href="/installation/workflow/f"
                        className="text-xs font-semibold text-[#075DD8] hover:underline"
                      >
                        ดูขั้นตอน
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        href="/installation/inspection/IR-260023"
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                      >
                        ตรวจ QC
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fast Navigation Grid to Phase 3 Workflows & Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card A: ขั้นตอนงานตามประเภทสินค้า (Workflows SVG 20, 21, 22, 23) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#132142] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#075DD8]" />
              ขั้นตอนงานตามประเภทสินค้า (Workflow Tracking)
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">SVG 20, 21, 22, 23</span>
          </div>
          <div className="mt-3 space-y-2.5">
            <Link
              href="/installation/workflow/f"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  F
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                    ติดตามงานเสารั้ว (Fence - F)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    จุดตรวจปัจจุบัน: เก็บงานรั้ว F08 · ผ่าน QC 59% (SVG 22)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/installation/workflow/rw"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  RW
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                    ติดตามงานกำแพงกันดิน (L-Wall - RW)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    จุดตรวจปัจจุบัน: งานถมกลับ · ผ่าน QC 80% (SVG 20)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/installation/workflow/rwf"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  RWF
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                    ติดตามงานกำแพงกันดินพร้อมเสารั้ว (L-Wall + F)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    จุดตรวจปัจจุบัน: ติดตั้งเสารั้ว · ผ่าน QC 65% (SVG 21)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/installation/gates/pt"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  PT
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                    งานพื้นโพสเทนชั่น (PT) · จุดอนุมัติ AP1–AP7
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    จุดรอพิจารณา AP3: กำลังอัดคอนกรีต LAB-P01-003 (SVG 23)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Card B: รายการตรวจและเอกสารควบคุม (SVG 24, 25, 26) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#132142] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#075DD8]" />
              รายการตรวจและเอกสารควบคุมคุณภาพ
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">SVG 24, 25, 26</span>
          </div>
          <div className="mt-3 space-y-2.5">
            <Link
              href="/installation/inspection/IR-260023"
              className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  IR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-800">
                      ตรวจและพิจารณาคำขอ QC (IR-260023)
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                      ตรวจซ้ำ
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    ขอบเขต F01–F10 · ผิวและรอยต่อ F08 รอแก้ไข (SVG 24)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/installation/ncr/NCR-260006"
              className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  NCR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-rose-800">
                      แก้ไขข้อบกพร่อง NCR (NCR-260006)
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-200 text-rose-800">
                      Major
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    ตำแหน่ง F08 · กำหนดเสร็จ 14 ก.ย. 2569 (SVG 25)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/installation/daily-log/new"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  LOG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                    บันทึกผลงานประจำวัน (Daily Log)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    บันทึกปริมาณงานติดตั้ง แรงงาน เครื่องจักร และเหตุการณ์ไซต์ (SVG 26)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
