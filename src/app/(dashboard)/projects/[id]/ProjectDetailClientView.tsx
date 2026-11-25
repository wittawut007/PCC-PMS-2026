"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  BarChart3,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Package,
  Truck,
  Wallet,
  FileText,
  Image as ImageIcon,
  History,
  ListTodo,
  Warehouse,
  ArrowRight,
  User,
  ChevronRight,
  ExternalLink,
  MapPin,
  Coins,
  Receipt,
  FileCheck,
} from "lucide-react";
import type { SerializedProject } from "@/app/actions/planning";
import { GanttChart } from "@/components/planning/GanttChart";
import { WorkCalendar } from "@/components/planning/WorkCalendar";
import { ProjectHistoryView } from "@/components/history/ProjectHistoryView";
import type { ProjectHistoryData } from "@/lib/project-history";
import type { ProjectMaterialOverview } from "@/lib/project-materials";
import { ProjectMaterialsView } from "@/components/materials/ProjectMaterialsView";
import { TransportClientView, type TripDetailData } from "@/app/(dashboard)/transport/TransportClientView";
import { InstallationTimeline } from "@/components/installation/InstallationTimeline";
import type { InstallationTimelineData } from "@/lib/installation-data";
import { ProjectFinanceView } from "@/components/finance/ProjectFinanceView";
import type { ProjectFinanceData } from "@/lib/project-finance";
import { ProjectPhotosView } from "@/components/photos/ProjectPhotosView";
import type { ProjectPhotosData } from "@/lib/project-photos";
import { ProjectDocumentsView } from "@/components/documents/ProjectDocumentsView";
import type { ProjectDocumentsData } from "@/lib/project-documents";
import { StepProgressBar } from "@/components/common/StepProgressBar";
import "./project-detail.css";
import "./project-kpi.css";

export interface ProjectDetailData {
  id: string;
  code: string;
  name: string;
  clientName: string;
  contractNo: string;
  contractType: string;
  workType: string;
  workTypeLabel: string;
  status: "active" | "draft" | "closed" | "waiting" | "late";
  statusLabel: string;
  startDate: string;
  targetDate: string;
  siteAddress: string;
  stagingArea: string;
  accessRoute: string;
  readiness: string;
  contractValue: number;
  budget: number;
  actualCost: number;
  paymentTerms: string;
  teamDescription: string;
  personnel: {
    pm: string;
    engineer: string;
    site: string;
    qc: string;
    logistics: string;
    cost: string;
  };
  progress: {
    done: number;
    qc: number;
  };
  workPackages: {
    id: string;
    code: string;
    name: string;
    zone: string;
    scope: string;
    target: number;
    unit: string;
    weight: number;
    siteStatus: string;
    crew: string;
    crewContact: string;
    progress: {
      donePct: number;
      qcPct: number;
      receivedGood: number;
      damaged: number;
      missing: number;
    };
  }[];
  attentionCount: number;
  daysRemaining: number;
  trips: {
    id: string;
    destination: string;
    vehicle: string;
    driver: string;
    eta: string;
    status: string;
    qty: number;
    good: number;
    damaged: number;
    missing: number;
  }[];
  tasks: {
    id: string;
    code: string;
    name: string;
    packageId: string;
    stepIndex: number;
    duration: number;
    predecessor: string;
    responsible: string;
    criteria: string;
    status: string;
  }[];
  invoices: {
    id: string;
    title: string;
    amount: number;
    paid: number;
    due: string;
    status: string;
  }[];

}

interface ProjectDetailClientViewProps {
  project: ProjectDetailData;
  planningProject: SerializedProject | null;
  materialsOverview: ProjectMaterialOverview;
  transportTrips: TripDetailData[];
  installationData: InstallationTimelineData;
  financeData: ProjectFinanceData;
  documentsData: ProjectDocumentsData;
  photosData: ProjectPhotosData;
  historyData: ProjectHistoryData;
  initialTab?: string;
}

export function ProjectDetailClientView({
  project,
  planningProject,
  materialsOverview,
  transportTrips,
  installationData,
  financeData,
  documentsData,
  photosData,
  historyData,
  initialTab = "overview",
}: ProjectDetailClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // 11 Tabs definition matching website-demo exactly
  const tabs = [
    { id: "overview", label: "ภาพรวม", icon: FolderKanban },
    { id: "planning", label: "แผนงาน", icon: ListTodo },
    { id: "calendar", label: "ปฏิทิน", icon: Calendar },
    { id: "details", label: "รายละเอียด", icon: FileText },
    { id: "materials", label: "วัสดุและคลัง", icon: Warehouse },
    { id: "transport", label: "การขนส่ง & ตรวจรับ", icon: Truck },
    { id: "installation", label: "การติดตั้ง & QC", icon: ShieldCheck },
    { id: "costs", label: "งบประมาณ ต้นทุน", icon: Wallet },
    { id: "documents", label: "เอกสาร", icon: FileCheck },
    { id: "photos", label: "รูปภาพโครงการ", icon: ImageIcon },
    { id: "history", label: "ประวัติการดำเนินงาน", icon: History },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update query string without full reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.replaceState({}, "", url.toString());
  };

  const formatMoney = (val?: number) => {
    return Number(val || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status: string) => {
    if (status === "active" || status === "ACTIVE") return <span className="badge green">กำลังดำเนินงาน</span>;
    if (status === "draft" || status === "DRAFT") return <span className="badge gray">ร่าง</span>;
    if (status === "closed" || status === "CLOSED") return <span className="badge purple">เสร็จสิ้น</span>;
    if (status === "late") return <span className="badge red">ล่าช้า</span>;
    return <span className="badge orange">รอเริ่ม</span>;
  };

  return (
    <div className="project-detail-page">
      {/* Page Heading matching website-demo */}
      <div className="page-heading">
        <div className="heading-text">
          <div className="flex items-center gap-3">
            <h1>{project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <p>
            {project.code} · {project.clientName} · {project.startDate} – {project.targetDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="text-xs font-semibold text-[#596780] hover:text-[#0D255B] px-3.5 py-2 rounded-lg border border-[#E4EAF4] bg-white hover:bg-[#F5F8FC] transition-colors"
          >
            ← กลับรายการโครงการ
          </Link>
        </div>
      </div>

      {/* 11 Navigation Tabs matching website-demo */}
      <nav className="project-tabs" aria-label="ส่วนข้อมูลโครงการ">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={isActive ? "active" : ""}
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleTabChange(tab.id)}
            >
              <IconComp className="icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      <div className="project-tab-panel">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW (ภาพรวม) */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 4 Top KPI Cards with Wave Patterns */}
            <div className="overview-kpis">
              {/* KPI 1: ความก้าวหน้างาน */}
              <div className="card kpi pd-kpi blue">
                <span className="symbol pd-kpi-icon">
                  <BarChart3 className="icon" />
                </span>
                <div className="pd-kpi-text">
                  <b className="label">ความก้าวหน้างาน</b>
                  <strong className="value">{project.progress.done}%</strong>
                  <small>ทำแล้วตามปริมาณงาน</small>
                </div>
                <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
                </svg>
              </div>

              {/* KPI 2: ผลงานผ่าน QC */}
              <div className="card kpi pd-kpi green">
                <span className="symbol pd-kpi-icon">
                  <ShieldCheck className="icon" />
                </span>
                <div className="pd-kpi-text">
                  <b className="label">ผลงานผ่าน QC</b>
                  <strong className="value">{project.progress.qc}%</strong>
                  <small>ตรวจรับและยืนยันแล้ว</small>
                </div>
                <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
                </svg>
              </div>

              {/* KPI 3: ระยะเวลาคงเหลือ */}
              <div className="card kpi pd-kpi purple">
                <span className="symbol pd-kpi-icon">
                  <Calendar className="icon" />
                </span>
                <div className="pd-kpi-text">
                  <b className="label">ระยะเวลาคงเหลือ</b>
                  <strong className="value">{project.daysRemaining} วัน</strong>
                  <small>กำหนดเสร็จ {project.targetDate}</small>
                </div>
                <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
                </svg>
              </div>

              {/* KPI 4: ต้องดำเนินการ */}
              <div className="card kpi pd-kpi orange">
                <span className="symbol pd-kpi-icon">
                  <AlertTriangle className="icon" />
                </span>
                <div className="pd-kpi-text">
                  <b className="label">ต้องดำเนินการ</b>
                  <strong className="value">{project.attentionCount} เรื่อง</strong>
                  <small>งานรออนุมัติและข้อบกพร่อง</small>
                </div>
                <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
                </svg>
              </div>
            </div>

            {/* Grid 1: ข้อมูลโครงการ + ผู้รับผิดชอบหลัก (6 ฝ่ายงาน 2 คอลัมน์) */}
            <div className="detail-grid">
              {/* Card 1: ข้อมูลโครงการ */}
              <div className="detail-card">
                <h2>ข้อมูลโครงการ</h2>
                <p className="section-caption">ข้อมูลหลักจากสัญญาและการตั้งค่าโครงการ</p>

                <div className="data-grid">
                  <div className="data-col">
                    <h3>สัญญาและลูกค้า</h3>
                    <div className="data-line">
                      <span>เลขที่โครงการ</span>
                      <b className="font-bold">{project.code}</b>
                    </div>
                    <div className="data-line">
                      <span>เลขที่สัญญา / PO</span>
                      <b>{project.contractNo || "—"}</b>
                    </div>
                    <div className="data-line">
                      <span>ผู้ว่าจ้าง</span>
                      <b>{project.clientName}</b>
                    </div>
                    <div className="data-line">
                      <span>มูลค่าสัญญา</span>
                      <b className="text-[#075dd8] text-[16px] font-bold">{formatMoney(project.contractValue)} บาท</b>
                    </div>
                  </div>

                  <div className="data-col">
                    <h3>สถานที่และระยะเวลา</h3>
                    <div className="data-line">
                      <span>เริ่ม–สิ้นสุด</span>
                      <b>{project.startDate} – {project.targetDate}</b>
                    </div>
                    <div className="data-line">
                      <span>ประเภทงาน</span>
                      <b>{project.workTypeLabel}</b>
                    </div>
                    <div className="data-line">
                      <span>สถานที่</span>
                      <b>{project.siteAddress || "—"}</b>
                    </div>
                    <div className="data-line">
                      <span>จุดลงวัสดุ</span>
                      <b>{project.stagingArea || "Staging Area 1 · โซน A"}</b>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: ผู้รับผิดชอบหลัก (ฝ่ายงาน 6 บทบาท - 2 คอลัมน์) */}
              <div className="detail-card">
                <h2>ผู้รับผิดชอบหลัก</h2>
                <p className="section-caption">ทีมงานประจำโครงการและช่องทางประสานงาน</p>

                <div className="personnel-grid">
                  <div className="person-item">
                    <span className="person-avatar">
                      <User className="icon" />
                    </span>
                    <div className="person-info">
                      <small>ผู้จัดการโครงการ (PM)</small>
                      <b>{project.personnel.pm || "ยังไม่ระบุ"}</b>
                    </div>
                  </div>

                  <div className="person-item">
                    <span className="person-avatar">
                      <User className="icon" />
                    </span>
                    <div className="person-info">
                      <small>วิศวกรโครงการ</small>
                      <b>{project.personnel.engineer || "ยังไม่ระบุ"}</b>
                    </div>
                  </div>

                  <div className="person-item">
                    <span className="person-avatar">
                      <User className="icon" />
                    </span>
                    <div className="person-info">
                      <small>วิศวกรหน้างาน</small>
                      <b>{project.personnel.site || "ยังไม่ระบุ"}</b>
                    </div>
                  </div>

                  <div className="person-item">
                    <span className="person-avatar">
                      <User className="icon" />
                    </span>
                    <div className="person-info">
                      <small>ผู้ตรวจคุณภาพ (QC)</small>
                      <b>{project.personnel.qc || "ยังไม่ระบุ"}</b>
                    </div>
                  </div>

                  <div className="person-item">
                    <span className="person-avatar">
                      <User className="icon" />
                    </span>
                    <div className="person-info">
                      <small>ผู้ประสานงานคลังและขนส่ง</small>
                      <b>{project.personnel.logistics || "ยังไม่ระบุ"}</b>
                    </div>
                  </div>

                  <div className="person-item">
                    <span className="person-avatar">
                      <User className="icon" />
                    </span>
                    <div className="person-info">
                      <small>ผู้ควบคุมต้นทุน</small>
                      <b>{project.personnel.cost || "ยังไม่ระบุ"}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: ชุดงานและความก้าวหน้า + รายการที่ต้องดำเนินการ */}
            <div className="detail-grid grid-overview-work">
              {/* Card 3: ชุดงานและความก้าวหน้า */}
              <div className="detail-card">
                <h2>ชุดงานและความก้าวหน้า</h2>
                <p className="section-caption">ความก้าวหน้ารวมใช้ผลงานผ่าน QC ถ่วงน้ำหนักตามชุดงาน</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e0e9f5] text-[#64748b]">
                        <th className="py-3 px-3">ชุดงาน / พื้นที่</th>
                        <th className="py-3 px-3 min-w-[220px]">ทำแล้ว</th>
                        <th className="py-3 px-3 min-w-[220px]">ผ่าน QC</th>
                        <th className="py-3 px-3">สถานะ</th>
                        <th className="py-3 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {project.workPackages.map((wp) => (
                        <tr key={wp.id} className="hover:bg-[#f8fafc]">
                          <td className="py-3.5 px-3">
                            <strong className="text-[#0f2b5c] block">{wp.code || wp.id}</strong>
                            <small className="text-[#64748b] block mt-0.5">
                              {wp.name} • {formatMoney(wp.target)} {wp.unit}
                            </small>
                          </td>
                          <td className="py-3.5 px-3 min-w-[220px]">
                            <StepProgressBar
                              percent={wp.progress.donePct}
                              variant="blue"
                              height={13}
                            />
                          </td>
                          <td className="py-3.5 px-3 min-w-[220px]">
                            <StepProgressBar
                              percent={wp.progress.qcPct}
                              variant="teal"
                              height={13}
                            />
                          </td>
                          <td className="py-3 px-3">
                            {wp.progress.qcPct === 100 ? (
                              <span className="badge green">เสร็จแล้ว</span>
                            ) : (
                              <span className="badge blue">กำลังดำเนินงาน</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/installation?project=${project.id}&package=${wp.id}`}
                              className="text-[#075dd8] font-bold hover:underline"
                            >
                              เปิดงาน →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 4: รายการที่ต้องดำเนินการ (Timeline รูปแบบตามไฟล์แนบ) */}
              <div className="detail-card">
                <h2>รายการที่ต้องดำเนินการ</h2>

                <div className="action-timeline">
                  {/* รายการที่ 1 */}
                  <div className="action-timeline-item">
                    <div className="action-timeline-marker">
                      <div className="action-timeline-halo">
                        <div className="action-timeline-dot" />
                      </div>
                    </div>
                    <div className="action-timeline-content">
                      <h3 className="action-timeline-title">วัสดุและเที่ยวขนส่ง</h3>
                      <p className="action-timeline-desc">ตรวจยอดจัดสรรและกำหนดถึงหน้างาน</p>
                      <Link
                        href={`/transport?project=${project.id}`}
                        className="action-timeline-link"
                      >
                        <span>ติดตามการขนส่ง</span>
                        <span className="arrow" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>

                  {/* รายการที่ 2 */}
                  <div className="action-timeline-item">
                    <div className="action-timeline-marker">
                      <div className="action-timeline-halo">
                        <div className="action-timeline-dot" />
                      </div>
                    </div>
                    <div className="action-timeline-content">
                      <h3 className="action-timeline-title">ตรวจรับและรับรองผลงาน</h3>
                      <p className="action-timeline-desc">พิจารณา IR และติดตามงานแก้ไข</p>
                      <Link
                        href={`/installation?project=${project.id}`}
                        className="action-timeline-link"
                      >
                        <span>ดูงานตรวจ QC</span>
                        <span className="arrow" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>

                  {/* รายการที่ 3 */}
                  <div className="action-timeline-item last-item">
                    <div className="action-timeline-marker">
                      <div className="action-timeline-halo">
                        <div className="action-timeline-dot" />
                      </div>
                    </div>
                    <div className="action-timeline-content">
                      <h3 className="action-timeline-title">เผยแพร่ข้อมูลเจ้าของ</h3>
                      <p className="action-timeline-desc">ตรวจทานฉบับที่จะเผยแพร่</p>
                      <Link
                        href={`/reports?project=${project.id}`}
                        className="action-timeline-link"
                      >
                        <span>รายงานโครงการ</span>
                        <span className="arrow" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Grid (4 กล่อง) */}
            <div className="detail-card">
              <h2>ดูรายละเอียดเพิ่มเติม</h2>
              <div className="grid four quick mt-4">
                <button
                  type="button"
                  className="quick-link text-left cursor-pointer"
                  onClick={() => handleTabChange("planning")}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="icon" />
                    <span>แผนงานและกำหนดการ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                </button>

                <button
                  type="button"
                  className="quick-link text-left cursor-pointer"
                  onClick={() => handleTabChange("materials")}
                >
                  <div className="flex items-center gap-3">
                    <Package className="icon" />
                    <span>วัสดุและขนส่ง</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                </button>

                <button
                  type="button"
                  className="quick-link text-left cursor-pointer"
                  onClick={() => handleTabChange("installation")}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="icon" />
                    <span>ติดตั้งและตรวจ QC</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                </button>

                <button
                  type="button"
                  className="quick-link text-left cursor-pointer"
                  onClick={() => handleTabChange("documents")}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="icon" />
                    <span>เอกสารและรูปภาพ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PLANNING (แผนงาน) */}
        {/* ========================================================= */}
        {activeTab === "planning" && (
          <div className="min-w-0" data-project-gantt={project.id}>
            {planningProject && planningProject.packages.some((pkg) => pkg.tasks.length > 0) ? (
              <GanttChart
                key={planningProject.id}
                project={planningProject}
                onRefresh={() => router.refresh()}
              />
            ) : (
              <div className="detail-card text-center py-12">
                <h2>ยังไม่มีแผนงานของโครงการนี้</h2>
                <p className="section-caption">เพิ่มกิจกรรมในแผนงานเพื่อแสดง Gantt Plan</p>
                <Link
                  href={`/planning?projectId=${project.id}`}
                  className="inline-block mt-4 text-sm font-semibold text-[#075dd8] hover:underline"
                >
                  เปิดแผนงานของโครงการ
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CALENDAR (ปฏิทิน) */}
        {/* ========================================================= */}
        {activeTab === "calendar" && (
          <div className="min-w-0" data-project-calendar={project.id}>
            {planningProject ? (
              <WorkCalendar
                key={planningProject.id}
                project={planningProject}
                onRefresh={() => router.refresh()}
              />
            ) : (
              <div className="detail-card text-center py-12">
                <h2>ไม่พบข้อมูลปฏิทินของโครงการนี้</h2>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DETAILS (รายละเอียด) */}
        {/* ========================================================= */}
        {activeTab === "details" && (
          <div className="project-details-content space-y-6">
            <div className="notice">
              ข้อมูลจากโครงการและรายการที่บันทึกในระบบ • ช่องที่ยังไม่มีข้อมูลแสดง “ยังไม่ระบุ”
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: ข้อมูลทั่วไปของโครงการ */}
              <section className="project-detail-section">
                <h2>
                  <FolderKanban className="icon" />
                  <span>ข้อมูลทั่วไปของโครงการ</span>
                </h2>
                <dl className="project-detail-fields">
                  <div>
                    <dt>รหัสโครงการ</dt>
                    <dd>{project.code}</dd>
                  </div>
                  <div>
                    <dt>ชื่อโครงการ</dt>
                    <dd>{project.name}</dd>
                  </div>
                  <div>
                    <dt>ผู้ว่าจ้าง / ลูกค้า</dt>
                    <dd>{project.clientName}</dd>
                  </div>
                  <div>
                    <dt>หมวดหมู่งาน</dt>
                    <dd>{project.workTypeLabel}</dd>
                  </div>
                  <div>
                    <dt>สถานะโครงการ</dt>
                    <dd>{getStatusBadge(project.status)}</dd>
                  </div>
                  <div>
                    <dt>สถานที่ก่อสร้าง / ไซต์งาน</dt>
                    <dd>{project.siteAddress || "นิคมอุตสาหกรรมบางปะอิน"}</dd>
                  </div>
                </dl>
              </section>

              {/* Section 2: สัญญาและระยะเวลา */}
              <section className="project-detail-section">
                <h2>
                  <FileText className="icon" />
                  <span>สัญญาและระยะเวลา</span>
                </h2>
                <dl className="project-detail-fields">
                  <div>
                    <dt>เลขที่สัญญา / PO</dt>
                    <dd>{project.contractNo || "PO-2026-08892"}</dd>
                  </div>
                  <div>
                    <dt>ประเภทสัญญา</dt>
                    <dd>{project.contractType || "จัดหาพร้อมติดตั้ง (Turnkey)"}</dd>
                  </div>
                  <div>
                    <dt>วันที่เริ่มสัญญา</dt>
                    <dd>{project.startDate}</dd>
                  </div>
                  <div>
                    <dt>เป้าหมายส่งมอบ</dt>
                    <dd>{project.targetDate}</dd>
                  </div>
                  <div>
                    <dt>ระยะเวลาตามสัญญา</dt>
                    <dd>31 วัน</dd>
                  </div>
                  <div>
                    <dt>เงื่อนไขการชำระเงิน</dt>
                    <dd>{project.paymentTerms || "แบ่งงวดตามผลงาน QC 4 งวด"}</dd>
                  </div>
                </dl>
              </section>

              {/* Section 3: งบประมาณและต้นทุน */}
              <section className="project-detail-section">
                <h2>
                  <Wallet className="icon" />
                  <span>งบประมาณและต้นทุน</span>
                </h2>
                <dl className="project-detail-fields">
                  <div>
                    <dt>มูลค่าโครงการ</dt>
                    <dd>{formatMoney(project.contractValue)} บาท</dd>
                  </div>
                  <div>
                    <dt>งบประมาณปัจจุบัน</dt>
                    <dd>{formatMoney(project.budget)} บาท</dd>
                  </div>
                  <div>
                    <dt>ต้นทุนที่บันทึก</dt>
                    <dd>{formatMoney(project.actualCost)} บาท</dd>
                  </div>
                  <div>
                    <dt>งบประมาณคงเหลือ</dt>
                    <dd>{formatMoney(project.budget - project.actualCost)} บาท</dd>
                  </div>
                  <div>
                    <dt>จำนวนรายการต้นทุน</dt>
                    <dd>1 รายการ</dd>
                  </div>
                  <div>
                    <dt>งวดเรียกเก็บ</dt>
                    <dd>2 งวด</dd>
                  </div>
                </dl>
              </section>

              {/* Section 4: พื้นที่และการเข้าทำงาน */}
              <section className="project-detail-section">
                <h2>
                  <Warehouse className="icon" />
                  <span>พื้นที่และการเข้าทำงาน</span>
                </h2>
                <dl className="project-detail-fields">
                  <div>
                    <dt>สถานที่ก่อสร้าง</dt>
                    <dd>{project.siteAddress || "นิคมอุตสาหกรรมบางปะอิน"}</dd>
                  </div>
                  <div>
                    <dt>จุดขนถ่ายและลงกองวัสดุ</dt>
                    <dd>{project.stagingArea || "Staging Area 1 · โซน A"}</dd>
                  </div>
                  <div>
                    <dt>เส้นทางเข้า–ออกรถขนส่ง</dt>
                    <dd>{project.accessRoute || "ประตู 2 ฝั่งทิศตะวันออก รถเทรลเลอร์ 10 ล้อเข้าได้"}</dd>
                  </div>
                  <div>
                    <dt>เงื่อนไขพื้นที่ก่อนเริ่มติดตั้ง</dt>
                    <dd>{project.readiness || "ปรับระดับดินเรียบร้อย มีหมุดแนวเขตชัดเจน"}</dd>
                  </div>
                  <div>
                    <dt>จำนวนพื้นที่ / ชุดงาน</dt>
                    <dd>{project.workPackages.length} ชุดงาน</dd>
                  </div>
                  <div>
                    <dt>น้ำหนักชุดงานรวม</dt>
                    <dd>100%</dd>
                  </div>
                </dl>
              </section>
            </div>

            {/* Section 5: ทีมงานและผู้รับผิดชอบ */}
            <section className="project-detail-section">
              <h2>
                <User className="icon" />
                <span>ทีมงานและผู้รับผิดชอบ</span>
              </h2>
              <p className="section-caption">ระบุบุคลากรหลักแยกตามบทบาท และทีมติดตั้งแยกตามชุดงาน</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <dl className="project-detail-fields">
                  <div>
                    <dt>ผู้จัดการโครงการ (PM)</dt>
                    <dd>{project.personnel.pm || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>วิศวกรโครงการ</dt>
                    <dd>{project.personnel.engineer || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>วิศวกรหน้างาน</dt>
                    <dd>{project.personnel.site || "ยังไม่ระบุ"}</dd>
                  </div>
                </dl>
                <dl className="project-detail-fields">
                  <div>
                    <dt>ผู้ตรวจคุณภาพ (QC)</dt>
                    <dd>{project.personnel.qc || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>ผู้ประสานงานคลังและขนส่ง</dt>
                    <dd>{project.personnel.logistics || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>ผู้ควบคุมต้นทุน</dt>
                    <dd>{project.personnel.cost || "ยังไม่ระบุ"}</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Section 6: ชุดงาน พื้นที่ และขอบเขตงาน */}
            <section className="project-detail-section">
              <h2>
                <FolderKanban className="icon" />
                <span>ชุดงาน พื้นที่ และขอบเขตงาน</span>
              </h2>
              <p className="section-caption">
                {project.workPackages.length} ชุดงาน • ความก้าวหน้าผ่าน QC ถ่วงน้ำหนักตามชุดงาน
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.workPackages.map((wp) => (
                  <article key={wp.id} className="detail-package">
                    <h3>{wp.name}</h3>
                    <dl className="project-detail-fields">
                      <div>
                        <dt>รหัสชุดงาน</dt>
                        <dd>{wp.code || wp.id}</dd>
                      </div>
                      <div>
                        <dt>โซน / พื้นที่</dt>
                        <dd>{wp.zone || "พื้นที่หลัก"}</dd>
                      </div>
                      <div>
                        <dt>ปริมาณเป้าหมาย</dt>
                        <dd>{formatMoney(wp.target)} {wp.unit}</dd>
                      </div>
                      <div>
                        <dt>น้ำหนักความก้าวหน้า</dt>
                        <dd>{wp.weight}%</dd>
                      </div>
                      <div>
                        <dt>ทีมช่างติดตั้ง</dt>
                        <dd>{wp.crew || "ทีมช่าง 1 (รั้วสำเร็จรูป)"}</dd>
                      </div>
                    </dl>

                    <div className="detail-package-progress">
                      <div>
                        <small className="block mb-1.5 text-xs text-[#64748b] font-medium">ทำแล้ว</small>
                        <StepProgressBar
                          percent={wp.progress.donePct}
                          variant="blue"
                          height={12}
                        />
                      </div>
                      <div>
                        <small className="block mb-1.5 text-xs text-[#64748b] font-medium">ผ่าน QC</small>
                        <StepProgressBar
                          percent={wp.progress.qcPct}
                          variant="teal"
                          height={12}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/installation?project=${project.id}&package=${wp.id}`}
                      className="text-[#075dd8] font-bold text-xs hover:underline inline-block mt-2"
                    >
                      ดูงานในชุดนี้ →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MATERIALS (วัสดุและคลัง) */}
        {/* ========================================================= */}
        {activeTab === "materials" && (
          <ProjectMaterialsView projectId={project.id} overview={materialsOverview} />
        )}

        {/* ========================================================= */}
        {/* TAB 6: TRANSPORT (การขนส่ง & ตรวจรับ) */}
        {/* ========================================================= */}
        {activeTab === "transport" && (
          <TransportClientView
            key={project.id}
            embedded
            allProjects={[{ id: project.id, code: project.code, name: project.name }]}
            selectedProjectId={project.id}
            trips={transportTrips}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 7: INSTALLATION (การติดตั้ง & QC) */}
        {/* ========================================================= */}
        {activeTab === "installation" && (
          <InstallationTimeline key={project.id} embedded projectId={project.id} data={installationData} />
        )}

        {/* ========================================================= */}
        {/* TAB 8: COSTS (งบประมาณ ต้นทุน) */}
        {/* ========================================================= */}
        {activeTab === "costs" && (
          <ProjectFinanceView key={project.id} embedded projectId={project.id} data={financeData} />
        )}

        {/* ========================================================= */}
        {/* TAB 9: DOCUMENTS (เอกสาร) */}
        {/* ========================================================= */}
        {activeTab === "documents" && (
          <ProjectDocumentsView key={project.id} data={documentsData} />
        )}

        {/* ========================================================= */}
        {/* TAB 10: PHOTOS (รูปภาพโครงการ) */}
        {/* ========================================================= */}
        {activeTab === "photos" && (
          <ProjectPhotosView key={project.id} data={photosData} />
        )}

        {/* ========================================================= */}
        {/* TAB 11: HISTORY (ประวัติการดำเนินงาน) */}
        {/* ========================================================= */}
        {activeTab === "history" && <ProjectHistoryView key={project.id} data={historyData} />}
      </div>
    </div>
  );
}
