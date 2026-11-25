"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Factory,
  FileText,
  Warehouse,
  Search,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Folder,
  Layers,
  ArrowRight,
  Plus,
} from "lucide-react";
import "./materials-dashboard.css";

export interface MaterialRowData {
  key: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  drawingId: string;
  drawingRev: string;
  drawingApproved: boolean;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  required: number;
  requiredDate?: string | null;
  requested: number;
  unrequested: number;
  allocated: number;
  checked: number;
  pending: number;
  toOrder: number;
  shipped: number;
  assigned: number;
  received: number;
  damaged: number;
  missing: number;
  ordered: number;
  producing: number;
  factoryReady: number;
  coverage: number;
  flags: string[];
  summaries: Array<{
    requestId: string;
    packageId?: string;
    packageName?: string;
    requiredDate?: string;
    createdBy?: string;
    status: string;
    qty: number;
    unit: string;
    allocated: number;
    shortage: number;
    toOrder: number;
    assigned: number;
    shipped: number;
    received: number;
    damaged: number;
    missing: number;
    warehouseName?: string;
    storageLocation?: string;
    externalRef?: string;
    warehouseNote?: string;
    orders: Array<{
      id: string;
      qty: number;
      readyDate?: string;
      factory?: string;
      status: string;
      priority?: string;
    }>;
  }>;
}

interface MaterialsClientViewProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  selectedProjectId: string;
  materialRows: MaterialRowData[];
  unapprovedDrawingsCount: number;
}

export function MaterialsClientView({
  allProjects,
  selectedProjectId,
  materialRows,
  unapprovedDrawingsCount,
}: MaterialsClientViewProps) {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("");

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "all" || !val) {
      router.push("/materials");
    } else {
      router.push(`/materials?projectId=${val}`);
    }
  };

  // Unique zones
  const zones = useMemo(() => {
    const set = new Map<string, string>();
    for (const r of materialRows) {
      for (const s of r.summaries) {
        if (s.packageId && s.packageName) {
          set.set(s.packageId, s.packageName);
        }
      }
    }
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [materialRows]);

  // Counts for KPIs
  const counts = useMemo(() => {
    return {
      all: materialRows.length,
      stocked: materialRows.filter((r) => r.flags.includes("stocked")).length,
      pending: materialRows.filter((r) => r.flags.includes("pending")).length,
      shipped: materialRows.filter((r) => r.flags.includes("shipped")).length,
      shortage: materialRows.filter((r) => r.flags.includes("shortage")).length,
      ordered: materialRows.filter((r) => r.flags.includes("ordered")).length,
      issue: materialRows.filter((r) => r.flags.includes("issue")).length,
    };
  }, [materialRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const effectiveStatus = activeFilter !== "all" ? activeFilter : statusFilter;

    return materialRows.filter((r) => {
      const matchStatus =
        effectiveStatus === "all" || r.flags.includes(effectiveStatus);
      const matchZone =
        !zoneFilter || r.summaries.some((s) => s.packageId === zoneFilter);
      const matchQuery =
        !q ||
        [
          r.projectName,
          r.projectCode,
          r.drawingId,
          r.itemCode,
          r.itemName,
          r.spec,
          ...r.summaries.map((s) => s.requestId),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchStatus && matchZone && matchQuery;
    });
  }, [materialRows, activeFilter, statusFilter, zoneFilter, searchQuery]);

  const handleClearFilters = () => {
    setActiveFilter("all");
    setStatusFilter("all");
    setZoneFilter("");
    setSearchQuery("");
  };

  const handleKpiClick = (filterKey: string) => {
    setActiveFilter(filterKey);
    setStatusFilter(filterKey);
  };

  const formatNumber = (n: number) => {
    return Number(n || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });
  };

  const selectedProjectObj = allProjects.find((p) => p.id === selectedProjectId);

  return (
    <div className="materials-dashboard-page">
      {/* Back to All Projects Banner if a project is selected */}
      {selectedProjectObj && (
        <div className="module-detail-back">
          <button
            type="button"
            onClick={() => router.push("/materials")}
            aria-label="กลับภาพรวมวัสดุและคลัง"
          >
            ← กลับภาพรวมวัสดุและคลัง
          </button>
          <span>{selectedProjectObj.code} · {selectedProjectObj.name}</span>
        </div>
      )}

      {/* 1. Project Page Heading & Scope Selector */}
      <div className="mat-page-heading">
        <div className="heading-text">
          <h1>วัสดุและคลัง</h1>
          <p>
            {selectedProjectObj
              ? `${selectedProjectObj.name} • ${selectedProjectObj.code}`
              : `${allProjects.length} โครงการในขอบเขตของคุณ`}
          </p>
        </div>

        <div className="mat-heading-controls">
          <div className="mat-project-filter">
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

      {/* 2. KPI Cards with Waves */}
      <div className="mat-kpis">
        {/* KPI 1: รายการวัสดุทั้งหมด */}
        <button
          type="button"
          className="mat-kpi-button"
          aria-pressed={activeFilter === "all"}
          onClick={() => handleKpiClick("all")}
          aria-label="กรอง: รายการวัสดุทั้งหมด"
        >
          <div className="card kpi pd-kpi blue">
            <div className="symbol">
              <Package className="w-5 h-5" />
            </div>
            <div className="pd-kpi-text">
              <span className="label">รายการวัสดุทั้งหมด</span>
              <span className="value">{counts.all}</span>
              <small>จาก BOM ที่อนุมัติและคำขอเดิม</small>
            </div>
            <svg
              className="pd-wave"
              viewBox="0 0 260 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        </button>

        {/* KPI 2: มีของครบตาม BOM */}
        <button
          type="button"
          className="mat-kpi-button"
          aria-pressed={activeFilter === "stocked"}
          onClick={() => handleKpiClick("stocked")}
          aria-label="กรอง: มีของครบตาม BOM"
        >
          <div className="card kpi pd-kpi green">
            <div className="symbol">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="pd-kpi-text">
              <span className="label">มีของครบตาม BOM</span>
              <span className="value">{counts.stocked}</span>
              <small>คลังยืนยันครบปริมาณทั้งโครงการ</small>
            </div>
            <svg
              className="pd-wave"
              viewBox="0 0 260 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        </button>

        {/* KPI 3: รอตรวจสอบคลัง */}
        <button
          type="button"
          className="mat-kpi-button"
          aria-pressed={activeFilter === "pending"}
          onClick={() => handleKpiClick("pending")}
          aria-label="กรอง: รอตรวจสอบคลัง"
        >
          <div className="card kpi pd-kpi purple">
            <div className="symbol">
              <Clock className="w-5 h-5" />
            </div>
            <div className="pd-kpi-text">
              <span className="label">รอตรวจสอบคลัง</span>
              <span className="value">{counts.pending}</span>
              <small>รวมวัสดุที่ยังไม่สร้างคำขอ</small>
            </div>
            <svg
              className="pd-wave"
              viewBox="0 0 260 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        </button>

        {/* KPI 4: ขนส่งแล้ว */}
        <button
          type="button"
          className="mat-kpi-button"
          aria-pressed={activeFilter === "shipped"}
          onClick={() => handleKpiClick("shipped")}
          aria-label="กรอง: ขนส่งแล้ว"
        >
          <div className="card kpi pd-kpi blue">
            <div className="symbol">
              <Truck className="w-5 h-5" />
            </div>
            <div className="pd-kpi-text">
              <span className="label">ขนส่งแล้ว</span>
              <span className="value">{counts.shipped}</span>
              <small>มีเที่ยวออกจากต้นทางแล้ว</small>
            </div>
            <svg
              className="pd-wave"
              viewBox="0 0 260 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        </button>

        {/* KPI 5: ต้องสั่งผลิตเพิ่ม */}
        <button
          type="button"
          className="mat-kpi-button"
          aria-pressed={activeFilter === "shortage"}
          onClick={() => handleKpiClick("shortage")}
          aria-label="กรอง: ต้องสั่งผลิตเพิ่ม"
        >
          <div className="card kpi pd-kpi orange">
            <div className="symbol">
              <Factory className="w-5 h-5" />
            </div>
            <div className="pd-kpi-text">
              <span className="label">ต้องสั่งผลิตเพิ่ม</span>
              <span className="value">{counts.shortage}</span>
              <small>เฉพาะส่วนขาดที่คลังยืนยัน</small>
            </div>
            <svg
              className="pd-wave"
              viewBox="0 0 260 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        </button>

        {/* KPI 6: มีใบสั่งผลิต */}
        <button
          type="button"
          className="mat-kpi-button"
          aria-pressed={activeFilter === "ordered"}
          onClick={() => handleKpiClick("ordered")}
          aria-label="กรอง: มีใบสั่งผลิต"
        >
          <div className="card kpi pd-kpi purple">
            <div className="symbol">
              <FileText className="w-5 h-5" />
            </div>
            <div className="pd-kpi-text">
              <span className="label">มีใบสั่งผลิต</span>
              <span className="value">{counts.ordered}</span>
              <small>รวมรอผลิต กำลังผลิต และพร้อมส่ง</small>
            </div>
            <svg
              className="pd-wave"
              viewBox="0 0 260 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        </button>
      </div>

      {/* 3. Context Banner */}
      <div className="mat-context">
        <div>
          <Warehouse className="icon" />
          <div>
            <b>เชื่อมข้อมูล BOM → คลัง → ผลิต → ขนส่ง → ตรวจรับ</b>
            <p>
              ยอดจัดสรรคือผลยืนยันจากคลังภายนอก ·
              เที่ยวที่ยังไม่ออกจากต้นทางแสดงเป็น “จัดเที่ยวแล้ว” ·
              จำนวนต่างหน่วยแยกตามรายการ
            </p>
          </div>
        </div>
        <span className="mat-source">
          {materialRows.filter((r) => r.drawingApproved).length} รายการตาม BOM
          · PostgreSQL
        </span>
      </div>

      {/* Notice if unapproved drawings exist */}
      {unapprovedDrawingsCount > 0 && (
        <div className="mat-notice">
          <AlertTriangle className="w-4 h-4 text-[#d97706]" />
          <span>
            มีแบบ / BOM {unapprovedDrawingsCount} ฉบับยังไม่อนุมัติ
            จึงยังไม่นำมารวมยอดวัสดุที่ต้องใช้
          </span>
          <Link
            href={
              selectedProjectId
                ? `/projects/${selectedProjectId}?tab=drawings`
                : "/projects"
            }
          >
            ตรวจแบบ / BOM →
          </Link>
        </div>
      )}

      {/* 4. Materials Table Card */}
      <div className="mat-list-card">
        <div className="card-head">
          <div>
            <h2>รายการวัสดุที่ต้องใช้ทั้งหมด</h2>
            <p className="section-caption">
              แยกตามรหัสวัสดุและ BOM พร้อมยอดคลัง การผลิต และการขนส่ง
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mat-toolbar">
          <label className="mat-search">
            <Search className="icon w-4 h-4" />
            <input
              type="search"
              placeholder="ค้นหาวัสดุ รหัส สเปก หรือเลขคำขอ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="ค้นหาวัสดุ รหัส หรือ BOM"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setActiveFilter(e.target.value);
            }}
            aria-label="สถานะวัสดุ"
          >
            <option value="all">ทั้งหมด</option>
            <option value="stocked">มีของครบตาม BOM</option>
            <option value="pending">รอตรวจสอบคลัง</option>
            <option value="shipped">ขนส่งแล้ว</option>
            <option value="shortage">ต้องสั่งผลิตเพิ่ม</option>
            <option value="ordered">มีใบสั่งผลิต</option>
            <option value="issue">รายการต้องติดตาม</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            aria-label="ชุดงานวัสดุ"
          >
            <option value="">ทุกชุดงาน / โซน</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="mat-toolbar-btn"
            onClick={handleClearFilters}
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div className="mat-list-summary" aria-live="polite">
          แสดง {filteredRows.length} จาก {materialRows.length} รายการ
        </div>

        {/* Table Wrap */}
        {filteredRows.length > 0 ? (
          <div className="mat-table-wrap">
            <table className="mat-table">
              <thead>
                <tr>
                  <th>วัสดุ / สเปก / BOM</th>
                  <th>ต้องใช้ตาม BOM</th>
                  <th>คลังยืนยันจัดสรร</th>
                  <th>รอตรวจสอบ</th>
                  <th>ขนส่ง / ตรวจรับ</th>
                  <th>ต้องผลิตเพิ่ม</th>
                  <th>สถานะ / ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <React.Fragment key={r.key}>
                    <tr>
                      <td>
                        <div className="mat-name">
                          <span className="mat-cube">
                            <Package className="w-5 h-5" />
                          </span>
                          <div>
                            <strong>{r.itemName}</strong>
                            <small>
                              {r.itemCode} · {r.projectCode} · {r.projectName}
                            </small>
                            <small>{r.spec || "ยังไม่ระบุสเปก / ขนาด"}</small>
                            <span className="mat-bom-link">
                              {r.drawingId} · Rev.{r.drawingRev}{" "}
                              {r.drawingApproved
                                ? "อนุมัติแล้ว"
                                : "ยังไม่ผูก BOM อนุมัติ"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <b className="mat-quantity">
                          {r.drawingApproved ? formatNumber(r.required) : "—"}
                        </b>
                        <small>
                          {r.unit} · ต้องใช้{" "}
                          {r.requiredDate
                            ? new Date(r.requiredDate).toLocaleDateString(
                                "th-TH",
                                { day: "numeric", month: "short", year: "2-digit" }
                              )
                            : "ตามแผนงาน"}
                        </small>
                        <small>
                          ขอแล้ว {formatNumber(r.requested)} / ยังไม่ขอ{" "}
                          {formatNumber(r.unrequested)}
                        </small>
                      </td>

                      <td>
                        <b className="mat-quantity green">
                          {formatNumber(r.allocated)}
                        </b>
                        <small>
                          {r.unit} · {Math.round(r.coverage)}% ของ BOM
                        </small>
                        <div className="mat-progress">
                          <i style={{ width: `${Math.min(100, r.coverage)}%` }} />
                        </div>
                        <small>
                          เหลือจัดเที่ยว{" "}
                          {formatNumber(Math.max(0, r.allocated - r.assigned))}
                        </small>
                      </td>

                      <td>
                        <b className="mat-quantity purple">
                          {formatNumber(r.pending)}
                        </b>
                        <small>{r.unit} · รวมส่วนยังไม่สร้างคำขอ</small>
                      </td>

                      <td>
                        <b className="mat-quantity">
                          {formatNumber(r.shipped)}
                        </b>
                        <small>{r.unit} ออกจากต้นทางแล้ว</small>
                        <small>
                          จัดเที่ยว {formatNumber(r.assigned)} · รับดี{" "}
                          {formatNumber(r.received)}
                        </small>
                        {r.damaged + r.missing > 0 && (
                          <small className="text-red-600 font-semibold">
                            เสียหาย {formatNumber(r.damaged)} / ขาด{" "}
                            {formatNumber(r.missing)}
                          </small>
                        )}
                      </td>

                      <td>
                        <b
                          className={`mat-quantity ${
                            r.toOrder > 0 ? "red" : ""
                          }`}
                        >
                          {formatNumber(r.toOrder)}
                        </b>
                        <small>{r.unit} ยังไม่สั่ง</small>
                        <small>
                          สั่งแล้ว {formatNumber(r.ordered)} · กำลังผลิต{" "}
                          {formatNumber(r.producing)}
                        </small>
                        <small>โรงงานพร้อม {formatNumber(r.factoryReady)}</small>
                      </td>

                      <td>
                        <div className="mat-tags">
                          {r.flags.includes("stocked") && (
                            <span className="mat-tag green">
                              มีของครบตาม BOM
                            </span>
                          )}
                          {r.flags.includes("pending") && (
                            <span className="mat-tag purple">
                              รอตรวจสอบคลัง
                            </span>
                          )}
                          {r.flags.includes("shipped") && (
                            <span className="mat-tag">ขนส่งแล้ว</span>
                          )}
                          {r.flags.includes("shortage") && (
                            <span className="mat-tag red">ต้องสั่งผลิต</span>
                          )}
                          {r.flags.includes("ordered") && (
                            <span className="mat-tag orange">มีใบสั่งผลิต</span>
                          )}
                        </div>
                        <div className="mat-actions">
                          {r.toOrder > 0 && (
                            <Link
                              href={`/production?projectId=${r.projectId}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2f80ed] text-white text-[11px] font-semibold hover:bg-[#206cd4]"
                            >
                              <Plus className="w-3 h-3" />
                              ออกใบสั่งผลิต {formatNumber(r.toOrder)} {r.unit}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable details row */}
                    {r.summaries.length > 0 && (
                      <tr className="mat-detail-row">
                        <td colSpan={7}>
                          <details>
                            <summary>
                              รายละเอียดคลัง คำขอวัสดุ ใบสั่งผลิต
                              และเที่ยวขนส่ง ({r.summaries.length} คำขอ)
                            </summary>
                            <div className="mat-detail-body">
                              {r.summaries.map((s, idx) => (
                                <section key={idx} className="mat-request">
                                  <div className="mat-request-head">
                                    <div>
                                      <b>
                                        {s.requestId} · {r.itemName}
                                      </b>
                                      <small>
                                        {s.packageName || "ชุดงานหลัก"} ·
                                        ต้องใช้ {s.requiredDate || "ตามแผนงาน"}{" "}
                                        · {s.createdBy || "ผู้ขอ"}
                                      </small>
                                    </div>
                                    <span className="mat-tag">
                                      {s.status === "approved"
                                        ? "อนุมัติแล้ว"
                                        : s.status === "confirmed"
                                        ? "ยืนยันแล้ว"
                                        : s.status}
                                    </span>
                                  </div>

                                  <dl className="mat-request-fields">
                                    <div>
                                      <dt>จำนวนขอ</dt>
                                      <dd>
                                        {formatNumber(s.qty)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>คลังจัดสรร</dt>
                                      <dd>
                                        {formatNumber(s.allocated)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>ส่วนขาดยืนยัน</dt>
                                      <dd>
                                        {formatNumber(s.shortage)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>ยังไม่ออกใบสั่งผลิต</dt>
                                      <dd>
                                        {formatNumber(s.toOrder)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>จัดเที่ยวแล้ว</dt>
                                      <dd>
                                        {formatNumber(s.assigned)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>ออกจากต้นทางแล้ว</dt>
                                      <dd>
                                        {formatNumber(s.shipped)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>รับดี / เสียหาย / ขาด</dt>
                                      <dd>
                                        {formatNumber(s.received)} /{" "}
                                        {formatNumber(s.damaged)} /{" "}
                                        {formatNumber(s.missing)} {s.unit}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>คลัง / ตำแหน่งจัดเก็บ</dt>
                                      <dd>
                                        {[s.warehouseName, s.storageLocation]
                                          .filter(Boolean)
                                          .join(" • ") || "คลังกลาง PCC"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>เลขยืนยันคลัง</dt>
                                      <dd>{s.externalRef || "รอผลยืนยัน"}</dd>
                                    </div>
                                  </dl>

                                  {s.orders.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-[#e2eaf5]">
                                      <b className="text-xs text-[#0c2340] flex items-center gap-1.5 mb-2">
                                        <Factory className="w-3.5 h-3.5 text-[#2f80ed]" />
                                        ใบสั่งผลิตที่เชื่อมกับคำขอนี้
                                      </b>
                                      <div className="space-y-1.5">
                                        {s.orders.map((o) => (
                                          <div
                                            key={o.id}
                                            className="flex items-center justify-between p-2 bg-[#f8fbff] rounded border border-[#e5edf8] text-xs"
                                          >
                                            <div>
                                              <strong className="text-[#0c2340]">
                                                {o.id}
                                              </strong>
                                              <span className="text-[#627d98] ml-2">
                                                {formatNumber(o.qty)} {s.unit} ·
                                                ต้องพร้อม{" "}
                                                {o.readyDate || "ตามกำหนด"} ·{" "}
                                                {o.factory || "โรงงานพรีคาสท์ PCC"}
                                              </span>
                                            </div>
                                            <span className="mat-tag orange">
                                              {o.status === "producing"
                                                ? "กำลังผลิต"
                                                : o.status === "ready"
                                                ? "พร้อมส่ง"
                                                : "รอผลิต"}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </section>
                              ))}
                            </div>
                          </details>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#627d98]">
            ไม่พบรายการวัสดุตามตัวกรองที่เลือก
          </div>
        )}

        <div className="mat-footer">
          <span>
            รอตรวจสอบไม่ถือเป็นส่วนขาด · รายการหนึ่งมีได้หลายสถานะ ·
            ใบสั่งผลิตหักใบสั่งเดิมที่ยังไม่ยกเลิก
          </span>
          <span>ข้อมูลโครงการตามสิทธิ์ของผู้ใช้</span>
        </div>
      </div>

      {/* 5. Workflow Guide */}
      <div className="mat-guide">
        <b>
          <Layers className="w-4 h-4 text-[#2f80ed]" />
          ขั้นตอนดำเนินการ
        </b>
        <ol>
          <li>
            <b>BOM อนุมัติ</b>
            <span>ทะเบียนวัสดุทั้งหมด</span>
          </li>
          <li>
            <b>คำขอวัสดุ</b>
            <span>เลือกชุดงานและส่ง PM</span>
          </li>
          <li>
            <b>ตรวจสอบคลัง</b>
            <span>ยืนยันยอดและเลขอ้างอิง</span>
          </li>
          <li>
            <b>ผลิตส่วนขาด</b>
            <span>ออกใบสั่งตามยอดคงเหลือ</span>
          </li>
          <li>
            <b>จัดเที่ยว / ตรวจรับ</b>
            <span>ติดตามรับดีและส่วนต่าง</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
