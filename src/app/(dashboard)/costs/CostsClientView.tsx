"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  PieChart,
  BarChart3,
  CheckCircle2,
  FileText,
  Folder,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import "./costs-dashboard.css";

export interface CostsClientViewProps {
  allProjects: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  selectedProjectId: string;
  financialSummary: {
    contractValue: number;
    approvedBudget: number;
    actualCost: number;
    remainingBudget: number;
    billedAmount: number;
    paidAmount: number;
    overdueAmount: number;
  };
  categories: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
  invoices: Array<{
    id: string;
    title: string;
    amount: number;
    paid: number;
    balance: number;
    due: string;
    status: "paid" | "partial" | "pending";
    statusLabel: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    cost: number;
    billed: number;
    paid: number;
  }>;
}

export function CostsClientView({
  allProjects,
  selectedProjectId,
  financialSummary,
  categories,
  invoices,
  monthlyTrend,
}: CostsClientViewProps) {
  const router = useRouter();

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "all" || !val) {
      router.push("/costs");
    } else {
      router.push(`/costs?projectId=${val}`);
    }
  };

  const selectedProj = allProjects.find((p) => p.id === selectedProjectId);

  const formatMoney = (n: number) => {
    return Number(n || 0).toLocaleString("th-TH", {
      maximumFractionDigits: 0,
    });
  };

  const formatMoneyShort = (n: number) => {
    if (n >= 1_000_000) {
      return `฿${(n / 1_000_000).toFixed(2)}M`;
    }
    return `฿${(n / 1_000).toFixed(0)}K`;
  };

  const budgetUsagePct =
    financialSummary.approvedBudget > 0
      ? Math.round(
          (financialSummary.actualCost / financialSummary.approvedBudget) * 100
        )
      : 0;

  const paidRatioPct =
    financialSummary.billedAmount > 0
      ? Math.round(
          (financialSummary.paidAmount / financialSummary.billedAmount) * 100
        )
      : 0;

  const maxCategoryAmount = Math.max(
    1,
    ...categories.map((c) => c.amount)
  );

  return (
    <div className="costs-dashboard-page">
      {/* Back to All Projects Banner if a project is selected */}
      {selectedProj && (
        <div className="module-detail-back">
          <button
            type="button"
            onClick={() => router.push("/costs")}
            aria-label="กลับภาพรวมงบประมาณและต้นทุนโครงการ"
          >
            ← กลับภาพรวมงบประมาณและต้นทุนโครงการ
          </button>
          <span>{selectedProj.code} · {selectedProj.name}</span>
        </div>
      )}

      {/* 1. Page Heading & Project Scope Selector */}
      <div className="cost-page-heading">
        <div className="heading-text">
          <h1>งบประมาณและต้นทุนโครงการ</h1>
          <p>
            {selectedProj
              ? `${selectedProj.name} • ${selectedProj.code}`
              : `${allProjects.length} โครงการในขอบเขตของคุณ`}
          </p>
        </div>

        <div className="cost-heading-controls">
          <div className="cost-project-filter">
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

      {/* 2. 6 Financial KPI Cards with Wave Pattern */}
      <div className="cost-metrics">
        {/* KPI 1: มูลค่าสัญญา */}
        <div className="card kpi pd-kpi blue">
          <div className="symbol">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">
              {selectedProjectId ? "มูลค่าสัญญา" : "มูลค่าสัญญารวม"}
            </span>
            <span className="value">
              {formatMoneyShort(financialSummary.contractValue)}
            </span>
            <small>มูลค่าโครงการตามสัญญา</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 2: งบประมาณปัจจุบัน */}
        <div className="card kpi pd-kpi blue">
          <div className="symbol">
            <PieChart className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">
              {selectedProjectId ? "งบประมาณปัจจุบัน" : "งบประมาณรวม"}
            </span>
            <span className="value">
              {formatMoneyShort(financialSummary.approvedBudget)}
            </span>
            <small>งบประมาณที่อนุมัติ</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 3: ต้นทุนเกิดจริง */}
        <div className="card kpi pd-kpi orange">
          <div className="symbol">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ต้นทุนเกิดจริง</span>
            <span className="value">
              {formatMoneyShort(financialSummary.actualCost)}
            </span>
            <small>เฉพาะต้นทุนที่ยืนยันแล้ว</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 4: งบคงเหลือ */}
        <div
          className={`card kpi pd-kpi ${
            financialSummary.remainingBudget < 0 ? "red" : "green"
          }`}
        >
          <div className="symbol">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">
              {financialSummary.remainingBudget < 0
                ? "ต้นทุนเกินงบ"
                : "งบคงเหลือ"}
            </span>
            <span className="value">
              {formatMoneyShort(Math.abs(financialSummary.remainingBudget))}
            </span>
            <small>งบประมาณหักต้นทุนจริง</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 5: ยอดเรียกเก็บ */}
        <div className="card kpi pd-kpi purple">
          <div className="symbol">
            <FileText className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">ยอดเรียกเก็บ</span>
            <span className="value">
              {formatMoneyShort(financialSummary.billedAmount)}
            </span>
            <small>เฉพาะงวดที่เผยแพร่แล้ว</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>

        {/* KPI 6: รับชำระแล้ว */}
        <div className="card kpi pd-kpi green">
          <div className="symbol">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="pd-kpi-text">
            <span className="label">รับชำระยืนยัน</span>
            <span className="value">
              {formatMoneyShort(financialSummary.paidAmount)}
            </span>
            <small>เงินรับที่บันทึกยืนยันแล้ว</small>
          </div>
          <svg className="pd-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
          </svg>
        </div>
      </div>

      {/* 3. Section 1: Budget & Cost Breakdown */}
      <div className="finance-section-title">
        <h2>งบประมาณและต้นทุน</h2>
        <span>หน่วย: บาท</span>
      </div>

      <div className="finance-grid-two">
        {/* Card 1: Budget Usage Ring */}
        <div className="finance-card">
          <div className="finance-card-head">
            <h3>การใช้งบประมาณ</h3>
          </div>

          <div className="finance-ring-layout">
            <div className="finance-ring">
              <svg viewBox="0 0 160 160" aria-label="การใช้งบประมาณ">
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="#edf2f8"
                  strokeWidth="18"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="#e48614"
                  strokeWidth="18"
                  strokeDasharray={`${budgetUsagePct} ${100 - budgetUsagePct}`}
                  strokeDashoffset="0"
                  pathLength="100"
                />
              </svg>
              <div>
                <strong>{budgetUsagePct}%</strong>
                <small>ใช้งบแล้ว</small>
              </div>
            </div>

            <div className="finance-ring-key">
              <div>
                <span>
                  <i style={{ background: "#e48614" }} />
                  ต้นทุนเกิดจริง
                </span>
                <b>
                  {formatMoney(financialSummary.actualCost)} <small>บาท</small>
                </b>
              </div>
              <div>
                <span>
                  <i style={{ background: "#059465" }} />
                  งบคงเหลือ
                </span>
                <b>
                  {formatMoney(Math.max(0, financialSummary.remainingBudget))}{" "}
                  <small>บาท</small>
                </b>
              </div>
              <div>
                <span>
                  <i style={{ background: "#1675ff" }} />
                  งบประมาณอนุมัติ
                </span>
                <b>
                  {formatMoney(financialSummary.approvedBudget)}{" "}
                  <small>บาท</small>
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Cost Categories Breakdown */}
        <div className="finance-card">
          <div className="finance-card-head">
            <h3>ต้นทุนแยกตามหมวดหมู่</h3>
          </div>

          <div className="cost-bars">
            {categories.map((c, idx) => (
              <div key={idx}>
                <div className="cost-bar-label">
                  <span>{c.name}</span>
                  <b>{formatMoney(c.amount)} บาท</b>
                </div>
                <div className="cost-bar-track">
                  <i
                    style={{
                      width: `${(c.amount / maxCategoryAmount) * 100}%`,
                      background: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Section 2: Invoicing & Payment Proportion */}
      <div className="finance-section-title">
        <h2>การเรียกเก็บและรับชำระ</h2>
        <span>ยอดรับชำระแยกจากต้นทุนการทำงาน</span>
      </div>

      <div className="finance-grid-two">
        {/* Card 1: Payment Proportion Ring */}
        <div className="finance-card">
          <div className="finance-card-head">
            <h3>สัดส่วนการรับชำระ</h3>
          </div>

          <div className="finance-ring-layout">
            <div className="finance-ring">
              <svg viewBox="0 0 160 160" aria-label="สัดส่วนการรับชำระ">
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="#edf2f8"
                  strokeWidth="18"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="#059465"
                  strokeWidth="18"
                  strokeDasharray={`${paidRatioPct} ${100 - paidRatioPct}`}
                  strokeDashoffset="0"
                  pathLength="100"
                />
              </svg>
              <div>
                <strong>{paidRatioPct}%</strong>
                <small>รับชำระแล้ว</small>
              </div>
            </div>

            <div className="finance-ring-key">
              <div>
                <span>
                  <i style={{ background: "#059465" }} />
                  รับชำระแล้ว
                </span>
                <b>
                  {formatMoney(financialSummary.paidAmount)} <small>บาท</small>
                </b>
              </div>
              <div>
                <span>
                  <i style={{ background: "#7745df" }} />
                  ยอดค้างรับ
                </span>
                <b>
                  {formatMoney(
                    Math.max(
                      0,
                      financialSummary.billedAmount - financialSummary.paidAmount
                    )
                  )}{" "}
                  <small>บาท</small>
                </b>
              </div>
              <div>
                <span>
                  <i style={{ background: "#d95a68" }} />
                  ค้างรับเกินกำหนด
                </span>
                <b className="text-red-600">
                  {formatMoney(financialSummary.overdueAmount)}{" "}
                  <small>บาท</small>
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Trend Chart */}
        <div className="finance-card">
          <div className="finance-card-head">
            <h3>แนวโน้มรายเดือน</h3>
          </div>

          <div className="cost-trend-chart">
            <svg
              viewBox="0 0 540 160"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line x1="40" x2="520" y1="30" y2="30" stroke="#e8edf4" strokeDasharray="3 3" />
              <line x1="40" x2="520" y1="75" y2="75" stroke="#e8edf4" strokeDasharray="3 3" />
              <line x1="40" x2="520" y1="120" y2="120" stroke="#e8edf4" />

              {/* Monthly bars */}
              {monthlyTrend.map((m, idx) => {
                const step = 460 / Math.max(1, monthlyTrend.length);
                const x = 50 + idx * step;
                const costH = Math.min(100, (m.cost / 2_000_000) * 90);
                const billedH = Math.min(100, (m.billed / 2_000_000) * 90);
                const paidH = Math.min(100, (m.paid / 2_000_000) * 90);

                return (
                  <g key={idx}>
                    {/* Cost bar */}
                    <rect
                      x={x}
                      y={120 - costH}
                      width="12"
                      height={costH}
                      rx="2"
                      fill="#e48614"
                    />
                    {/* Billed bar */}
                    <rect
                      x={x + 14}
                      y={120 - billedH}
                      width="12"
                      height={billedH}
                      rx="2"
                      fill="#1675ff"
                    />
                    {/* Paid bar */}
                    <rect
                      x={x + 28}
                      y={120 - paidH}
                      width="12"
                      height={paidH}
                      rx="2"
                      fill="#059465"
                    />
                    {/* Month label */}
                    <text
                      x={x + 20}
                      y="142"
                      fontSize="10"
                      fill="#7185a4"
                      textAnchor="middle"
                    >
                      {m.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="cost-trend-legend">
            <span>
              <i style={{ background: "#e48614" }} /> ต้นทุนจริง
            </span>
            <span>
              <i style={{ background: "#1675ff" }} /> เรียกเก็บที่เผยแพร่
            </span>
            <span>
              <i style={{ background: "#059465" }} /> รับชำระยืนยัน
            </span>
          </div>
        </div>
      </div>

      {/* 5. Section 3: Invoices & Payments Milestone Table */}
      <div className="invoices-card">
        <h2>งวดเรียกเก็บเงินและการรับชำระ</h2>
        <div className="invoices-table-wrap">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>งวดเรียกเก็บ</th>
                <th>ยอดเรียกเก็บ (฿)</th>
                <th>รับชำระแล้ว (฿)</th>
                <th>คงเหลือ (฿)</th>
                <th>กำหนดชำระ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <strong>{inv.title}</strong>
                    <small>{inv.id}</small>
                  </td>
                  <td>
                    <b>{formatMoney(inv.amount)}</b>
                  </td>
                  <td className="text-[#059465] font-semibold">
                    {formatMoney(inv.paid)}
                  </td>
                  <td className="text-[#0c2340] font-semibold">
                    {formatMoney(inv.balance)}
                  </td>
                  <td>{inv.due}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        inv.status === "paid"
                          ? "bg-[#e7f7ee] text-[#087d51]"
                          : inv.status === "partial"
                          ? "bg-[#fff4e9] text-[#b56b00]"
                          : "bg-[#eef4ff] text-[#1675ff]"
                      }`}
                    >
                      {inv.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
