"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  CheckCircle2,
  Package,
  Weight,
  Clock,
  Search,
  Filter,
  Folder,
  ChevronDown,
  ExternalLink,
  Phone,
  AlertTriangle,
  FileText,
  MapPin,
  RefreshCw,
  Plus,
} from "lucide-react";
import "./transport-dashboard.css";

export interface TripDetailData {
  id: string;
  tripNo: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  packageId?: string | null;
  packageName?: string | null;
  requestId?: string | null;
  plateNo: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoQty: number;
  unit: string;
  weightKg?: number;
  distanceKm?: number;
  status: "SCHEDULED" | "READY" | "DEPARTED" | "ARRIVED" | "DELIVERED" | "CANCELLED";
  scheduledAt?: string | null;
  departedAt?: string | null;
  arrivedAt?: string | null;
  deliveredAt?: string | null;
  etaTime?: string;
  receiving?: {
    id: string;
    goodQty: number;
    badQty: number;
    missingQty: number;
    deliveredQty: number;
    receivedAt?: string;
    status: string;
    damageNotes?: string | null;
    notes?: string | null;
  } | null;
}

interface TransportClientViewProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  selectedProjectId: string;
  trips: TripDetailData[];
  embedded?: boolean;
}

const statusMap: Record<string, { label: string; tone: string; step: number }> = {
  CANCELLED: { label: "ยกเลิก", tone: "red", step: -1 },
  SCHEDULED: { label: "รอยืนยันเที่ยว", tone: "blue", step: 0 },
  READY: { label: "เตรียมสินค้าแล้ว", tone: "orange", step: 1 },
  DEPARTED: { label: "กำลังขนส่ง", tone: "blue", step: 2 },
  ARRIVED: { label: "ถึงหน้างาน", tone: "purple", step: 3 },
  DELIVERED: { label: "ส่งมอบแล้ว", tone: "green", step: 4 },
};

export function TransportClientView({
  allProjects,
  selectedProjectId,
  trips,
  embedded = false,
}: TransportClientViewProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string>(
    trips[0]?.id || ""
  );
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [receiptFilter, setReceiptFilter] = useState("");

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "all" || !val) {
      router.push("/transport");
    } else {
      router.push(`/transport?projectId=${val}`);
    }
  };

  // Filtered trips
  const filteredTrips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return trips.filter((t) => {
      const matchQuery =
        !q ||
        [
          t.tripNo,
          t.plateNo,
          t.driverName,
          t.destination,
          t.cargoDescription,
          t.projectCode,
          t.projectName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchStatus = !statusFilter || t.status === statusFilter;

      let matchReceipt = true;
      if (receiptFilter === "complete") {
        matchReceipt =
          Boolean(t.receiving) &&
          t.receiving!.goodQty >= t.cargoQty &&
          t.cargoQty > 0;
      } else if (receiptFilter === "issue") {
        matchReceipt =
          Boolean(t.receiving) &&
          (t.receiving!.badQty > 0 || t.receiving!.missingQty > 0);
      } else if (receiptFilter === "pending") {
        matchReceipt = !t.receiving || t.receiving.goodQty < t.cargoQty;
      }

      return matchQuery && matchStatus && matchReceipt;
    });
  }, [trips, searchQuery, statusFilter, receiptFilter]);

  // Current active trip
  const activeTrip = useMemo(() => {
    return filteredTrips.find((t) => t.id === selectedTripId) || filteredTrips[0];
  }, [trips, selectedTripId, filteredTrips]);

  const handleClear = () => {
    setSearchQuery("");
    setStatusFilter("");
    setReceiptFilter("");
  };

  // Selected project object
  const selectedProj = allProjects.find((p) => p.id === selectedProjectId);

  // Active trip receiving numbers
  const good = activeTrip?.receiving?.goodQty || 0;
  const damaged = activeTrip?.receiving?.badQty || 0;
  const missing = activeTrip?.receiving?.missingQty || 0;
  const settled = good + damaged + missing;
  const totalQty = activeTrip?.cargoQty || 0;
  const percentSettled = totalQty > 0 ? Math.min(100, Math.round((settled / totalQty) * 100)) : 0;
  const currentStep = activeTrip ? statusMap[activeTrip.status]?.step ?? 0 : 0;

  const kpiCards = (activeTrip || embedded) && (
      <div className="td-kpis">
        {/* KPI 1: สถานะเที่ยว */}
        <div className="card kpi pd-kpi blue">
          <div className="symbol">
            <Truck className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">สถานะเที่ยว</span>
            <span className="value">
              {activeTrip ? statusMap[activeTrip.status]?.label : "ไม่มีเที่ยวรถ"}
            </span>
            <small>
              {activeTrip?.scheduledAt
                ? `กำหนดถึง ${new Date(activeTrip.scheduledAt).toLocaleDateString("th-TH")}`
                : "กำหนดการขนส่ง"}
            </small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 2: ตรวจรับแล้ว */}
        <div className="card kpi pd-kpi green">
          <div className="symbol">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ตรวจรับแล้ว</span>
            <span className="value">
              {settled} / {totalQty}
            </span>
            <small>
              {activeTrip?.unit || "หน่วย"} · {percentSettled}%
            </small>
            <div className="td-receipt-bar">
              <i style={{ width: `${percentSettled}%` }} />
            </div>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 3: สินค้าในเที่ยว */}
        <div className="card kpi pd-kpi blue">
          <div className="symbol">
            <Package className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">สินค้าในเที่ยว</span>
            <span className="value">
              {totalQty} {activeTrip?.unit || "หน่วย"}
            </span>
            <small>{activeTrip?.cargoDescription || (activeTrip ? "1 รายการตามคำขอวัสดุ" : "ยังไม่มีรายการสินค้าในเที่ยว")}</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 4: น้ำหนักรวม */}
        {!embedded && <div className="card kpi pd-kpi purple">
          <div className="symbol">
            <Weight className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">น้ำหนักรวม</span>
            <span className="value">
              {activeTrip?.weightKg ? `${activeTrip.weightKg.toLocaleString()} กก.` : "ยังไม่ระบุ"}
            </span>
            <small>ตามข้อมูลเที่ยวรถ</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>}

        {/* KPI 5: ความตรงเวลา */}
        <div className="card kpi pd-kpi green">
          <div className="symbol">
            <Clock className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ความตรงเวลา</span>
            <span className="value">{activeTrip?.arrivedAt && activeTrip.scheduledAt
              ? new Date(activeTrip.arrivedAt).getTime() <= new Date(activeTrip.scheduledAt).getTime() ? (embedded ? "ตามแผน" : "ถึงตามกำหนด") : (embedded ? "ล่าช้า" : "ถึงหลังกำหนด")
              : embedded ? (activeTrip ? "รอข้อมูล" : "—") : "รอข้อมูลถึงจริง"}</span>
            <small>{activeTrip ? "เทียบวันที่ถึงจริงกับแผน" : "ยังไม่มีเที่ยวขนส่ง"}</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>
      </div>
  );

  return (
    <div className={`transport-dashboard-page${embedded ? " td-embedded" : ""}`} data-project-transport={embedded ? selectedProjectId : undefined}>
      {/* Back to All Projects Banner if a project is selected */}
      {selectedProj && !embedded && (
        <div className="module-detail-back">
          <button
            type="button"
            onClick={() => router.push("/transport")}
            aria-label="กลับภาพรวมการขนส่งและตรวจรับ"
          >
            ← กลับภาพรวมการขนส่งและตรวจรับ
          </button>
          <span>{selectedProj.code} · {selectedProj.name}</span>
        </div>
      )}

      {/* 1. Page Heading & Project Scope Selector */}
      {!embedded && <div className="td-page-heading">
        {!embedded && <div className="heading-text">
          <h1>การขนส่งและตรวจรับ</h1>
          <p>
            {selectedProj
              ? `${selectedProj.name} • ${selectedProj.code}`
              : `${allProjects.length} โครงการในขอบเขตของคุณ`}
          </p>
        </div>}

        {!embedded && <div className="td-heading-controls">
          <div className="td-project-filter">
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
        </div>}
      </div>}

      {embedded && kpiCards}

      {/* 2. Toolbar */}
      <div className="td-toolbar">
        <label className="td-search">
          <Search className="w-4 h-4 text-[#7b8eac]" />
          <input
            type="search"
            placeholder="ค้นหาเที่ยวรถ ทะเบียน เอกสาร หรือจุดงาน…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="ค้นหาเที่ยวขนส่ง"
          />
        </label>

        <label className="td-trip-picker">
          <span>เลือกเที่ยวรถ</span>
          <select
            value={activeTrip?.id || ""}
            onChange={(e) => setSelectedTripId(e.target.value)}
            aria-label="เลือกเที่ยวรถ"
          >
            {filteredTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tripNo} · {t.projectCode} · {statusMap[t.status]?.label || t.status}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="td-filters-btn"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <Filter className="w-4 h-4" />
          <span>ตัวกรอง</span>
        </button>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="td-filters">
          <label>
            สถานะรถ
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">ทุกสถานะ</option>
              <option value="SCHEDULED">รอยืนยันเที่ยว</option>
              <option value="READY">เตรียมสินค้าแล้ว</option>
              <option value="DEPARTED">กำลังขนส่ง</option>
              <option value="ARRIVED">ถึงหน้างาน</option>
              <option value="DELIVERED">ส่งมอบแล้ว</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </label>

          <label>
            ผลตรวจรับ
            <select
              value={receiptFilter}
              onChange={(e) => setReceiptFilter(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">ยังตรวจรับไม่ครบ</option>
              <option value="complete">ตรวจรับครบ</option>
              <option value="issue">เสียหาย / ขาด</option>
            </select>
          </label>

          <button type="button" className="td-clear-btn" onClick={handleClear}>
            ล้างตัวกรอง
          </button>
        </div>
      )}

      {/* Focus context text */}
      {activeTrip && (
        <div className="td-focus-context">
          <span>
            {activeTrip.projectCode} · {activeTrip.projectName}
          </span>
          <b>{activeTrip.tripNo}</b>
        </div>
      )}

      {!activeTrip && <div className="td-empty-state" role="status">{trips.length ? "ไม่พบเที่ยวขนส่งตามเงื่อนไขที่เลือก" : "ยังไม่มีเที่ยวขนส่งและตรวจรับของโครงการนี้"}</div>}
      {activeTrip && <>
      {/* 3. 5 KPI Cards with Wave Pattern */}
      {!embedded && kpiCards}

      {/* 4. Timeline Stepper Card */}
      {activeTrip && (
        <div className="td-timeline-card">
          <div className="td-timeline-head">
            <h2>
              <Truck className="w-4 h-4 text-[#1675ff]" />
              ความคืบหน้าเที่ยวขนส่ง
            </h2>
            <div className="td-timeline-actions">
              <Link
                href={`/transport/${activeTrip.id}`}
                className="px-3 py-1.5 rounded-lg bg-[#1675ff] text-white text-xs font-semibold hover:bg-[#0c62e0] transition-colors"
              >
                อัปเดตสถานะ
              </Link>
              <Link
                href={`/transport/receiving/${activeTrip.id}`}
                className="px-3 py-1.5 rounded-lg bg-[#09a65f] text-white text-xs font-semibold hover:bg-[#07854c] transition-colors"
              >
                ตรวจรับวัสดุ
              </Link>
            </div>
          </div>

          <ol className="td-timeline">
            <li className={currentStep >= 1 ? "done" : currentStep === 0 ? "current" : ""}>
              <span className="td-step-dot">{currentStep >= 1 ? "✓" : "1"}</span>
              <b>เตรียมสินค้า</b>
              <small>{activeTrip.scheduledAt ? new Date(activeTrip.scheduledAt).toLocaleDateString("th-TH") : "รอดำเนินการ"}</small>
            </li>
            <li className={currentStep >= 2 ? "done" : currentStep === 1 ? "current" : ""}>
              <span className="td-step-dot">{currentStep >= 2 ? "✓" : "2"}</span>
              <b>ออกจากคลัง</b>
              <small>{activeTrip.departedAt ? new Date(activeTrip.departedAt).toLocaleDateString("th-TH") : "รอดำเนินการ"}</small>
            </li>
            <li className={currentStep >= 3 ? "done" : currentStep === 2 ? "current" : ""}>
              <span className="td-step-dot">{currentStep >= 3 ? "✓" : "3"}</span>
              <b>ระหว่างขนส่ง</b>
              <small>{currentStep >= 2 ? "กำลังเดินทาง" : "รอดำเนินการ"}</small>
            </li>
            <li className={currentStep >= 4 ? "done" : currentStep === 3 ? "current" : ""}>
              <span className="td-step-dot">{currentStep >= 4 ? "✓" : "4"}</span>
              <b>ถึงหน้างาน</b>
              <small>{activeTrip.arrivedAt ? new Date(activeTrip.arrivedAt).toLocaleDateString("th-TH") : "รอดำเนินการ"}</small>
            </li>
            <li className={currentStep >= 4 && settled >= totalQty && totalQty > 0 ? "done" : currentStep >= 4 ? "current" : ""}>
              <span className="td-step-dot">{currentStep >= 4 && settled >= totalQty ? "✓" : "5"}</span>
              <b>ตรวจรับเสร็จ</b>
              <small>{totalQty > 0 && settled >= totalQty ? "ตรวจรับครบถ้วน" : "รอตรวจรับ"}</small>
            </li>
          </ol>

          <div className="td-progress-note">
            สถานะรถและผลตรวจรับแยกกัน · รับดี {good} / เสียหาย {damaged} / ขาด {missing} {activeTrip.unit || "แผ่น"}
          </div>
        </div>
      )}

      {/* 5. Top Grid: Map Preview & Trip Details */}
      {activeTrip && (
        <div className="td-top-grid">
          {/* Map Preview Panel */}
          <div className="td-panel">
            <div className="td-panel-head">
              <h2>
                <MapPin className="icon" />
                เส้นทางการขนส่ง
              </h2>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(activeTrip.destination)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#1675ff] font-semibold hover:underline flex items-center gap-1"
              >
                เปิด Google Maps ↗
              </a>
            </div>

            <div className="td-map">
              <div className="td-map-scene">
                <svg
                  className="td-map-art"
                  viewBox="0 0 900 320"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <rect x="-400" y="-350" width="1700" height="1400" fill="#edf2f2" />
                  {/* Decorative road blocks */}
                  <path d="M400 -30C530 55 325 110 430 180S540 250 490 350" fill="none" stroke="#bddff3" strokeWidth="23" />
                  <path d="M-30 85 155 105 285 60 490 70 650 10 880 25" fill="none" stroke="#fff" strokeWidth="13" />
                  <path d="M-30 260 155 215 310 254 500 270 675 235 900 255" fill="none" stroke="#fff" strokeWidth="13" />
                  {/* Highway */}
                  <path d="M-20 170 200 160 380 187 565 186 790 110 940 130" fill="none" stroke="#ffdc91" strokeWidth="6" />
                  {/* Demo route */}
                  <path
                    d="M140 157C225 145 268 175 340 186S455 191 550 186 665 135 710 143 755 163 790 110"
                    fill="none"
                    stroke="#1675ff"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Origin pin */}
                  <g transform="translate(140 157)">
                    <circle cy="-16" r="14" fill="#09a65f" />
                    <circle cy="-16" r="5" fill="white" />
                  </g>
                  {/* Destination pin */}
                  <g transform="translate(790 110)">
                    <circle cy="-16" r="14" fill="#ed4053" />
                    <circle cy="-16" r="5" fill="white" />
                  </g>
                  {/* Simulated truck */}
                  <g transform={`translate(${currentStep >= 3 ? 790 : currentStep === 2 ? 470 : 140} ${currentStep >= 3 ? 110 : currentStep === 2 ? 186 : 157})`}>
                    <circle r="18" fill="white" stroke="#1675ff" strokeWidth="2" />
                    <circle r="5" fill="#1675ff" />
                  </g>
                </svg>
              </div>

              <span className="td-map-origin">{activeTrip.origin || "คลังสินค้า PCC"}</span>
              <span className="td-map-destination">{activeTrip.destination || "หน้างานโครงการ"}</span>
              <div className="td-map-caption">
                <b>{activeTrip.tripNo}</b>
                <span className={`td-status ${activeTrip.status.toLowerCase()}`}>
                  {statusMap[activeTrip.status]?.label}
                </span>
                <small>ตำแหน่ง GPS จำลอง</small>
              </div>
              <span className="td-map-note">
                แผนภาพเส้นทางระบบ · พิกัด GPS จำลองจากระบบขนส่ง
              </span>
            </div>

            <div className="td-map-legend">
              <span>
                <i className="td-dot green" /> ต้นทาง ({activeTrip.origin || "คลัง"})
              </span>
              <span>
                <i className="td-route-line" /> เส้นทางขนส่ง
              </span>
              <span>
                <Truck className="w-3.5 h-3.5 text-[#1675ff]" /> รถขนส่ง
              </span>
              <span>
                <i className="td-dot red" /> ปลายทาง ({activeTrip.destination})
              </span>
            </div>
          </div>

          {/* Details Panel */}
          <div className="td-panel">
            <div className="td-panel-head">
              <h2>
                <FileText className="icon" />
                รายละเอียดเที่ยวขนส่ง
              </h2>
              <span className={`td-status ${activeTrip.status.toLowerCase()}`}>
                {statusMap[activeTrip.status]?.label}
              </span>
            </div>

            <div className="td-detail-columns">
              <dl className="td-fields">
                <div className="td-field">
                  <dt>เที่ยวรถ</dt>
                  <dd>{activeTrip.tripNo}</dd>
                </div>
                <div className="td-field">
                  <dt>ทะเบียนรถ</dt>
                  <dd>{activeTrip.plateNo || "—"}</dd>
                </div>
                <div className="td-field">
                  <dt>ประเภทรถ</dt>
                  <dd>{activeTrip.vehicleType || "ยังไม่ระบุ"}</dd>
                </div>
                <div className="td-field">
                  <dt>คนขับ</dt>
                  <dd>{activeTrip.driverName || "—"}</dd>
                </div>
                <div className="td-field">
                  <dt>เบอร์ติดต่อ</dt>
                  <dd>{activeTrip.driverPhone || "—"}</dd>
                </div>
              </dl>

              <dl className="td-fields">
                <div className="td-field">
                  <dt>ต้นทาง</dt>
                  <dd>{activeTrip.origin || "คลังกลาง PCC"}</dd>
                </div>
                <div className="td-field">
                  <dt>ปลายทาง</dt>
                  <dd>{activeTrip.destination || "หน้างานโซน A"}</dd>
                </div>
                <div className="td-field">
                  <dt>วันที่ขนส่ง</dt>
                  <dd>
                    {activeTrip.departedAt
                      ? new Date(activeTrip.departedAt).toLocaleDateString("th-TH")
                      : "ตามกำหนดการ"}
                  </dd>
                </div>
                <div className="td-field">
                  <dt>กำหนดถึง</dt>
                  <dd>
                    {activeTrip.scheduledAt
                      ? new Date(activeTrip.scheduledAt).toLocaleDateString("th-TH")
                      : "—"}
                  </dd>
                </div>
                <div className="td-field">
                  <dt>ระยะทาง</dt>
                  <dd>{activeTrip.distanceKm ? `${activeTrip.distanceKm} กม.` : "ยังไม่ระบุ"}</dd>
                </div>
              </dl>
            </div>

            <div className="td-detail-actions">
              <Link
                href={`/transport/${activeTrip.id}`}
                className="px-4 py-2 rounded-lg bg-[#1675ff] text-white text-xs font-semibold hover:bg-[#0c62e0] transition-colors inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                เปิดรายละเอียดเที่ยว →
              </Link>
              {activeTrip.driverPhone && <a
                href={`tel:${activeTrip.driverPhone}`}
                className="px-3 py-2 rounded-lg border border-[#dfe8f5] text-xs font-semibold text-[#142d61] hover:bg-[#f5f8fd] transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#1675ff]" />
                ติดต่อคนขับ
              </a>}
            </div>
          </div>
        </div>
      )}

      {/* 6. Bottom Grid 1: Shipment Items & Trip History */}
      <div className="td-bottom-grid">
        {/* Shipment Items */}
        <div className="td-panel">
          <div className="td-panel-head">
            <h2>
              <Package className="icon" />
              รายการสินค้าในเที่ยวนี้
            </h2>
          </div>
          <div className="td-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>รายการสินค้า</th>
                  <th>จำนวน</th>
                  <th>หน่วย</th>
                  <th>สถานะตรวจรับ</th>
                </tr>
              </thead>
              <tbody>
                {activeTrip ? (
                  <tr>
                    <td>
                      <strong>{activeTrip.cargoDescription}</strong>
                      <small>{activeTrip.tripNo} · คำขอวัสดุ {activeTrip.requestId || "—"}</small>
                    </td>
                    <td><b>{activeTrip.cargoQty}</b></td>
                    <td>{activeTrip.unit || "แผ่น"}</td>
                    <td>
                      <span className="td-status delivered">
                        รับดี {good} / {totalQty}
                      </span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-[#7a8fab]">
                      ไม่มีข้อมูลสินค้า
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trip History */}
        <div className="td-panel">
          <div className="td-panel-head">
            <h2>
              <Truck className="icon" />
              ประวัติเที่ยวขนส่ง
            </h2>
            <span className="text-xs text-[#6c83a5] font-semibold">
              {filteredTrips.length} เที่ยวในขอบเขต
            </span>
          </div>
          <div className="td-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>เที่ยวรถ / โครงการ</th>
                  <th>ทะเบียนรถ</th>
                  <th>กำหนดถึง</th>
                  <th>สถานะ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((t) => (
                  <tr key={t.id} className={t.id === activeTrip?.id ? "bg-[#f0f6ff]" : ""}>
                    <td>
                      <strong>{t.tripNo}</strong>
                      <small>{t.projectCode} · {t.cargoDescription}</small>
                    </td>
                    <td>{t.plateNo || "—"}</td>
                    <td>
                      {t.scheduledAt
                        ? new Date(t.scheduledAt).toLocaleDateString("th-TH")
                        : "—"}
                    </td>
                    <td>
                      <span className={`td-status ${t.status.toLowerCase()}`}>
                        {statusMap[t.status]?.label}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedTripId(t.id)}
                        className="text-xs text-[#1675ff] font-semibold hover:underline"
                      >
                        เลือกดู →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7. Bottom Grid 2: Receiving Results & Issues */}
      <div className="td-bottom-grid">
        {/* Receiving Results */}
        <div className="td-panel">
          <div className="td-panel-head">
            <h2>
              <CheckCircle2 className="icon" />
              ผลตรวจรับปลายทาง
            </h2>
          </div>
          <div className="td-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ใบตรวจรับ</th>
                  <th>รับดี</th>
                  <th>เสียหาย</th>
                  <th>ขาด</th>
                  <th>ส่งคลัง</th>
                </tr>
              </thead>
              <tbody>
                {activeTrip?.receiving ? (
                  <tr>
                    <td>
                      <strong>{activeTrip.receiving.id}</strong>
                      <small>
                        {activeTrip.receiving.receivedAt
                          ? new Date(activeTrip.receiving.receivedAt).toLocaleDateString("th-TH")
                          : "ยืนยันแล้ว"}
                      </small>
                    </td>
                    <td className="text-[#09a65f] font-bold">{good}</td>
                    <td className="text-[#ed4053] font-bold">{damaged}</td>
                    <td className="text-[#d97706] font-bold">{missing}</td>
                    <td>
                      <span className="td-status delivered">{activeTrip.receiving.status === "CONFIRMED" || activeTrip.receiving.status === "COMPLETED" ? "ยืนยันแล้ว" : activeTrip.receiving.status === "PARTIAL" ? "รับบางส่วน" : activeTrip.receiving.status === "PENDING" ? "รอยืนยัน" : activeTrip.receiving.status}</span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-[#7a8fab] py-4">
                      ยังไม่มีการบันทึกผลตรวจรับสำหรับเที่ยวนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transport Issues */}
        <div className="td-panel">
          <div className="td-panel-head">
            <h2>
              <AlertTriangle className="icon text-[#d97706]" />
              ปัญหาขนส่งและหลักฐาน
            </h2>
          </div>
          <div className="td-clear-state">
            {damaged > 0 || missing > 0 || activeTrip.receiving?.damageNotes ? <>
              <AlertTriangle className="w-5 h-5 text-[#d97706]" />
              <div><strong>เสียหาย {damaged} / ขาด {missing} {activeTrip.unit}</strong>
                {activeTrip.receiving?.damageNotes && <p>{activeTrip.receiving.damageNotes}</p>}
                {activeTrip.receiving?.notes && <p>{activeTrip.receiving.notes}</p>}
              </div>
            </> : <><CheckCircle2 className="w-5 h-5 text-[#09a65f]" /><span>ยังไม่มีปัญหาขนส่งที่บันทึกสำหรับเที่ยวนี้</span></>}
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
