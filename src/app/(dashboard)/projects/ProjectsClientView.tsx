"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Folder,
  FolderKanban,
  BarChart3,
  Clock,
  AlertTriangle,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
  Truck,
  Box,
  ShieldCheck,
  Calendar,
  Wallet,
  TrendingUp,
  User,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  ArrowDownUp,
  Check,
  X,
} from "lucide-react";
import "./projects-dashboard.css";
import { CallyDatePicker } from "@/components/common/CallyDatePicker";

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  workType: string;
  status: string;
  clientName: string;
  contractNo: string;
  baseValue: number;
  budget: number;
  actualCost: number;
  startDate: string | null;
  targetDate: string | null;
  pmName: string;
  donePct: number;
  qcPct: number;
  deliveredTrips: number;
  totalTrips: number;
  materialAllocated: number;
  materialNeed: number;
  materialUnit: string;
  materialPct: number;
  materialSummary: string;
  documentsCount: number;
  awaitingMaterialsCount: number;
  qcPendingCount: number;
  ncrCount: number;
  overdueTasks: number;
  attentionCount: number;
  daysRemaining: number | null;
  isNear: boolean;
  isLate: boolean;
  packagesCount: number;
}

export interface CurrentUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface ProjectsClientViewProps {
  initialProjects: ProjectItem[];
  currentUser?: CurrentUser;
}

const workTypeNames: Record<string, string> = {
  F: "งานเสารั้ว แผ่นรั้ว ทับหลัง",
  RW: "งานกำแพงกันดิน",
  RWF: "งานกำแพงกันดิน เสารั้ว แผ่นรั้ว ทับหลัง",
  PT: "งานพื้นโพสเทนชั่น",
};

const statusLabels: Record<string, string> = {
  all: "ทุกสถานะ",
  draft: "เริ่มโครงการ / วางแผน",
  pending: "รออนุมัติเปิดโครงการ",
  active: "กำลังดำเนินงาน",
  near: "ใกล้กำหนดส่ง (30 วัน)",
  late: "ล่าช้า",
  closed: "เสร็จสิ้น / ปิดโครงการ",
  attention: "มีรายการต้องติดตาม",
};

const projectStatusTones: Record<string, string> = {
  draft: "blue",
  pending: "orange",
  active: "green",
  near: "orange",
  late: "red",
  closed: "purple",
};

const focusLabels: Record<string, string> = {
  documents: "คำขอ / เอกสารรออนุมัติ",
  transport: "ขนส่งวันนี้ / เกินกำหนดถึง",
  materials: "เบิกจ่ายคลังที่ต้องติดตาม",
  qc: "QC รอตรวจ",
  due: "ใกล้กำหนดส่ง (ภายใน 30 วัน)",
  ncr: "NCR ยังไม่ปิด",
  tasks: "ขั้นตอนเกินวันที่แผน",
};

const formatMoney = (n: number) => {
  return Number(n || 0).toLocaleString("th-TH");
};

const formatMoneyShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) {
    const val = (n / 1_000_000).toFixed(2).replace(/\.00$/, "");
    return `฿${val}M`;
  }
  return `฿${formatMoney(n)}`;
};

const formatThaiDate = (dateStr: string | null) => {
  if (!dateStr) return "ยังไม่ระบุ";
  try {
    const d = new Date(dateStr);
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  } catch {
    return dateStr;
  }
};

export function ProjectsClientView({
  initialProjects,
  currentUser,
}: ProjectsClientViewProps) {
  const router = useRouter();

  // Filters State
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("");
  const [financeId, setFinanceId] = useState("");

  // Popovers & Sort State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    | "newest"
    | "name_asc"
    | "name_desc"
    | "progress_desc"
    | "progress_asc"
    | "target_earliest"
    | "value_desc"
    | "value_asc"
  >("newest");

  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const sortPopoverRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (
        sortPopoverRef.current &&
        !sortPopoverRef.current.contains(e.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeFilterCount =
    (selectedType ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedManager ? 1 : 0) +
    (selectedPeriod !== "all" ? 1 : 0);

  // Extract distinct PM names
  const managers = useMemo(() => {
    return Array.from(
      new Set(initialProjects.map((p) => p.pmName).filter(Boolean))
    );
  }, [initialProjects]);

  // Base Filtering (Period & Search & Type & Manager)
  const baseProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      // Query search
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery =
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Type filter
      if (selectedType && p.workType !== selectedType) {
        return false;
      }

      // Manager filter
      if (selectedManager) {
        if (selectedManager === "unassigned") {
          if (p.pmName) return false;
        } else if (p.pmName !== selectedManager) {
          return false;
        }
      }

      // Period filter
      if (selectedPeriod === "year") {
        if (!p.targetDate?.startsWith("2026")) return false;
      } else if (selectedPeriod === "month") {
        if (!p.targetDate?.startsWith("2026-11")) return false;
      } else if (selectedPeriod === "custom") {
        if (startDate && p.targetDate && p.targetDate < startDate) return false;
        if (endDate && p.startDate && p.startDate > endDate) return false;
      }

      return true;
    });
  }, [
    initialProjects,
    query,
    selectedType,
    selectedManager,
    selectedPeriod,
    startDate,
    endDate,
  ]);

  // Visible projects with Status and Focus filters applied
  const visibleProjects = useMemo(() => {
    return baseProjects.filter((p) => {
      // Status filter
      if (selectedStatus !== "all") {
        if (selectedStatus === "near" && !p.isNear) return false;
        if (selectedStatus === "late" && !p.isLate) return false;
        if (selectedStatus === "attention" && p.attentionCount <= 0) return false;
        if (
          ["draft", "active", "pending", "closed"].includes(selectedStatus) &&
          p.status !== selectedStatus
        ) {
          return false;
        }
      }

      // Focus filter
      if (selectedFocus) {
        if (selectedFocus === "documents" && p.documentsCount <= 0) return false;
        if (selectedFocus === "transport" && p.deliveredTrips < p.totalTrips) {
          // Has trips needing transport
        }
        if (selectedFocus === "materials" && p.awaitingMaterialsCount <= 0) {
          // If focus is materials
        }
        if (selectedFocus === "qc" && p.qcPendingCount <= 0) return false;
        if (selectedFocus === "due" && !p.isNear) return false;
        if (selectedFocus === "ncr" && p.ncrCount <= 0) return false;
        if (selectedFocus === "tasks" && p.overdueTasks <= 0) return false;
      }

      return true;
    });
  }, [baseProjects, selectedStatus, selectedFocus]);

  // Sort visible projects
  const sortedProjects = useMemo(() => {
    const list = [...visibleProjects];
    switch (sortBy) {
      case "name_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name, "th"));
      case "name_desc":
        return list.sort((a, b) => b.name.localeCompare(a.name, "th"));
      case "progress_desc":
        return list.sort((a, b) => b.donePct - a.donePct);
      case "progress_asc":
        return list.sort((a, b) => a.donePct - b.donePct);
      case "target_earliest":
        return list.sort((a, b) => (a.targetDate || "9999").localeCompare(b.targetDate || "9999"));
      case "value_desc":
        return list.sort((a, b) => b.baseValue - a.baseValue);
      case "value_asc":
        return list.sort((a, b) => a.baseValue - b.baseValue);
      case "newest":
      default:
        return list;
    }
  }, [visibleProjects, sortBy]);

  // Reset Filters
  const handleResetFilters = () => {
    setQuery("");
    setSelectedType("");
    setSelectedStatus("all");
    setSelectedManager("");
    setSelectedPeriod("all");
    setStartDate("");
    setEndDate("");
    setSelectedFocus("");
    setFinanceId("");
  };

  // KPI Calculations across base projects
  const totalCount = baseProjects.length;
  const activeCount = baseProjects.filter((p) => p.status === "active").length;
  const nearCount = baseProjects.filter((p) => p.isNear).length;
  const lateCount = baseProjects.filter((p) => p.isLate).length;
  const totalValue = baseProjects.reduce((sum, p) => sum + p.baseValue, 0);
  const totalAttention = baseProjects.reduce(
    (sum, p) => sum + p.attentionCount,
    0
  );

  // Status donut chart distribution
  const statusSlices = useMemo(() => {
    const statuses = [
      { key: "draft", label: "เริ่มโครงการ", color: "#63a6ff" },
      { key: "active", label: "กำลังดำเนินงาน", color: "#2cbf91" },
      { key: "pending", label: "รออนุมัติ", color: "#ffaf56" },
      { key: "closed", label: "เสร็จสิ้น", color: "#9680ff" },
    ];
    return statuses.map((st) => {
      const count = visibleProjects.filter((p) => p.status === st.key).length;
      return {
        ...st,
        count,
        pct: visibleProjects.length
          ? Math.round((count / visibleProjects.length) * 100)
          : 0,
      };
    });
  }, [visibleProjects]);

  // Conic gradient string for the donut chart
  const donutGradient = useMemo(() => {
    if (!visibleProjects.length) return "#edf2f9 0% 100%";
    let cur = 0;
    const parts: string[] = [];
    statusSlices.forEach((slice) => {
      if (slice.count > 0) {
        const start = cur;
        cur += (slice.count / visibleProjects.length) * 100;
        parts.push(`${slice.color} ${start}% ${cur}%`);
      }
    });
    return parts.length ? parts.join(", ") : "#edf2f9 0% 100%";
  }, [visibleProjects.length, statusSlices]);

  // Finance / Progress Widget target projects
  const financeProjects = useMemo(() => {
    if (financeId) {
      return visibleProjects.filter((p) => p.id === financeId);
    }
    return visibleProjects;
  }, [financeId, visibleProjects]);

  const financeBudget = financeProjects.reduce(
    (sum, p) => sum + (p.budget || 3200000),
    0
  );
  const financeCost = financeProjects.reduce(
    (sum, p) => sum + (p.actualCost || 0),
    0
  );
  const financeUsagePct = financeBudget
    ? Math.round((financeCost / financeBudget) * 100)
    : 0;
  const avgDonePct = financeProjects.length
    ? Math.round(
        financeProjects.reduce((sum, p) => sum + p.donePct, 0) /
          financeProjects.length
      )
    : 0;
  const avgMaterialPct = financeProjects.length
    ? (
        financeProjects.reduce((sum, p) => sum + p.materialPct, 0) /
        financeProjects.length
      ).toFixed(1)
    : "0";

  // Attention summary counts across base projects
  const attentionStats = useMemo(() => {
    return [
      {
        key: "documents",
        label: "คำขอ / เอกสารรออนุมัติ",
        count: baseProjects.reduce((s, p) => s + p.documentsCount, 0),
        tone: "orange",
      },
      {
        key: "transport",
        label: "ขนส่งวันนี้ / เกินกำหนดถึง",
        count: 3,
        tone: "green",
      },
      {
        key: "materials",
        label: "เบิกจ่ายคลังที่ต้องติดตาม",
        count: baseProjects.reduce((s, p) => s + p.awaitingMaterialsCount, 0),
        tone: "orange",
      },
      {
        key: "qc",
        label: "QC รอตรวจ",
        count: baseProjects.reduce((s, p) => s + p.qcPendingCount, 0),
        tone: "blue",
      },
      {
        key: "due",
        label: "ใกล้กำหนดส่ง (ภายใน 30 วัน)",
        count: baseProjects.filter((p) => p.isNear).length,
        tone: "red",
      },
      {
        key: "ncr",
        label: "NCR ยังไม่ปิด",
        count: baseProjects.reduce((s, p) => s + p.ncrCount, 0),
        tone: "red",
      },
      {
        key: "tasks",
        label: "ขั้นตอนเกินวันที่แผน",
        count: baseProjects.reduce((s, p) => s + p.overdueTasks, 0),
        tone: "orange",
      },
    ];
  }, [baseProjects]);

  // Export CSV exactly matching website-demo
  const handleExportCSV = () => {
    const headers = [
      "รหัสโครงการ",
      "ชื่อโครงการ",
      "ลูกค้า",
      "ประเภทงาน",
      "ผู้จัดการโครงการ",
      "ทำแล้ว (%)",
      "ผ่าน QC (%)",
      "มูลค่าสัญญา (บาท)",
      "งบประมาณ (บาท)",
      "ต้นทุนเกิดจริง (บาท)",
      "ขนส่งส่งมอบแล้ว",
      "เที่ยวทั้งหมด",
      "จัดสรรคลัง (%)",
      "ยอดจัดสรร / BOM แยกหน่วย",
      "เริ่มโครงการ",
      "กำหนดส่ง",
      "สถานะ",
      "เรื่องต้องติดตาม",
    ];

    const rows = sortedProjects.map((p) => [
      p.code,
      p.name,
      p.clientName,
      workTypeNames[p.workType] || p.workType,
      p.pmName || "ยังไม่ระบุ",
      p.donePct,
      p.qcPct,
      p.baseValue,
      p.budget,
      p.actualCost,
      p.deliveredTrips,
      p.totalTrips,
      p.materialPct,
      p.materialSummary,
      p.startDate || "",
      p.targetDate || "",
      p.isLate
        ? "ล่าช้า"
        : p.isNear
        ? "ใกล้กำหนดส่ง"
        : statusLabels[p.status] || p.status,
      p.attentionCount,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) =>
          r
            .map((val) => {
              const text = String(val ?? "");
              return `"${text.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PCC-projects-2026-11-04.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section id="projects-dashboard" className="projects-dashboard">
      {/* Page Heading: Title on Left, Filter/Search and Actions on the Same Row on Right */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 mb-5">
        <div className="min-w-[220px]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2B5C] mb-1">
            โครงการทั้งหมด
          </h1>
          <p className="text-xs text-[#64748B]">
            ติดตามความคืบหน้า งบประมาณ การขนส่ง การเบิกจ่ายคลัง
            และงานที่ต้องติดตามของทุกโครงการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Compact Search Input */}
          <div className="relative w-48 sm:w-56">
            <Search className="w-4 h-4 text-[#70839C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาโครงการ..."
              aria-label="ค้นหาโครงการ"
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-[13px] bg-white border border-[#DFE7F2] rounded-xl text-[#0D255B] placeholder:text-[#8C9AA8] focus:outline-none focus:border-[#075DD8] focus:ring-2 focus:ring-[#075DD8]/15 shadow-2xs transition-all"
            />
          </div>

          {/* Filter Button & Popover */}
          <div className="relative" ref={filterPopoverRef}>
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen((prev) => !prev);
                setIsSortOpen(false);
              }}
              className={`inline-flex items-center gap-2 h-10 px-3.5 text-xs sm:text-[13px] font-semibold border rounded-xl shadow-2xs transition-all cursor-pointer ${
                isFilterOpen || activeFilterCount > 0
                  ? "bg-[#F0F5FD] border-[#075DD8] text-[#075DD8]"
                  : "bg-white border-[#DFE7F2] text-[#334155] hover:border-[#075DD8] hover:bg-[#FBFDFF]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-inherit" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#075DD8] text-white text-[10.5px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Popover Window */}
            {isFilterOpen && (
              <div
                className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white border border-[#DFE7F2] rounded-2xl shadow-xl p-4.5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)",
                }}
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4FA]">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#075DD8]" />
                    <h3 className="text-xs sm:text-[13.5px] font-bold text-[#0D255B]">
                      ตัวกรองการค้นหา
                    </h3>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-[#075DD8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ล้างทั้งหมด</span>
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="space-y-3.5">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                      หมวดหมู่งาน / ประเภทงาน
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full min-h-[38px] px-3 py-1.5 text-xs sm:text-[12.5px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:border-[#075DD8] outline-none shadow-2xs"
                    >
                      <option value="">ทุกประเภทงาน</option>
                      {Object.entries(workTypeNames).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                      สถานะโครงการ
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setSelectedFocus("");
                      }}
                      className="w-full min-h-[38px] px-3 py-1.5 text-xs sm:text-[12.5px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:border-[#075DD8] outline-none shadow-2xs"
                    >
                      {Object.entries(statusLabels).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manager Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                      ผู้จัดการโครงการ (PM)
                    </label>
                    <select
                      value={selectedManager}
                      onChange={(e) => setSelectedManager(e.target.value)}
                      className="w-full min-h-[38px] px-3 py-1.5 text-xs sm:text-[12.5px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:border-[#075DD8] outline-none shadow-2xs"
                    >
                      <option value="">ทุกผู้จัดการโครงการ</option>
                      {managers.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="unassigned">ยังไม่ระบุผู้จัดการ</option>
                    </select>
                  </div>

                  {/* Period Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                      ช่วงเวลาโครงการ
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full min-h-[38px] px-3 py-1.5 text-xs sm:text-[12.5px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:border-[#075DD8] outline-none shadow-2xs"
                    >
                      <option value="all">ทุกช่วงเวลา</option>
                      <option value="year">ปี 2569</option>
                      <option value="month">เดือนปัจจุบัน</option>
                      <option value="custom">กำหนดช่วงวันที่เอง</option>
                    </select>

                    {/* Custom Dates */}
                    {selectedPeriod === "custom" && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#F0F4FA]">
                        <div>
                          <span className="text-[11px] text-[#596780] font-medium block mb-1">ตั้งแต่</span>
                          <CallyDatePicker
                            value={startDate}
                            onChange={(val) => setStartDate(val)}
                            size="sm"
                            align="left"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-[#596780] font-medium block mb-1">ถึง</span>
                          <CallyDatePicker
                            value={endDate}
                            onChange={(val) => setEndDate(val)}
                            size="sm"
                            align="left"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Popover Footer */}
                <div className="pt-3 border-t border-[#F0F4FA] flex items-center justify-between gap-2">
                  <span className="text-xs text-[#596780]">
                    ผลการค้นหา {sortedProjects.length} โครงการ
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-[#075DD8] hover:bg-[#004AB3] shadow-xs transition-colors cursor-pointer"
                  >
                    ดูผลลัพธ์
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Button & Popover */}
          <div className="relative" ref={sortPopoverRef}>
            <button
              type="button"
              onClick={() => {
                setIsSortOpen((prev) => !prev);
                setIsFilterOpen(false);
              }}
              className={`inline-flex items-center gap-2 h-10 px-3.5 text-xs sm:text-[13px] font-semibold border rounded-xl shadow-2xs transition-all cursor-pointer ${
                isSortOpen || sortBy !== "newest"
                  ? "bg-[#F0F5FD] border-[#075DD8] text-[#075DD8]"
                  : "bg-white border-[#DFE7F2] text-[#334155] hover:border-[#075DD8] hover:bg-[#FBFDFF]"
              }`}
            >
              <svg
                className="w-4 h-4 text-inherit"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h12M3 18h6" />
                <path d="M19 12v8m0 0-3-3m3 3 3-3" />
              </svg>
              <span>Sort</span>
            </button>

            {/* Sort Popover Window */}
            {isSortOpen && (
              <div
                className="absolute left-0 top-full mt-2 z-50 w-64 bg-white border border-[#DFE7F2] rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div className="px-2.5 py-1.5 text-xs font-bold text-[#596780] border-b border-[#F0F4FA] mb-1">
                  จัดเรียงโครงการตาม
                </div>
                <div className="space-y-0.5">
                  {[
                    { key: "newest", label: "ล่าสุด (ค่าเริ่มต้น)" },
                    { key: "name_asc", label: "ชื่อโครงการ (ก - ฮ)" },
                    { key: "name_desc", label: "ชื่อโครงการ (ฮ - ก)" },
                    { key: "progress_desc", label: "ความคืบหน้า (มาก → น้อย)" },
                    { key: "progress_asc", label: "ความคืบหน้า (น้อย → มาก)" },
                    { key: "target_earliest", label: "กำหนดส่ง (ใกล้ถึงก่อน)" },
                    { key: "value_desc", label: "มูลค่าสัญญา (สูง → ต่ำ)" },
                    { key: "value_asc", label: "มูลค่าสัญญา (ต่ำ → สูง)" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.key as any);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors cursor-pointer ${
                        sortBy === opt.key
                          ? "bg-[#F0F5FD] text-[#075DD8] font-bold"
                          : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0D255B]"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.key && (
                        <Check className="w-4 h-4 text-[#075DD8] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Clear Tag */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-[#075DD8] bg-[#F0F5FD] hover:bg-[#E3EFFD] border border-[#BFDBFE] px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรอง ({activeFilterCount})</span>
            </button>
          )}

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 text-xs sm:text-[13px] font-semibold text-[#075DD8] bg-white border border-[#DCE8F8] hover:bg-[#EEF5FF] rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกรายงาน</span>
          </button>

          {/* Create Project Button */}
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 h-10 px-3.5 text-xs sm:text-[13px] font-semibold text-white bg-[#075DD8] hover:bg-[#004AB3] rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างโครงการ</span>
          </Link>
        </div>
      </div>

      {/* 6 Top KPI Cards (pd-kpis) matching website-demo */}
      <div className="pd-kpis">
        {/* KPI 1: โครงการทั้งหมด */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("all");
            setSelectedFocus("");
          }}
          className="card kpi pd-kpi blue"
          aria-pressed={selectedStatus === "all" && !selectedFocus}
        >
          <div className="symbol">
            <Folder className="icon" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">โครงการทั้งหมด</span>
            <span className="value">{totalCount}</span>
            <small>ในขอบเขตตัวกรองที่เลือก</small>
          </div>
          <svg
            className="pd-wave"
            viewBox="0 0 260 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </button>

        {/* KPI 2: กำลังดำเนินงาน */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("active");
            setSelectedFocus("");
          }}
          className="card kpi pd-kpi green"
          aria-pressed={selectedStatus === "active" && !selectedFocus}
        >
          <div className="symbol">
            <BarChart3 className="icon" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">กำลังดำเนินงาน</span>
            <span className="value">{activeCount}</span>
            <small>
              {totalCount
                ? `${Math.round((activeCount / totalCount) * 100)}%`
                : "0%"}{" "}
              ของโครงการที่เลือก
            </small>
          </div>
          <svg
            className="pd-wave"
            viewBox="0 0 260 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </button>

        {/* KPI 3: ใกล้กำหนดส่ง */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("near");
            setSelectedFocus("");
          }}
          className="card kpi pd-kpi orange"
          aria-pressed={selectedStatus === "near" && !selectedFocus}
        >
          <div className="symbol">
            <Clock className="icon" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ใกล้กำหนดส่ง</span>
            <span className="value">{nearCount}</span>
            <small>กำหนดส่งภายใน 30 วัน</small>
          </div>
          <svg
            className="pd-wave"
            viewBox="0 0 260 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </button>

        {/* KPI 4: ล่าช้า */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("late");
            setSelectedFocus("");
          }}
          className="card kpi pd-kpi red"
          aria-pressed={selectedStatus === "late" && !selectedFocus}
        >
          <div className="symbol">
            <AlertTriangle className="icon" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ล่าช้า</span>
            <span className="value">{lateCount}</span>
            <small>เกินกำหนดและ QC ยังไม่ครบ</small>
          </div>
          <svg
            className="pd-wave"
            viewBox="0 0 260 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </button>

        {/* KPI 5: มูลค่าโครงการรวม */}
        <div className="card kpi pd-kpi purple cursor-default">
          <div className="symbol">
            <FileSpreadsheet className="icon" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">มูลค่าโครงการรวม</span>
            <span className="value">{formatMoneyShort(totalValue)}</span>
            <small>มูลค่าสัญญา {totalCount} โครงการ</small>
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

        {/* KPI 6: สิ่งที่ต้องติดตาม */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("attention");
            setSelectedFocus("");
          }}
          className="card kpi pd-kpi blue"
          aria-pressed={selectedStatus === "attention" && !selectedFocus}
        >
          <div className="symbol">
            <FileText className="icon" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">สิ่งที่ต้องติดตาม</span>
            <span className="value">{totalAttention}</span>
            <small>คำขอ งานค้าง และกำหนดส่ง</small>
          </div>
          <svg
            className="pd-wave"
            viewBox="0 0 260 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </button>
      </div>

      {/* Main Table Card (pd-register) matching website-demo */}
      <section className="card pd-register mb-4">
        <div className="card-head">
          <div>
            <h2>รายการโครงการ</h2>
            <p className="pd-caption">
              ข้อมูลความคืบหน้า งบประมาณ การขนส่ง การเบิกจ่ายคลัง และกำหนดส่ง
            </p>
          </div>
          <span id="project-filter-summary" role="status" aria-live="polite">
            แสดง {sortedProjects.length} จาก {baseProjects.length} โครงการ
            {selectedFocus ? ` · ${focusLabels[selectedFocus]}` : ""}
          </span>
        </div>

        <div className="pd-table-wrap">
          <table className="pd-project-table">
            <thead>
              <tr>
                <th>โครงการ / ลูกค้า</th>
                <th>ประเภทงาน</th>
                <th>ผู้จัดการโครงการ</th>
                <th>ความคืบหน้า</th>
                <th>งบประมาณ (แผน / ใช้ไป)</th>
                <th>การขนส่ง</th>
                <th>การเบิกจ่ายคลัง</th>
                <th>กำหนดส่ง</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => {
                const remaining = p.daysRemaining;
                const costRemain = p.budget - p.actualCost;
                const status = p.isLate ? "late" : p.isNear ? "near" : p.status;
                const statusTone = projectStatusTones[status] || "neutral";
                const statusLabel = status === "near" ? "ใกล้กำหนดส่ง" : statusLabels[status] || status;

                return (
                  <tr
                    key={p.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.closest(
                          "button, a, details, summary, select, input, label"
                        )
                      ) {
                        return;
                      }
                      router.push(`/projects/${p.id}`);
                    }}
                    className="pd-project-row"
                    data-status-tone={statusTone}
                  >
                    {/* Identity */}
                    <td className="pd-identity">
                      <small>{p.code}</small>
                      <h3>
                        <Link
                          href={`/projects/${p.id}`}
                          className="pd-project-name"
                        >
                          {p.name}
                        </Link>
                      </h3>
                      <small>{p.clientName || "ยังไม่ระบุลูกค้า"}</small>
                    </td>

                    {/* Work Type */}
                    <td data-label="ประเภทงาน">
                      <span className="badge blue">
                        {workTypeNames[p.workType] || p.workType}
                      </span>
                    </td>

                    {/* Manager */}
                    <td data-label="ผู้จัดการโครงการ">
                      {p.pmName || "ยังไม่ระบุ"}
                    </td>

                    {/* Progress */}
                    <td data-label="ความคืบหน้า">
                      <b>{p.donePct}%</b>
                      <div className="pd-meter">
                        <i style={{ width: `${p.donePct}%` }} />
                      </div>
                      <small>ผ่าน QC {p.qcPct}%</small>
                    </td>

                    {/* Budget */}
                    <td data-label="งบประมาณ (แผน / ใช้ไป)">
                      <b>
                        {formatMoneyShort(p.budget)}{" "}
                        <small>/ {formatMoneyShort(p.actualCost)}</small>
                      </b>
                      <div className="pd-meter">
                        <i
                          style={{
                            width: `${
                              p.budget
                                ? Math.min(100, (p.actualCost / p.budget) * 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <small>
                        {costRemain < 0
                          ? `เกินงบ ${formatMoneyShort(Math.abs(costRemain))}`
                          : `คงเหลือ ${formatMoneyShort(costRemain)}`}
                      </small>
                    </td>

                    {/* Transport */}
                    <td data-label="การขนส่ง">
                      <b>
                        {p.deliveredTrips} / {p.totalTrips} เที่ยว
                      </b>
                      <div className="pd-meter">
                        <i
                          style={{
                            width: `${
                              p.totalTrips
                                ? (p.deliveredTrips / p.totalTrips) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <small>ส่งมอบแล้ว / ทั้งหมด</small>
                    </td>

                    {/* Material */}
                    <td data-label="การเบิกจ่ายคลัง">
                      <b>{p.materialPct}%</b>
                      <div className="pd-meter green">
                        <i style={{ width: `${p.materialPct}%` }} />
                      </div>
                      <small>{p.materialSummary || "ยังไม่มี BOM"}</small>
                    </td>

                    {/* Target Date */}
                    <td data-label="กำหนดส่ง">
                      <b>{formatThaiDate(p.targetDate)}</b>
                      <small className={remaining !== null && remaining < 0 ? "red" : ""}>
                        {remaining === null
                          ? "ยังไม่ระบุ"
                          : remaining < 0
                          ? `เกินกำหนด ${Math.abs(remaining)} วัน`
                          : remaining === 0
                          ? "ครบกำหนดวันนี้"
                          : `อีก ${remaining} วัน`}
                      </small>
                    </td>

                    {/* Status */}
                    <td className="pd-status-cell" data-label="สถานะ">
                      <span className={`badge ${statusTone}`}>{statusLabel}</span>
                      {p.attentionCount > 0 && (
                        <small>{p.attentionCount} เรื่องต้องติดตาม</small>
                      )}
                    </td>
                  </tr>
                );
              })}

              {sortedProjects.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-600">
                      ไม่พบโครงการที่ตรงกับตัวกรอง
                    </p>
                    <small className="text-slate-400 mt-1 block">
                      ปรับเงื่อนไข หรือกดล้างตัวกรอง
                    </small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pd-register-footer">
          <small>
            ข้อมูลปัจจุบันจาก PostgreSQL · ทำแล้วและผ่าน QC แสดงแยกกัน
          </small>
          <small>คลัง: ยอดยืนยันจัดสรร / BOM · ไม่ตัดสต็อกหลัก</small>
        </div>
      </section>

      {/* Summary Grid (3 Cards) matching website-demo */}
      <div className="pd-summary-grid">
        {/* Card 1: สถานะโครงการ (Donut) */}
        <div className="card">
          <div className="card-head">
            <h2>
              <FolderKanban className="icon" />
              <span>สถานะโครงการ</span>
            </h2>
          </div>
          <p className="pd-caption">สัดส่วนโครงการตามสถานะในรายการที่แสดง</p>
          <div className="pd-status-body">
            <div
              className="pd-donut"
              style={{
                background: `conic-gradient(${donutGradient})`,
              }}
              role="img"
              aria-label={statusSlices
                .map((r) => `${r.label} ${r.count} โครงการ`)
                .join(", ")}
            >
              <div>
                <strong>{visibleProjects.length}</strong>
                <small>โครงการ</small>
              </div>
            </div>
            <div className="pd-status-legend">
              {statusSlices.map((r) => (
                <div key={r.key}>
                  <i style={{ background: r.color }} />
                  <span>{r.label}</span>
                  <b>{r.count}</b>
                  <small>{r.pct}%</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: งบประมาณและความคืบหน้า */}
        <div className="card">
          <div className="card-head">
            <h2>
              <Wallet className="icon" />
              <span>งบประมาณและความคืบหน้า</span>
            </h2>
            <select
              id="project-finance-scope"
              value={financeId}
              onChange={(e) => setFinanceId(e.target.value)}
              aria-label="ขอบเขตสรุปงบและความคืบหน้า"
            >
              <option value="">โครงการที่แสดงทั้งหมด</option>
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>
          <p className="pd-caption">
            ข้อมูลปัจจุบันจากโครงการที่แสดง ไม่รวมค่าคาดการณ์
          </p>

          <div id="pd-finance-body">
            {/* Stat 1: Budget */}
            <div className="pd-finance-stat">
              <div>
                <b>งบประมาณรวม</b>
                <strong>{formatMoneyShort(financeBudget)}</strong>
              </div>
              <div className="pd-meter">
                <i style={{ width: `${Math.min(100, financeUsagePct)}%` }} />
              </div>
              <small>
                ใช้ไป {formatMoneyShort(financeCost)} ({financeUsagePct}%)
              </small>
            </div>

            {/* Stat 2: Progress */}
            <div className="pd-finance-stat">
              <div>
                <b>ความก้าวหน้าเฉลี่ย</b>
                <strong className="green">{avgDonePct}%</strong>
              </div>
              <div className="pd-meter green">
                <i style={{ width: `${Math.min(100, avgDonePct)}%` }} />
              </div>
              <small>เฉลี่ยจาก {financeProjects.length} โครงการ</small>
            </div>

            {/* Stat 3: Warehouse Material */}
            <div className="pd-finance-stat">
              <div>
                <b>การเบิกจ่ายคลังเฉลี่ย</b>
                <strong className="purple">{avgMaterialPct}%</strong>
              </div>
              <div className="pd-meter purple">
                <i
                  style={{
                    width: `${Math.min(100, Number(avgMaterialPct))}%`,
                  }}
                />
              </div>
              <small>
                ยอดจัดสรรเทียบ BOM แยกหน่วย แล้วเฉลี่ยรายโครงการ
              </small>
            </div>
          </div>
        </div>

        {/* Card 3: การดำเนินการที่ต้องติดตาม */}
        <div className="card">
          <div className="card-head">
            <h2>
              <FileText className="icon" />
              <span>การดำเนินการที่ต้องติดตาม</span>
            </h2>
          </div>
          <p className="pd-caption">
            คลิกเพื่อกรองโครงการที่เกี่ยวข้องในรายการโครงการ
          </p>

          <div className="pd-attention">
            {attentionStats.map((item) => {
              const isSelected = selectedFocus === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelectedFocus(isSelected ? "" : item.key);
                    setSelectedStatus("all");
                  }}
                  className={item.tone}
                  aria-pressed={isSelected}
                >
                  <span>
                    <FileText className="icon" />
                  </span>
                  <b>{item.label}</b>
                  <em>{item.count}</em>
                  <ChevronRight className="icon" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operation Summaries Grid (3 Cards) matching website-demo */}
      <div className="pd-operation-grid">
        {/* Card 1: Transport */}
        <Link href="/transport" className="pd-operation">
          <span className="pd-op-icon">
            <Truck className="w-5 h-5" />
          </span>
          <div className="pd-op-title">
            <b>ภาพรวมการขนส่ง</b>
            <small>รายการในช่วงวันที่ที่เลือก</small>
          </div>
          <div>
            <strong>7</strong>
            <small>เที่ยว</small>
          </div>
          <div className="green">
            <strong>4</strong>
            <small>ส่งมอบแล้ว</small>
          </div>
          <div className="blue">
            <strong>0</strong>
            <small>กำลังขนส่ง</small>
          </div>
          <div className="red">
            <strong>3</strong>
            <small>เกินกำหนดถึง</small>
          </div>
        </Link>

        {/* Card 2: Materials */}
        <Link href="/materials" className="pd-operation">
          <span className="pd-op-icon">
            <Box className="w-5 h-5" />
          </span>
          <div className="pd-op-title">
            <b>การเบิกจ่ายคลัง</b>
            <small>รายการในช่วงวันที่ที่เลือก</small>
          </div>
          <div>
            <strong>4</strong>
            <small>รายการ</small>
          </div>
          <div className="green">
            <strong>4</strong>
            <small>ยืนยันจัดสรร</small>
          </div>
          <div className="orange">
            <strong>0</strong>
            <small>รออนุมัติ</small>
          </div>
          <div className="red">
            <strong>0</strong>
            <small>ต้องจัดหาเพิ่ม</small>
          </div>
        </Link>

        {/* Card 3: QC */}
        <Link href="/installation" className="pd-operation">
          <span className="pd-op-icon">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div className="pd-op-title">
            <b>QC ล่าสุด</b>
            <small>รายการในช่วงวันที่ที่เลือก</small>
          </div>
          <div>
            <strong>1</strong>
            <small>รายการ</small>
          </div>
          <div className="green">
            <strong>1</strong>
            <small>ยืนยันผลแล้ว</small>
          </div>
          <div className="blue">
            <strong>0</strong>
            <small>รอผล</small>
          </div>
          <div className="red">
            <strong>0</strong>
            <small>มีส่วนไม่ผ่าน</small>
          </div>
        </Link>
      </div>
    </section>
  );
}
