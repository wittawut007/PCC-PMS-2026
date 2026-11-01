import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Layers,
  ArrowRight,
  FolderKanban,
  Package,
  Truck,
  FileText,
  Image as ImageIcon,
  History,
  Wallet,
} from "lucide-react";
import { formatThaiDate, formatBaht, workTypeLabel, projectStatusLabel } from "@/lib/utils";
import { getProjectBomData } from "@/app/actions/materials";
import { BomTable } from "@/components/materials/BomTable";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const search = searchParams ? await searchParams : undefined;
  const currentTab = search?.tab || "overview";

  // Query project from DB
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: id }, { code: id }],
    },
    include: {
      workPackages: true,
      contracts: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Pre-calculated or demo values matching SVG 05
  const isPCC26001 = project.code === "PCC-26001";
  const donePct = isPCC26001 ? 78 : project.code === "PCC-26002" ? 48 : project.code === "PCC-26003" ? 35 : 65;
  const qcPct = isPCC26001 ? 59 : project.code === "PCC-26002" ? 35 : project.code === "PCC-26003" ? 20 : 50;

  // Days remaining
  const now = new Date();
  const target = project.targetDate ? new Date(project.targetDate) : new Date("2026-11-30");
  const diffDays = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const baseContract = project.contracts[0];
  const contractValue = baseContract ? Number(baseContract.baseValue) : 4850000;

  // Personnel roles map
  const pmMember = project.members.find((m) => m.roleInProject === "PM")?.user?.name || "สมชาย PM";
  const engMember = project.members.find((m) => m.roleInProject === "ENGINEER")?.user?.name || "วิศวกรโครงการ";
  const siteMember = project.members.find((m) => m.roleInProject === "SITE_ENGINEER")?.user?.name || "วิศวกรหน้างาน";
  const qcMember = project.members.find((m) => m.roleInProject === "QC_INSPECTOR")?.user?.name || "QC Inspector";
  const whMember = project.members.find((m) => m.roleInProject === "WAREHOUSE")?.user?.name || "คลังสินค้า";
  const costMember = "ผู้ควบคุมต้นทุน";

  // BOM Data query when tab is bom
  const bomData = currentTab === "bom" ? await getProjectBomData(project.id) : null;

  // Sub navigation tabs matching views.js & SVG 05 / 09
  const projectTabs = [
    { id: "overview", label: "ภาพรวม", href: `/projects/${project.id}`, active: currentTab === "overview" },
    { id: "planning", label: "แผนงาน", href: `/planning?projectId=${project.id}`, active: false },
    { id: "calendar", label: "ปฏิทิน", href: `/planning?projectId=${project.id}&view=calendar`, active: false },
    { id: "bom", label: "แบบ / BOM", href: `/projects/${project.id}?tab=bom`, active: currentTab === "bom" },
    { id: "materials", label: "วัสดุและคลัง", href: `/materials?projectId=${project.id}`, active: false },
    { id: "transport", label: "การขนส่ง & ตรวจรับ", href: `/transport?projectId=${project.id}`, active: false },
    { id: "installation", label: "การติดตั้ง & QC", href: `/installation?projectId=${project.id}`, active: false },
    { id: "costs", label: "งบประมาณ ต้นทุน", href: `/costs?projectId=${project.id}`, active: false },
    { id: "documents", label: "เอกสาร", href: `/documents?projectId=${project.id}`, active: false },
    { id: "reports", label: "รายงานสรุป", href: `/reports?projectId=${project.id}`, active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Project Heading matching SVG 05 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#0D255B] tracking-tight">
              {project.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF7F0] text-[#147747]">
              {projectStatusLabel[project.status] || "กำลังดำเนินงาน"}
            </span>
          </div>
          <p className="text-[#596780] text-xs sm:text-sm mt-1">
            {project.code} · {project.clientName} · {formatThaiDate(project.startDate)} – {formatThaiDate(project.targetDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="text-xs font-semibold text-[#596780] hover:text-[#0D255B] px-3 py-2 rounded-lg border border-[#E4EAF4] bg-white hover:bg-[#F5F8FC] transition-colors"
          >
            ← กลับรายการโครงการ
          </Link>
        </div>
      </div>

      {/* Project Tabs matching views.js & SVG 05 */}
      <div className="border-b border-[#E4EAF4] flex items-center gap-2 overflow-x-auto">
        {projectTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              tab.active
                ? "border-[#075DD8] text-[#075DD8]"
                : "border-transparent text-[#596780] hover:text-[#0D255B] hover:border-[#CCD8E8]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {currentTab === "bom" ? (
        <BomTable
          projectId={project.id}
          projectCode={project.code}
          projectName={project.name}
          drawing={bomData?.drawing || null}
        />
      ) : (
        <>
          {/* 4 Top KPI Summary Cards matching SVG 05 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#596780] font-semibold">
            <span>ความก้าวหน้างาน</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#0D255B]">
            {donePct}%
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            ทำแล้วตามปริมาณงาน
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#147747] font-semibold">
            <span>ผลงานผ่าน QC</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF7F0] text-[#147747] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#147747]">
            {qcPct}%
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            ตรวจรับและยืนยันแล้ว
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6940B9] font-semibold">
            <span>ระยะเวลาคงเหลือ</span>
            <div className="w-7 h-7 rounded-lg bg-[#F2ECFF] text-[#6940B9] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#6940B9]">
            {diffDays} วัน
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            กำหนดเสร็จ {formatThaiDate(project.targetDate)}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#965500] font-semibold">
            <span>ต้องดำเนินการ</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFF3E4] text-[#965500] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#965500]">
            2 เรื่อง
          </div>
          <div className="mt-1 text-[11px] text-[#6C7D99]">
            งานรออนุมัติและข้อบกพร่อง
          </div>
        </div>
      </div>

      {/* Main 2-Column Info Grid matching SVG 05 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: ข้อมูลโครงการ */}
          <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
            <h2 className="text-base font-bold text-[#0D255B] mb-1">
              ข้อมูลโครงการ
            </h2>
            <p className="text-xs text-[#596780] mb-4">
              ข้อมูลหลักจากสัญญาและการตั้งค่าโครงการ
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* สัญญาและลูกค้า */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#075DD8] uppercase tracking-wider pb-1 border-b border-[#F0F4FA]">
                  สัญญาและลูกค้า
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#596780]">เลขที่โครงการ:</span>
                    <strong className="text-[#0D255B]">{project.code}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#596780]">เลขที่สัญญา / PO:</span>
                    <strong className="text-[#0D255B]">
                      {project.contractNo || "—"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#596780]">ผู้ว่าจ้าง:</span>
                    <strong className="text-[#0D255B]">
                      {project.clientName}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#596780]">มูลค่าสัญญา:</span>
                    <strong className="text-[#075DD8]">
                      {formatBaht(contractValue)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* สถานที่และระยะเวลา */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#075DD8] uppercase tracking-wider pb-1 border-b border-[#F0F4FA]">
                  สถานที่และระยะเวลา
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#596780]">เริ่ม–สิ้นสุด:</span>
                    <strong className="text-[#0D255B]">
                      {formatThaiDate(project.startDate)} –{" "}
                      {formatThaiDate(project.targetDate)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#596780]">ประเภทงาน:</span>
                    <strong className="text-[#075DD8]">
                      {workTypeLabel[project.workType] || project.workType}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#596780]">สถานที่:</span>
                    <strong className="text-[#0D255B] text-right truncate max-w-[180px]">
                      {project.siteAddress || "—"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#596780]">จุดลงวัสดุ:</span>
                    <strong className="text-[#0D255B]">
                      Staging Area 1 · โซน A
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: ชุดงานและความก้าวหน้า */}
          <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0D255B]">
                  ชุดงานและความก้าวหน้า
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ความก้าวหน้ารวมใช้ผลงานผ่าน QC ถ่วงน้ำหนักตามชุดงาน
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4EAF4] text-[#596780] font-semibold bg-[#F8FAFD]">
                    <th className="py-2.5 px-3">ชุดงาน / พื้นที่</th>
                    <th className="py-2.5 px-3">เป้าหมาย</th>
                    <th className="py-2.5 px-3">ทำแล้ว</th>
                    <th className="py-2.5 px-3">ผ่าน QC</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4FA]">
                  {project.workPackages.map((wp, i) => {
                    const wpDone = i === 0 ? donePct : 0;
                    const wpQC = i === 0 ? qcPct : 0;

                    return (
                      <tr key={wp.id} className="hover:bg-[#F9FBFE]">
                        <td className="py-3 px-3">
                          <strong className="text-[#0D255B] block">
                            {wp.code} · {wp.name}
                          </strong>
                          <span className="text-[11px] text-[#596780]">
                            {wp.zone || "พื้นที่หลัก"} · น้ำหนัก {Number(wp.weight)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#596780]">
                          {Number(wp.target)} {wp.unit}
                        </td>
                        <td className="py-3 px-3 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#E2EAF4] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#075DD8] h-full rounded-full"
                                style={{ width: `${wpDone}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-[#0D255B]">
                              {wpDone}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#E2EAF4] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#147747] h-full rounded-full"
                                style={{ width: `${wpQC}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-[#147747]">
                              {wpQC}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF7F0] text-[#147747]">
                            {wp.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/installation?project=${project.id}`}
                            className="text-[#075DD8] font-bold text-[11px] hover:underline"
                          >
                            เปิดงาน →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: ผู้รับผิดชอบหลัก */}
          <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0D255B]">
                ผู้รับผิดชอบหลัก
              </h2>
              <p className="text-xs text-[#596780] mt-0.5">
                ทีมงานประจำโครงการและช่องทางประสานงาน
              </p>
            </div>

            <div className="space-y-3">
              {[
                { role: "ผู้จัดการโครงการ (PM)", name: pmMember },
                { role: "วิศวกรโครงการ", name: engMember },
                { role: "วิศวกรหน้างาน", name: siteMember },
                { role: "ผู้ตรวจคุณภาพ (QC)", name: qcMember },
                { role: "ผู้ประสานงานคลังและขนส่ง", name: whMember },
                { role: "ผู้ควบคุมต้นทุน", name: costMember },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#596780]">{p.role}</div>
                    <div className="text-xs font-bold text-[#0D255B] truncate">
                      {p.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: รายการที่ต้องดำเนินการ */}
          <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0D255B]">
              รายการที่ต้องดำเนินการ
            </h2>

            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-[#F0F4FA]">
                <strong className="text-[#0D255B] block">วัสดุและเที่ยวขนส่ง</strong>
                <p className="text-[#596780] text-[11px] mt-0.5">
                  ตรวจยอดจัดสรรและกำหนดถึงหน้างาน
                </p>
                <Link
                  href={`/transport?project=${project.id}`}
                  className="text-[#075DD8] font-bold text-[11px] inline-flex items-center gap-1 mt-1 hover:underline"
                >
                  ติดตามการขนส่ง <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="pb-3 border-b border-[#F0F4FA]">
                <strong className="text-[#0D255B] block">ตรวจรับและรับรองผลงาน</strong>
                <p className="text-[#596780] text-[11px] mt-0.5">
                  พิจารณา IR และติดตามงานแก้ไข
                </p>
                <Link
                  href={`/installation?project=${project.id}`}
                  className="text-[#075DD8] font-bold text-[11px] inline-flex items-center gap-1 mt-1 hover:underline"
                >
                  ดูงานตรวจ QC <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div>
                <strong className="text-[#0D255B] block">เผยแพร่ข้อมูลเจ้าของ</strong>
                <p className="text-[#596780] text-[11px] mt-0.5">
                  ตรวจทานฉบับที่จะเผยแพร่
                </p>
                <Link
                  href={`/reports?project=${project.id}`}
                  className="text-[#075DD8] font-bold text-[11px] inline-flex items-center gap-1 mt-1 hover:underline"
                >
                  รายงานโครงการ <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards matching SVG 05 */}
      <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
        <h2 className="text-sm font-bold text-[#0D255B] mb-3">ดูรายละเอียดเพิ่มเติม</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/planning?project=${project.id}`}
            className="p-4 rounded-xl border border-[#E4EAF4] hover:border-[#075DD8] hover:bg-[#F9FBFE] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#075DD8]" />
              <span className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8]">
                แผนงานและกำหนดการ
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7086A8] group-hover:text-[#075DD8] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href={`/materials?project=${project.id}`}
            className="p-4 rounded-xl border border-[#E4EAF4] hover:border-[#075DD8] hover:bg-[#F9FBFE] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-[#075DD8]" />
              <span className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8]">
                วัสดุและขนส่ง
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7086A8] group-hover:text-[#075DD8] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href={`/installation?project=${project.id}`}
            className="p-4 rounded-xl border border-[#E4EAF4] hover:border-[#075DD8] hover:bg-[#F9FBFE] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#075DD8]" />
              <span className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8]">
                ติดตั้งและตรวจ QC
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7086A8] group-hover:text-[#075DD8] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href={`/documents?project=${project.id}`}
            className="p-4 rounded-xl border border-[#E4EAF4] hover:border-[#075DD8] hover:bg-[#F9FBFE] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#075DD8]" />
              <span className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8]">
                เอกสารและรูปภาพ
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7086A8] group-hover:text-[#075DD8] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
