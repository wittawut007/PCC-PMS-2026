"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  BarChart3,
  Clock,
  AlertTriangle,
  Folder,
  Layers,
  CheckCircle2,
  List,
  FileCheck,
  Calendar,
  ArrowRight,
  Plus,
} from "lucide-react";
import "./installation-dashboard.css";

export interface InstallationClientViewProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
    workType: string;
  }>;
  selectedProjectId: string;
  workPackages: Array<{
    id: string;
    code: string;
    name: string;
    zone: string;
    target: number;
    unit: string;
    donePct: number;
    qcPct: number;
    status: string;
  }>;
  stats: {
    progressDone: number;
    progressQc: number;
    pendingGates: number;
    openNcrs: number;
    irTotal: number;
    irPassed: number;
    irPending: number;
    irFailed: number;
  };
  gates: Array<{
    code: string;
    title: string;
    status: "approved" | "pending" | "draft";
    statusLabel: string;
  }>;
  inspections: Array<{
    id: string;
    packageCode: string;
    note: string;
    status: string;
    inspector: string;
    date: string;
  }>;
  ncrs: Array<{
    id: string;
    title: string;
    packageCode: string;
    status: string;
  }>;
}

export function InstallationClientView({
  allProjects,
  selectedProjectId,
  workPackages,
  stats,
  gates,
  inspections,
  ncrs,
}: InstallationClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "all" || !val) {
      router.push("/installation");
    } else {
      router.push(`/installation?projectId=${val}`);
    }
  };

  const selectedProj = allProjects.find((p) => p.id === selectedProjectId);

  const passRatio = stats.irTotal > 0 ? Math.round((stats.irPassed / stats.irTotal) * 100) : 0;
  const waitRatio = stats.irTotal > 0 ? Math.round(((stats.irPassed + stats.irPending) / stats.irTotal) * 100) : 0;

  return (
    <div className="installation-dashboard-page">
      {/* Back to All Projects Banner if a project is selected */}
      {selectedProj && (
        <div className="module-detail-back">
          <button
            type="button"
            onClick={() => router.push("/installation")}
            aria-label="กลับภาพรวมการติดตั้งและตรวจคุณภาพ"
          >
            ← กลับภาพรวมการติดตั้งและตรวจคุณภาพ
          </button>
          <span>{selectedProj.code} · {selectedProj.name}</span>
        </div>
      )}

      {/* 1. Page Heading & Project Scope Selector */}
      <div className="ins-page-heading">
        <div className="heading-text">
          <h1>การติดตั้งและตรวจคุณภาพ</h1>
          <p>
            {selectedProj
              ? `${selectedProj.name} • ${selectedProj.code}`
              : `${allProjects.length} โครงการในขอบเขตของคุณ`}
          </p>
        </div>

        <div className="ins-heading-controls">
          <div className="ins-project-filter">
            <label htmlFor="project-select">
              <Folder className="w-4 h-4 text-[#1675ff]" />
              <span>เลือกโครงการ</span>
            </label>
            <select
              id="project-select"
              value={selectedProjectId || "all"}
              onChange={handleProjectSelect}
              aria-label="เลือกโครงการ"
            >
              <option value="all">
                ทุกโครงการตามสิทธิ์ ({allProjects.length})
              </option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Sub-navigation Tabs */}
      <nav className="installation-tabs" aria-label="ส่วนงานการติดตั้งและ QC">
        <button
          type="button"
          className={`install-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Layers className="w-4 h-4 icon" />
          <span>ภาพรวม</span>
        </button>
        <button
          type="button"
          className={`install-tab ${activeTab === "workflow" ? "active" : ""}`}
          onClick={() => setActiveTab("workflow")}
        >
          <List className="w-4 h-4 icon" />
          <span>Workflow</span>
        </button>
        <button
          type="button"
          className={`install-tab ${activeTab === "gates" ? "active" : ""}`}
          onClick={() => setActiveTab("gates")}
        >
          <FileCheck className="w-4 h-4 icon" />
          <span>จุดอนุมัติ AP</span>
        </button>
        <button
          type="button"
          className={`install-tab ${activeTab === "qc" ? "active" : ""}`}
          onClick={() => setActiveTab("qc")}
        >
          <Shield className="w-4 h-4 icon" />
          <span>รายการตรวจหน้างาน (IR)</span>
        </button>
        <button
          type="button"
          className={`install-tab ${activeTab === "ncr" ? "active" : ""}`}
          onClick={() => setActiveTab("ncr")}
        >
          <AlertTriangle className="w-4 h-4 icon" />
          <span>ข้อบกพร่อง (NCR)</span>
        </button>
      </nav>

      {/* 3. 5 KPI Cards with Waves */}
      <div className="install-metrics">
        {/* KPI 1: ความคืบหน้างานติดตั้งรวม */}
        <div className="card kpi pd-kpi blue">
          <div className="symbol">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ความคืบหน้างานติดตั้งรวม</span>
            <span className="value">{stats.progressDone}%</span>
            <small>ทำแล้วตามปริมาณงาน</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 2: ผลงานผ่าน QC */}
        <div className="card kpi pd-kpi green">
          <div className="symbol">
            <Shield className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ผลงานผ่าน QC</span>
            <span className="value">{stats.progressQc}%</span>
            <small>ผ่านแล้ว · ถ่วงน้ำหนักตามชุดงาน</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 3: จุดอนุมัติรอพิจารณา */}
        <div className="card kpi pd-kpi orange">
          <div className="symbol">
            <Clock className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">จุดอนุมัติรอพิจารณา</span>
            <span className="value">{stats.pendingGates} จุด</span>
            <small>คำขอจุดอนุมัติที่ส่งแล้ว</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 4: NCR ยังไม่ปิด */}
        <div className="card kpi pd-kpi red">
          <div className="symbol">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">NCR ยังไม่ปิด</span>
            <span className="value">{stats.openNcrs} รายการ</span>
            <small>ข้อบกพร่องที่ต้องติดตาม</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 5: เชื่อมโยงภาพรวมโครงการ */}
        <div className="card kpi pd-kpi blue">
          <div className="symbol">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">เชื่อมโยงภาพรวมโครงการ</span>
            <span className="value">{stats.progressQc}%</span>
            <small>ใช้ผลงานผ่าน QC ถ่วงน้ำหนัก</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>
      </div>

      {/* 4. Work Packages List */}
      <div className="install-packages-card">
        <h2>ชุดงานติดตั้ง</h2>
        <div className="space-y-3">
          {workPackages.map((wp) => (
            <div key={wp.id} className="install-package-row">
              <div>
                <strong className="text-[#0c2340] block">{wp.name}</strong>
                <span className="text-xs text-[#627d98]">
                  {wp.code} · เป้าหมาย {wp.target} {wp.unit}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#627d98]">ทำแล้ว</span>
                  <b className="text-[#0c2340]">{wp.donePct}%</b>
                </div>
                <div className="w-full h-2 bg-[#e9f0fa] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1675ff] rounded-full"
                    style={{ width: `${wp.donePct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#627d98]">ผ่าน QC</span>
                  <b className="text-[#087d51]">{wp.qcPct}%</b>
                </div>
                <div className="w-full h-2 bg-[#e9f0fa] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#087d51] rounded-full"
                    style={{ width: `${wp.qcPct}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                    wp.qcPct === 100
                      ? "bg-[#e7f7ee] text-[#087d51]"
                      : "bg-[#eef4ff] text-[#1675ff]"
                  }`}
                >
                  {wp.qcPct === 100 ? "เสร็จสิ้น" : "กำลังดำเนินงาน"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Layout Split: AP Gates, QC Donut Summary, Recent Inspections & Flow */}
      <div className="install-layout">
        {/* Column 1: AP Gates */}
        <div className="install-card">
          <div className="install-card-head">
            <h2>
              <FileCheck className="w-4 h-4 text-[#1675ff]" />
              จุดอนุมัติงาน (AP Gates)
            </h2>
          </div>
          <div className="install-gates">
            {gates.map((g, idx) => (
              <div key={idx} className="install-gate-item">
                <div className="install-gate-left">
                  <span className="install-gate-code">{g.code}</span>
                  <span className="font-semibold text-[#0c2340]">{g.title}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    g.status === "approved"
                      ? "bg-[#e7f7ee] text-[#087d51]"
                      : g.status === "pending"
                      ? "bg-[#fff4e9] text-[#b56b00]"
                      : "bg-[#f0f4fa] text-[#627d98]"
                  }`}
                >
                  {g.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: QC Summary */}
        <div className="install-card">
          <div className="install-card-head">
            <h2>
              <Shield className="w-4 h-4 text-[#087d51]" />
              สรุปคุณภาพ / QC Summary
            </h2>
          </div>
          <div className="install-qc">
            <div
              className="install-ring"
              style={
                {
                  "--pass": `${passRatio}%`,
                  "--wait": `${waitRatio}%`,
                } as React.CSSProperties
              }
            >
              <div>
                <b>{stats.irTotal}</b>
                <small>คำขอตรวจ</small>
              </div>
            </div>

            <div className="install-qc-stats">
              <div className="install-qc-stat-row">
                <span className="flex items-center gap-1.5 text-xs text-[#627d98]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059465]" /> ผ่านครบ
                </span>
                <b>{stats.irPassed} ({passRatio}%)</b>
              </div>
              <div className="install-qc-stat-row">
                <span className="flex items-center gap-1.5 text-xs text-[#627d98]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> รอตรวจ
                </span>
                <b>{stats.irPending} ({stats.irTotal ? Math.round((stats.irPending / stats.irTotal) * 100) : 0}%)</b>
              </div>
              <div className="install-qc-stat-row">
                <span className="flex items-center gap-1.5 text-xs text-[#627d98]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5eaf1]" /> ไม่ผ่าน / แก้ไข
                </span>
                <b>{stats.irFailed} ({stats.irTotal ? Math.round((stats.irFailed / stats.irTotal) * 100) : 0}%)</b>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#edf2f9]">
            <h3 className="text-xs font-bold text-[#0c2340] mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
              งานคุณภาพที่ต้องติดตาม ({ncrs.length} NCR)
            </h3>
            {ncrs.length > 0 ? (
              <div className="space-y-1.5">
                {ncrs.map((ncr) => (
                  <div
                    key={ncr.id}
                    className="flex justify-between items-center text-xs p-2 bg-[#fff8eb] rounded border border-[#fde2b4]"
                  >
                    <span>
                      <b>{ncr.id}</b> · {ncr.title}
                    </span>
                    <span className="text-[10px] text-[#b56b00] font-semibold">
                      {ncr.packageCode}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#627d98]">ไม่มี NCR ค้างในรายการที่เลือก</p>
            )}
          </div>
        </div>

        {/* Column 3: Recent Inspections & Flow */}
        <div className="space-y-4">
          <div className="install-card">
            <div className="install-card-head">
              <h2>
                <CheckCircle2 className="w-4 h-4 text-[#1675ff]" />
                รายการตรวจสอบล่าสุด
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#edf2f9] text-[#627d98]">
                    <th className="py-2">เลขที่</th>
                    <th className="py-2">ชุดงาน</th>
                    <th className="py-2">ผลตรวจ</th>
                    <th className="py-2">ผู้ตรวจ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4fa]">
                  {inspections.slice(0, 4).map((ins) => (
                    <tr key={ins.id}>
                      <td className="py-2 font-bold text-[#1675ff]">{ins.id}</td>
                      <td className="py-2">{ins.packageCode}</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            ins.status === "APPROVED"
                              ? "bg-[#e7f7ee] text-[#087d51]"
                              : "bg-[#fff4e9] text-[#b56b00]"
                          }`}
                        >
                          {ins.status === "APPROVED" ? "ผ่าน" : "รอตรวจ"}
                        </span>
                      </td>
                      <td className="py-2 text-[#627d98]">{ins.inspector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="install-card">
            <div className="install-card-head">
              <h2>การเชื่อมโยงภาพรวมโครงการ</h2>
            </div>
            <div className="install-flow">
              <div className="install-flow-item">
                <small>วัสดุที่รับแล้ว</small>
                <b>100%</b>
              </div>
              <span className="text-[#a0aec0]">→</span>
              <div className="install-flow-item">
                <small>งานติดตั้งสะสม</small>
                <b>{stats.progressDone}%</b>
              </div>
              <span className="text-[#a0aec0]">→</span>
              <div className="install-flow-item">
                <small>ผลงานผ่าน QC</small>
                <b className="text-[#087d51]">{stats.progressQc}%</b>
              </div>
              <span className="text-[#a0aec0]">→</span>
              <div className="install-flow-item">
                <small>ภาพรวมโครงการ</small>
                <b className="text-[#087d51]">{stats.progressQc}%</b>
              </div>
            </div>
            <p className="text-[11px] text-[#7185a4]">
              ภาพรวมคำนวณจาก % QC × น้ำหนักแต่ละชุดงาน ÷ น้ำหนักรวม
            </p>
          </div>
        </div>
      </div>

      {/* 6. Quick Actions Bar */}
      <div className="install-quick-actions">
        <b>การดำเนินงานด่วน:</b>
        <Link href={`/daily?projectId=${selectedProjectId}`} className="install-quick-btn">
          <Calendar className="w-3.5 h-3.5" />
          บันทึกผลงานประจำวัน
        </Link>
        <Link href={`/installation?tab=qc&projectId=${selectedProjectId}`} className="install-quick-btn">
          <Shield className="w-3.5 h-3.5" />
          บันทึกตรวจ IR / QC
        </Link>
        <Link href={`/installation?tab=ncr&projectId=${selectedProjectId}`} className="install-quick-btn">
          <AlertTriangle className="w-3.5 h-3.5" />
          จัดการ NCR
        </Link>
        <Link href={`/planning?projectId=${selectedProjectId}`} className="install-quick-btn">
          <List className="w-3.5 h-3.5" />
          ดู Workflow
        </Link>
      </div>
    </div>
  );
}
