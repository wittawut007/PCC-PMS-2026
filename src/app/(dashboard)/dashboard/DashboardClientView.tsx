"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Folder,
  BarChart3,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  Wallet,
  History,
  MapPin,
  ExternalLink,
} from "lucide-react";
import "./home-dashboard.css";

export interface ProjectDashboardItem {
  id: string;
  code: string;
  name: string;
  client: string;
  status: "active" | "draft" | "closed" | "waiting" | "late";
  start: string;
  end: string;
  budget: number;
  value: number;
  cost: number;
  progress: {
    done: number;
    qc: number;
  };
}

export interface TripDashboardItem {
  id: string;
  projectId: string;
  projectName: string;
  eta: string;
  status: "planned" | "accepted" | "ready" | "departed" | "arrived" | "delivered";
}

export interface ActivityDashboardItem {
  id: string;
  projectId: string;
  projectName: string;
  kind: string;
  title: string;
  createdAt: string;
  href: string;
}

interface DashboardClientViewProps {
  initialProjects: ProjectDashboardItem[];
  initialTrips: TripDashboardItem[];
  initialActivities: ActivityDashboardItem[];
  todayStr?: string;
  formattedTodayThai?: string;
}

export function DashboardClientView({
  initialProjects,
  initialTrips,
  initialActivities,
  todayStr = "2026-11-05",
  formattedTodayThai = "5 พ.ย. 2569",
}: DashboardClientViewProps) {
  const [period, setPeriod] = useState<"year" | "month" | "all">("year");

  // Determine date bounds based on selected period
  const [periodStart, periodEnd] = useMemo(() => {
    const year = todayStr.slice(0, 4);
    const month = todayStr.slice(0, 7);
    if (period === "year") return [`${year}-01-01`, `${year}-12-31`];
    if (period === "month") {
      const [y, m] = month.split("-").map(Number);
      const endDay = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
      return [`${month}-01`, endDay];
    }
    return ["", ""];
  }, [period, todayStr]);

  // Filter projects by period bounds
  const visibleProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      if (periodStart && p.end < periodStart) return false;
      if (periodEnd && p.start > periodEnd) return false;
      return true;
    });
  }, [initialProjects, periodStart, periodEnd]);

  const total = visibleProjects.length;

  // Status breakdown
  const statusCounts = useMemo(() => {
    let active = 0;
    let waiting = 0;
    let late = 0;
    let closed = 0;

    visibleProjects.forEach((p) => {
      if (p.status === "closed") {
        closed++;
      } else if (p.end && p.end < todayStr && p.progress.qc < 100) {
        // Late if past end date and not fully QC approved
        late++;
      } else if (p.status === "active") {
        active++;
      } else {
        waiting++;
      }
    });

    return { active, waiting, late, closed };
  }, [visibleProjects, todayStr]);

  // Donut chart segments
  const statusRows = [
    { label: "กำลังดำเนินงาน", count: statusCounts.active, color: "#16b77b" },
    { label: "รอเริ่ม / รออนุมัติ", count: statusCounts.waiting, color: "#bac9df" },
    { label: "ล่าช้า", count: statusCounts.late, color: "#f34b63" },
    { label: "เสร็จสิ้น", count: statusCounts.closed, color: "#8f73eb" },
  ];

  let donutOffset = 0;
  const donutGradient = statusRows
    .map((r) => {
      const begin = donutOffset;
      donutOffset += total > 0 ? (r.count / total) * 100 : 0;
      return `${r.color} ${begin}% ${donutOffset}%`;
    })
    .join(", ");

  // Progress averages
  const avgQc = useMemo(() => {
    if (!total) return 0;
    const sum = visibleProjects.reduce((acc, p) => acc + (p.progress.qc || 0), 0);
    return Math.round((sum / total) * 10) / 10;
  }, [visibleProjects, total]);

  const avgDone = useMemo(() => {
    if (!total) return 0;
    const sum = visibleProjects.reduce((acc, p) => acc + (p.progress.done || 0), 0);
    return Math.round((sum / total) * 10) / 10;
  }, [visibleProjects, total]);

  // Tasks counts: in demo, completed: 40, active: 4, pending: 39
  const taskCounts = { completed: 40, active: 4, pending: 39 };

  // Financial calculations
  const totalBudget = useMemo(
    () => visibleProjects.reduce((acc, p) => acc + (p.budget || 0), 0),
    [visibleProjects]
  );
  const totalCost = useMemo(
    () => visibleProjects.reduce((acc, p) => acc + (p.cost || 0), 0),
    [visibleProjects]
  );
  const totalValue = useMemo(
    () => visibleProjects.reduce((acc, p) => acc + (p.value || 0), 0),
    [visibleProjects]
  );

  const remaining = totalBudget - totalCost;
  const usedPct = totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0;
  const remainingPct = Math.max(0, 100 - usedPct);

  // Material summary
  const materialCount = 4;
  const materialStocked = 0;
  const materialPending = 4;
  const materialShortage = 0;

  // Transport summary
  const todayTripsCount = 0;
  const thisWeekTripsCount = 0;
  const transportingCount = 0;
  const plannedCount = 3;
  const deliveredCount = 4;

  // Installation & QC
  const workingPackagesCount = 3;
  const qcApprovedCount = 1;
  const qcPendingCount = 0;
  const openNcrCount = 0;

  // Format date helper
  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    });
  };

  const getStatusBadge = (p: ProjectDashboardItem) => {
    const isLate = p.status !== "closed" && p.end && p.end < todayStr && p.progress.qc < 100;
    if (isLate) return <span className="badge red">ล่าช้า</span>;
    if (p.status === "active") return <span className="badge green">กำลังดำเนินงาน</span>;
    if (p.status === "draft") return <span className="badge gray">ร่าง</span>;
    if (p.status === "closed") return <span className="badge purple">เสร็จสิ้น</span>;
    return <span className="badge orange">รอเริ่ม</span>;
  };

  const getTripBadge = (status: TripDashboardItem["status"]) => {
    if (status === "delivered") return <span className="badge green">ส่งมอบแล้ว</span>;
    if (status === "departed") return <span className="badge blue">ออกจากต้นทาง</span>;
    if (status === "arrived") return <span className="badge green">ถึงหน้างาน</span>;
    if (status === "ready") return <span className="badge orange">พร้อมออก</span>;
    if (status === "accepted") return <span className="badge blue">รับเที่ยวแล้ว</span>;
    return <span className="badge gray">รอยืนยันเที่ยว</span>;
  };

  return (
    <section className="home-dashboard">
      {/* 1. Page Heading */}
      <div className="page-heading hd-heading">
        <div className="heading-text">
          <h1>ภาพรวมระบบ</h1>
          <p>ติดตามสถานะโครงการและการดำเนินงานทั้งหมดในที่เดียว</p>
        </div>

        <div className="hd-heading-actions">
          <small className="hd-updated">แสดงผล ณ {formattedTodayThai} 00:15</small>
          <label
            className="hd-period-control"
            title="เลือกช่วงดำเนินงานโครงการ ข้อมูลสรุปเป็นยอดสะสมปัจจุบัน"
          >
            <Calendar className="icon" />
            <select
              id="home-period"
              aria-label="ช่วงเวลาโครงการ"
              value={period}
              onChange={(e) => setPeriod(e.target.value as "year" | "month" | "all")}
            >
              <option value="year">ปี 2569 (1 ม.ค. – 31 ธ.ค.)</option>
              <option value="month">เดือนปัจจุบัน</option>
              <option value="all">ทุกช่วงเวลา</option>
            </select>
          </label>
        </div>
      </div>

      {/* 2. Top 6 KPI Cards with Wave Patterns */}
      <div className="hd-kpis">
        {/* KPI 1: โครงการทั้งหมด */}
        <div className="card kpi pd-kpi blue">
          <span className="symbol pd-kpi-icon">
            <Folder className="icon" />
          </span>
          <div className="pd-kpi-text">
            <b className="label">โครงการทั้งหมด</b>
            <strong className="value">{total}</strong>
            <small>ในขอบเขตที่เลือก</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 2: กำลังดำเนินงาน */}
        <div className="card kpi pd-kpi green">
          <span className="symbol pd-kpi-icon">
            <BarChart3 className="icon" />
          </span>
          <div className="pd-kpi-text">
            <b className="label">กำลังดำเนินงาน</b>
            <strong className="value">{statusCounts.active}</strong>
            <small>โครงการที่ยังไม่เกินกำหนด</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 3: รอเริ่มงาน */}
        <div className="card kpi pd-kpi orange">
          <span className="symbol pd-kpi-icon">
            <Clock className="icon" />
          </span>
          <div className="pd-kpi-text">
            <b className="label">รอเริ่มงาน</b>
            <strong className="value">{statusCounts.waiting}</strong>
            <small>ร่าง / รออนุมัติเปิดโครงการ</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 4: ล่าช้า */}
        <div className="card kpi pd-kpi red">
          <span className="symbol pd-kpi-icon">
            <AlertTriangle className="icon" />
          </span>
          <div className="pd-kpi-text">
            <b className="label">ล่าช้า</b>
            <strong className="value">{statusCounts.late}</strong>
            <small>เกินกำหนดและ QC ยังไม่ครบ</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 5: รายการวัสดุ */}
        <div className="card kpi pd-kpi blue">
          <span className="symbol pd-kpi-icon">
            <Package className="icon" />
          </span>
          <div className="pd-kpi-text">
            <b className="label">รายการวัสดุ</b>
            <strong className="value">{materialCount}</strong>
            <small>วัสดุตาม BOM และคำขอในระบบ</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 6: อยู่ระหว่างขนส่ง */}
        <div className="card kpi pd-kpi purple">
          <span className="symbol pd-kpi-icon">
            <Truck className="icon" />
          </span>
          <div className="pd-kpi-text">
            <b className="label">อยู่ระหว่างขนส่ง</b>
            <strong className="value">{transportingCount}</strong>
            <small>เที่ยวที่ออกจากต้นทางแล้ว</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>
      </div>

      {/* 3. Row 1: Status Donut, Overall Progress, Total Budget */}
      <div className="hd-grid hd-top">
        {/* Card 1: สถานะโครงการ */}
        <section className="card">
          <div className="card-head">
            <h2>
              <Folder className="icon" />
              <span>สถานะโครงการ</span>
            </h2>
            <Link href="/projects" className="text-button">
              ดูโครงการ →
            </Link>
          </div>

          <div className="hd-status">
            <div
              className="hd-donut"
              style={{
                background: total > 0 ? `conic-gradient(${donutGradient})` : "#edf1f7",
              }}
              role="img"
              aria-label={statusRows.map((r) => `${r.label} ${r.count} โครงการ`).join(", ")}
            >
              <div>
                <strong>{total}</strong>
                <small>โครงการ</small>
              </div>
            </div>

            <div className="hd-status-legend">
              {statusRows.map((r) => (
                <div key={r.label}>
                  <i style={{ background: r.color }} />
                  <span>{r.label}</span>
                  <b>{r.count}</b>
                  <small>{total > 0 ? Math.round((r.count / total) * 100) : 0}%</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Card 2: ความก้าวหน้ารวม */}
        <section className="card">
          <div className="card-head">
            <h2>
              <BarChart3 className="icon" />
              <span>ความก้าวหน้ารวม</span>
            </h2>
            <Link href="/planning" className="text-button">
              ดูแผนงาน →
            </Link>
          </div>

          <div className="hd-big blue">{avgQc.toFixed(0)}%</div>
          <div className="hd-meter">
            <i style={{ width: `${Math.min(100, Math.max(0, avgQc))}%`, background: "var(--blue)" }} />
          </div>
          <p className="section-caption">
            ผ่าน QC เฉลี่ยจาก {total} โครงการ · ทำแล้ว {avgDone.toFixed(0)}%
          </p>

          <div className="hd-task-stats">
            <div>
              <small>เสร็จแล้ว</small>
              <b>{taskCounts.completed}</b>
              <small>ขั้นตอน</small>
            </div>
            <div>
              <small>กำลังดำเนินงาน</small>
              <b>{taskCounts.active}</b>
              <small>ขั้นตอน</small>
            </div>
            <div>
              <small>ยังไม่เสร็จ</small>
              <b>{taskCounts.pending}</b>
              <small>ขั้นตอน</small>
            </div>
          </div>
          <small className="text-[#64748b] text-[11px]">
            สถานะขั้นตอนตามแผนงาน ไม่รวมแถว Phase
          </small>
        </section>

        {/* Card 3: งบประมาณรวม */}
        <section className="card">
          <div className="card-head">
            <h2>
              <Wallet className="icon" />
              <span>งบประมาณรวม</span>
            </h2>
            <Link href="/costs" className="text-button">
              ดูรายละเอียด →
            </Link>
          </div>

          <div className="hd-big">
            {(totalBudget / 1e6).toLocaleString("th-TH", { maximumFractionDigits: 2 })}{" "}
            <small>ล้านบาท</small>
          </div>
          <div className="hd-meter">
            <i style={{ width: `${Math.min(100, Math.max(0, usedPct))}%`, background: "#3b9bf4" }} />
          </div>

          <div className="hd-budget-legend">
            <span>
              ใช้ไป <b>{(totalCost / 1e6).toFixed(2)} ลบ.</b>
              <small>{usedPct}%</small>
            </span>
            <span>
              {remaining < 0 ? "เกินงบ" : "คงเหลือ"}{" "}
              <b>{(Math.abs(remaining) / 1e6).toFixed(2)} ลบ.</b>
              <small>{remainingPct}%</small>
            </span>
          </div>

          <dl className="hd-finance">
            <div>
              <dt>มูลค่าสัญญารวม</dt>
              <dd>{(totalValue / 1e6).toFixed(2)} ล้านบาท</dd>
            </div>
            <div>
              <dt>งบประมาณอนุมัติ</dt>
              <dd>{(totalBudget / 1e6).toFixed(0)} ล้านบาท</dd>
            </div>
            <div>
              <dt>ต้นทุนเกิดจริง</dt>
              <dd>{(totalCost / 1e6).toFixed(2)} ล้านบาท</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* 4. Row 2: Materials & Warehouse, Transport, Installation & QC */}
      <div className="hd-grid hd-middle">
        {/* Card 4: วัสดุและคลัง */}
        <section className="card">
          <div className="card-head">
            <h2>
              <Package className="icon" />
              <span>วัสดุและคลัง</span>
            </h2>
            <Link href="/materials" className="text-button">
              ดูวัสดุทั้งหมด →
            </Link>
          </div>

          <div className="hd-big">
            {materialCount} <small>รายการตาม BOM</small>
          </div>
          <div className="hd-unit-lines">
            <small>ต้องใช้ 600 แผ่น · คลังยืนยัน 362 แผ่น</small>
            <small>ต้องใช้ 200 ชุด · คลังยืนยัน 100 ชุด</small>
          </div>

          <div className="hd-stat-list">
            <div>
              <span>
                <i style={{ background: "#16b77b" }} />
                ของครบ
              </span>
              <b>{materialStocked}</b>
            </div>
            <div>
              <span>
                <i style={{ background: "#f7a63c" }} />
                รอตรวจสอบ
              </span>
              <b>{materialPending}</b>
            </div>
            <div>
              <span>
                <i style={{ background: "#f34b63" }} />
                ต้องสั่งผลิต
              </span>
              <b>{materialShortage}</b>
            </div>
          </div>
          <small className="text-[#64748b] text-[11px]">
            จำนวนรายการตามสถานะ · ยังไม่มีข้อมูลมูลค่าสต็อกในระบบ
          </small>
        </section>

        {/* Card 5: การขนส่ง */}
        <section className="card">
          <div className="card-head">
            <h2>
              <Truck className="icon" />
              <span>การขนส่ง</span>
            </h2>
            <Link href="/transport" className="text-button">
              ดูขนส่งทั้งหมด →
            </Link>
          </div>

          <div className="hd-big">
            {todayTripsCount} <small>เที่ยววันนี้</small>
          </div>
          <p className="section-caption">
            ตามกำหนดถึง / การเปลี่ยนสถานะวันนี้ · สัปดาห์นี้ {thisWeekTripsCount} เที่ยว
          </p>

          <div className="hd-stat-list">
            <div>
              <span>
                <i style={{ background: "#398bff" }} />
                กำลังขนส่ง
              </span>
              <b>{transportingCount}</b>
            </div>
            <div>
              <span>
                <i style={{ background: "#bac9df" }} />
                รอออกจากต้นทาง
              </span>
              <b>{plannedCount}</b>
            </div>
            <div>
              <span>
                <i style={{ background: "#16b77b" }} />
                ส่งมอบแล้ว
              </span>
              <b>{deliveredCount}</b>
            </div>
          </div>
          <small className="text-[#64748b] text-[11px]">
            สถานะเที่ยวทั้งหมดในโครงการที่เลือก
          </small>
        </section>

        {/* Card 6: การติดตั้งและ QC */}
        <section className="card">
          <div className="card-head">
            <h2>
              <ShieldCheck className="icon" />
              <span>การติดตั้งและ QC</span>
            </h2>
            <Link href="/installation" className="text-button">
              ดูรายละเอียด →
            </Link>
          </div>

          <div className="hd-big">
            {workingPackagesCount} <small>ชุดงานเริ่มดำเนินงาน</small>
          </div>
          <p className="section-caption">
            ทำแล้วบางส่วนและยังผ่าน QC ไม่ครบ · รอตรวจ {qcPendingCount} คำขอ
          </p>

          <div className="hd-stat-list">
            <div>
              <span>
                <i style={{ background: "#16b77b" }} />
                QC อนุมัติ
              </span>
              <b>{qcApprovedCount}</b>
            </div>
            <div>
              <span>
                <i style={{ background: "#f7a63c" }} />
                รอตรวจ
              </span>
              <b>{qcPendingCount}</b>
            </div>
            <div>
              <span>
                <i style={{ background: "#f34b63" }} />
                NCR ยังไม่ปิด
              </span>
              <b>{openNcrCount}</b>
            </div>
          </div>
          <small className="text-[#64748b] text-[11px]">
            นับคำขอตรวจและ NCR แยกจากจำนวนชุดงาน
          </small>
        </section>
      </div>

      {/* 5. Row 3: Latest Projects Table, Transport Trips & GPS Map, Activities */}
      <div className="hd-grid hd-bottom">
        {/* Card 7: โครงการล่าสุด */}
        <section className="card">
          <div className="card-head">
            <h2>
              <Folder className="icon" />
              <span>โครงการล่าสุด</span>
            </h2>
            <Link href="/projects" className="text-button">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="table-wrap overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>โครงการ / ลูกค้า</th>
                  <th>สถานะ</th>
                  <th>ความก้าวหน้า</th>
                  <th>กำหนดส่ง</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="hd-project-cell">
                        <span className="hd-project-icon">
                          <Folder className="w-4 h-4" />
                        </span>
                        <div>
                          <small>{p.code}</small>
                          <Link href={`/projects/${p.id}`} className="hd-project-name">
                            {p.name}
                          </Link>
                          <small>{p.client}</small>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(p)}</td>
                    <td>
                      <div className="progress-label">{p.progress.qc}%</div>
                      <div className="progress">
                        <i style={{ width: `${p.progress.qc}%` }} />
                      </div>
                      <small className="text-[10px] text-[#64748b] block mt-1">
                        ผ่าน QC
                      </small>
                    </td>
                    <td>{formatThaiDate(p.end)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Card 8: เที่ยวขนส่งวันนี้ & เส้นทางพิกัด */}
        <section className="card">
          <div className="card-head">
            <h2>
              <Truck className="icon" />
              <span>เที่ยวขนส่งวันนี้</span>
            </h2>
            <Link href="/transport" className="text-button">
              ดูทั้งหมด →
            </Link>
          </div>

          <p className="section-caption">
            ไม่มีเที่ยวขนส่งวันนี้ · แสดงเที่ยวล่าสุดในขอบเขตที่เลือก
          </p>

          {/* Map Preview */}
          <div className="hd-map">
            <div className="hd-map-fallback">
              <MapPin className="w-5 h-5 text-[#6584ac]" />
              <span>เส้นทางพิกัดตัวอย่าง</span>
              <a
                href="https://www.google.com/maps/dir/?api=1&origin=16.476969%2C%20102.774242&destination=14.204000%2C%20100.615000&travelmode=driving"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                เปิด Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <small className="hd-map-status" role="status">
            Google Maps · เส้นทางพิกัดเดโม A → B · ไม่มี GPS รถจริง
          </small>

          {/* Trip List */}
          <div className="hd-trip-list">
            {initialTrips.slice(0, 3).map((trip) => (
              <Link
                key={trip.id}
                href={`/transport`}
                className="flex items-center gap-2"
              >
                <span className="hd-trip-dot" />
                <div>
                  <b>{trip.id}</b>
                  <small>
                    {trip.projectName} · {formatThaiDate(trip.eta)}
                  </small>
                </div>
                {getTripBadge(trip.status)}
              </Link>
            ))}
          </div>
        </section>

        {/* Card 9: กิจกรรมวันนี้ */}
        <section className="card">
          <div className="card-head">
            <h2>
              <History className="icon" />
              <span>กิจกรรมวันนี้</span>
            </h2>
            <Link href="/reports" className="text-button">
              รายงาน →
            </Link>
          </div>

          <p className="section-caption">วันนี้ยังไม่มีกิจกรรมบันทึกใหม่</p>
          <h3 className="hd-recent-label">กิจกรรมล่าสุด</h3>

          <div className="hd-activity">
            {initialActivities.slice(0, 5).map((act) => (
              <Link key={act.id} href={act.href}>
                <i />
                <div>
                  <small>{act.createdAt}</small>
                  <b>{act.title}</b>
                  <small>
                    {act.projectName} · {act.id}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 6. Bottom Notice Line */}
      <div className="hd-bottom-note">
        <ShieldCheck className="w-4 h-4 text-[#64748b] flex-shrink-0" />
        <span>
          ข้อมูลเฉพาะโครงการตามสิทธิ์ · ความก้าวหน้าแยกผลงานทำแล้วและผ่าน QC ·
          วันที่วันนี้ {formattedTodayThai}
        </span>
      </div>
    </section>
  );
}
