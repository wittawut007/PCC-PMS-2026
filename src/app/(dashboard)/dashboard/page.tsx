import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FolderKanban,
  PlayCircle,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  Calendar,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { formatThaiDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch real projects from PostgreSQL
  const dbProjects = await prisma.project.findMany({
    include: {
      workPackages: true,
      contracts: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = dbProjects.length;
  const activeCount = dbProjects.filter((p) => p.status === "ACTIVE").length;
  const lateCount = 1; // demo metric
  const pendingCount = 5; // demo metric

  // Format today's date in Thai
  const todayFormatted = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Page Heading matching SVG 01 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0D255B] tracking-tight">
            ภาพรวมระบบ
          </h1>
          <p className="text-[#596780] text-xs sm:text-sm mt-0.5">
            ข้อมูลสำคัญสำหรับติดตามโครงการและดำเนินงานวันนี้
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[11px] text-[#6C7D99] hidden lg:block">
            อัปเดตล่าสุด {todayFormatted} · 09:41
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#E4EAF4] rounded-lg px-3 py-1.5 text-xs text-[#0D255B] shadow-xs">
            <Calendar className="w-4 h-4 text-[#627DA5]" />
            <select
              defaultValue="year"
              aria-label="ช่วงเวลาโครงการ"
              className="bg-transparent border-0 text-xs text-[#0D255B] font-medium focus:outline-none cursor-pointer"
            >
              <option value="year">ปี 2569 (1 ม.ค. – 31 ธ.ค.)</option>
              <option value="month">เดือนปัจจุบัน</option>
              <option value="all">ทุกช่วงเวลา</option>
            </select>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-[#075DD8] hover:bg-[#004AB3] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างโครงการ</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat KPI Cards matching SVG 01 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: โครงการทั้งหมด */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#596780]">
              โครงการทั้งหมด
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0D255B]">
              {totalCount > 0 ? totalCount : 18}
            </span>
            <span className="text-xs text-[#596780]">โครงการ</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6C7D99]">
            ในขอบเขตการดำเนินงานทั้งหมด
          </div>
        </div>

        {/* KPI 2: กำลังดำเนินการ */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#596780]">
              กำลังดำเนินการ
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF7F0] text-[#147747] flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#147747]">
              {activeCount > 0 ? activeCount : 12}
            </span>
            <span className="text-xs text-[#147747] font-medium">
              {totalCount > 0
                ? Math.round((activeCount / totalCount) * 100)
                : 67}
              % ของทั้งหมด
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6C7D99]">
            โครงการที่ดำเนินงานตามแผน
          </div>
        </div>

        {/* KPI 3: โครงการล่าช้า */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#596780]">
              โครงการล่าช้า
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFEDF0] text-[#B72839] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#B72839]">
              {lateCount}
            </span>
            <span className="text-xs text-[#B72839] font-medium">
              ต้องติดตามวันนี้
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6C7D99]">
            เกินกำหนดและ QC ยังไม่ครบ
          </div>
        </div>

        {/* KPI 4: รายการรอดำเนินการ */}
        <div className="bg-white rounded-xl p-5 border border-[#E4EAF4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#596780]">
              รายการรอดำเนินการ
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F2ECFF] text-[#6940B9] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#6940B9]">
              {pendingCount}
            </span>
            <span className="text-xs text-[#6940B9] font-medium">
              งานที่ต้องตรวจสอบ
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6C7D99]">
            คำขออนุมัติ, QC และเที่ยวส่งของ
          </div>
        </div>
      </div>

      {/* Middle Row: Left Status & Finance (2/3) + Right Action Items (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: สถานะโครงการและการเงิน */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0D255B]">
                สถานะโครงการและการเงิน
              </h2>
              <p className="text-xs text-[#596780] mt-0.5">
                ภาพรวมข้อมูลที่ผ่านการยืนยันล่าสุด
              </p>
            </div>
            <Link
              href="/costs"
              className="text-xs font-semibold text-[#075DD8] hover:underline flex items-center gap-1"
            >
              ดูรายละเอียด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* QC Progress Sub-section */}
            <div className="bg-[#F8FAFD] rounded-xl p-4 border border-[#EBF1FA]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#596780]">
                  ความก้าวหน้าที่ผ่าน QC
                </span>
                <span className="text-xs text-[#075DD8] font-bold">61%</span>
              </div>
              <div className="text-2xl font-extrabold text-[#075DD8] mt-1 mb-2">
                61%
              </div>
              <div className="w-full bg-[#E2EAF4] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#075DD8] h-full rounded-full transition-all"
                  style={{ width: "61%" }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#596780] mt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#147747]" />
                  12 โครงการตามแผน
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B72839]" />
                  2 โครงการล่าช้า
                </span>
              </div>
            </div>

            {/* Budget Sub-section */}
            <div className="bg-[#F8FAFD] rounded-xl p-4 border border-[#EBF1FA]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#596780]">
                  งบประมาณรวม
                </span>
                <span className="text-xs text-[#3B9BF4] font-bold">70%</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0D255B] mt-1 mb-2">
                125.0{" "}
                <span className="text-xs font-normal text-[#596780]">
                  ล้านบาท
                </span>
              </div>
              <div className="w-full bg-[#E2EAF4] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3B9BF4] h-full rounded-full transition-all"
                  style={{ width: "70%" }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#596780] mt-3">
                <span>เบิกจ่ายแล้ว 87.5 ลบ. · 70%</span>
                <span className="text-[#147747] font-semibold">
                  คงเหลือ 37.5 ลบ.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: สิ่งที่ต้องดำเนินการ */}
        <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0D255B]">
              สิ่งที่ต้องดำเนินการ
            </h2>
            <Link
              href="/installation"
              className="text-xs font-semibold text-[#075DD8] hover:underline"
            >
              ดูทั้งหมด (5)
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {/* Item 1 */}
            <div className="p-3 bg-[#FFF5F6] border border-[#FDDCE1] rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#FFEDF0] text-[#B72839] flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#B72839]">
                  ล่าช้ากว่าแผน 5 วัน
                </div>
                <div className="text-[11px] text-[#596780] mt-0.5">
                  PCC-26003 · กำแพงกันดิน
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-3 bg-[#FFFDF5] border border-[#FCEECF] rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#FFF3E4] text-[#965500] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#965500]">
                  รอยืนยันแบบ Rev.03
                </div>
                <div className="text-[11px] text-[#596780] mt-0.5">
                  PCC-26002 · ภายใน 18 ก.ย.
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-3 bg-[#F6F9FF] border border-[#DFEAFC] rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#075DD8]">
                  เอกสาร QC ค้างส่ง
                </div>
                <div className="text-[11px] text-[#596780] mt-0.5">
                  PCC-26001 · อาคารสำนักงาน
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Left Projects Table (2/3) + Right Today's Activities (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: โครงการที่ต้องติดตาม */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0D255B]">
                โครงการที่ต้องติดตาม
              </h2>
              <p className="text-xs text-[#596780] mt-0.5">
                รายการโครงการล่าสุดและสถานะความคืบหน้า
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-[#075DD8] hover:underline flex items-center gap-1"
            >
              ดูโครงการทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAF4] text-[#596780] font-semibold">
                  <th className="pb-3 px-2">โครงการ</th>
                  <th className="pb-3 px-2">สถานะ</th>
                  <th className="pb-3 px-2">ความก้าวหน้า</th>
                  <th className="pb-3 px-2 text-right">กำหนดส่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4FA]">
                {dbProjects.map((p) => {
                  const isLate = p.code === "PCC-26003";
                  const isFinished = p.status === "COMPLETED";
                  const pctVal =
                    p.code === "PCC-26001"
                      ? 78
                      : p.code === "PCC-26002"
                      ? 48
                      : p.code === "PCC-26003"
                      ? 35
                      : 65;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F9FBFE] transition-colors"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/projects/${p.id}`}
                          className="group block"
                        >
                          <span className="font-semibold text-[#075DD8] group-hover:underline">
                            {p.code}
                          </span>
                          <span className="text-[#0D255B] font-medium ml-2">
                            {p.name}
                          </span>
                          <div className="text-[11px] text-[#6C7D99]">
                            {p.clientName}
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        {isLate ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFEDF0] text-[#B72839]">
                            ล่าช้า
                          </span>
                        ) : isFinished ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF7F0] text-[#147747]">
                            เสร็จสิ้น
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF3FF] text-[#075DD8]">
                            ดำเนินการ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#E2EAF4] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#075DD8] h-full rounded-full"
                              style={{ width: `${pctVal}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#0D255B] w-8">
                            {pctVal}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-[#596780] font-medium">
                        {formatThaiDate(p.targetDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: กิจกรรมวันนี้ */}
        <div className="bg-white rounded-xl p-6 border border-[#E4EAF4] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0D255B]">กิจกรรมวันนี้</h2>
            <Link
              href="/reports"
              className="text-xs font-semibold text-[#075DD8] hover:underline"
            >
              ดูกิจกรรมทั้งหมด
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {/* Timeline Item 1 */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#075DD8] mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#0D255B]">
                  09:00 · ตรวจความก้าวหน้า
                </div>
                <div className="text-[11px] text-[#596780]">
                  PCC-26001 · อาคารสำนักงาน
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#147747] mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#0D255B]">
                  10:30 · รถถึงหน้างาน
                </div>
                <div className="text-[11px] text-[#596780]">
                  TR-042 · ตรวจรับสินค้า 12 แผ่น
                </div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#075DD8] mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#0D255B]">
                  13:30 · ยืนยันแบบ Rev.03
                </div>
                <div className="text-[11px] text-[#596780]">
                  PCC-26002 · แบบประกอบการติดตั้ง
                </div>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#147747] mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#0D255B]">
                  15:00 · ตรวจเอกสาร QC
                </div>
                <div className="text-[11px] text-[#596780]">
                  PCC-26004 · Quality Gate AP2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section: เมนูที่ใช้บ่อย matching SVG 01 */}
      <div>
        <h2 className="text-sm font-bold text-[#0D255B] mb-3">เมนูที่ใช้บ่อย</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/planning"
            className="bg-white rounded-xl p-4 border border-[#E4EAF4] hover:border-[#075DD8] hover:shadow-sm transition-all group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#075DD8] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8] transition-colors">
                แผนงานโครงการ
              </div>
              <div className="text-[11px] text-[#596780] mt-0.5">
                Gantt และกำหนดส่ง
              </div>
            </div>
          </Link>

          <Link
            href="/materials"
            className="bg-white rounded-xl p-4 border border-[#E4EAF4] hover:border-[#075DD8] hover:shadow-sm transition-all group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#075DD8] group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8] transition-colors">
                วัสดุและคลัง
              </div>
              <div className="text-[11px] text-[#596780] mt-0.5">
                ยอดพร้อมจ่ายและรายการขาด
              </div>
            </div>
          </Link>

          <Link
            href="/transport"
            className="bg-white rounded-xl p-4 border border-[#E4EAF4] hover:border-[#075DD8] hover:shadow-sm transition-all group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#075DD8] group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8] transition-colors">
                ขนส่งและตรวจรับ
              </div>
              <div className="text-[11px] text-[#596780] mt-0.5">
                เที่ยววันนี้และสถานะรถ
              </div>
            </div>
          </Link>

          <Link
            href="/installation"
            className="bg-white rounded-xl p-4 border border-[#E4EAF4] hover:border-[#075DD8] hover:shadow-sm transition-all group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EAF3FF] text-[#075DD8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#075DD8] group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0D255B] group-hover:text-[#075DD8] transition-colors">
                ติดตั้งและ QC
              </div>
              <div className="text-[11px] text-[#596780] mt-0.5">
                คำขอตรวจและ NCR
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Info Note matching SVG */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#596780] pt-2 border-t border-[#E4EAF4]">
        <span>PCC PMS 2026 · Project Management System</span>
        <span>ข้อมูลตัวอย่างสำหรับทบทวน UX/UI</span>
      </div>
    </div>
  );
}
