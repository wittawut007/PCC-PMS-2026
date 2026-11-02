"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  Info,
  DollarSign,
  PieChart,
  PlusCircle,
  FileCheck,
} from "lucide-react";

interface BudgetItemRow {
  id: string;
  packageTitle: string;
  budgetAmount: number;
  actualCost: number;
  committedCost: number;
  forecastTotal: number;
  paidAmount: number;
  variance: number;
  notes?: string | null;
}

interface BudgetCostViewProps {
  allProjects: any[];
  currentProject: any;
  summary: {
    currentBudget: number;
    baseBudget: number;
    approvedIncrease: number;
    actualCost: number;
    committedRemaining: number;
    forecastTotal: number;
    overBudget: number;
    paidAmount: number;
  };
  items: BudgetItemRow[];
}

export function BudgetCostView({
  allProjects,
  currentProject,
  summary,
  items,
}: BudgetCostViewProps) {
  const [showChangeOrderModal, setShowChangeOrderModal] = useState(false);
  const [changeAmount, setChangeAmount] = useState("0.50");
  const [changeReason, setChangeReason] = useState("ปรับระดับดินแนวคันกั้นน้ำเพิ่มเติม");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 27 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  พื้นที่ทำงาน  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">งบประมาณและต้นทุนโครงการ</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">งบประมาณและต้นทุนโครงการ</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#075DD8] border border-blue-200">
                {currentProject?.code || "PCC-26001"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentProject?.name || "โครงการตัวอย่าง PCC"} · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChangeOrderModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              เปิดคำขอเปลี่ยนแปลงงบ
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat / Metric Cards matching SVG 27 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: งบปัจจุบัน */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">งบปัจจุบัน</span>
              <Wallet className="w-4 h-4 text-[#075DD8]" />
            </div>
            <div className="text-2xl font-bold text-[#132142] mt-2">
              {summary.currentBudget.toFixed(2)} ลบ.
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ฐาน {summary.baseBudget.toFixed(2)} + อนุมัติเพิ่ม {summary.approvedIncrease.toFixed(2)}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-600">
            <span className="w-2 h-2 rounded-full bg-[#075DD8]" />
            <span>วงเงินสัญญาปัจจุบัน</span>
          </div>
        </div>

        {/* Card 2: ต้นทุนเกิดจริง */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ต้นทุนเกิดจริง</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {summary.actualCost.toFixed(2)} ลบ.
            </div>
            <p className="text-xs text-gray-500 mt-1">Actual cost ณ วันที่รายงาน</p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">คิดเป็น</span>
            <span className="font-bold text-emerald-600">
              {Math.round((summary.actualCost / summary.currentBudget) * 100)}% ของงบ
            </span>
          </div>
        </div>

        {/* Card 3: ผูกพันคงเหลือ */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ผูกพันคงเหลือ</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              {summary.committedRemaining.toFixed(2)} ลบ.
            </div>
            <p className="text-xs text-gray-500 mt-1">ส่วนที่ยังไม่เป็น Actual</p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">ใบสั่งซื้อ PO / สัญญา</span>
            <span className="font-semibold text-amber-700">Committed</span>
          </div>
        </div>

        {/* Card 4: คาดการณ์จบงาน */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between bg-rose-50/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">คาดการณ์จบงาน</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-2">
              {summary.forecastTotal.toFixed(2)} ลบ.
            </div>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              เกินงบ {summary.overBudget.toFixed(2)} ล้านบาท
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
            <span className="text-rose-700 font-medium">เกณฑ์พิจารณาเพิ่มงบ</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
              Over Budget
            </span>
          </div>
        </div>
      </div>

      {/* Main Table: ต้นทุนแยกตามชุดงาน matching SVG 27 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#132142]">
              ต้นทุนแยกตามชุดงาน · ล้านบาท
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              เปรียบเทียบงบประมาณปัจจุบัน, ต้นทุนเกิดจริง, ผูกพันคงเหลือ และคาดการณ์จบงาน
            </p>
          </div>
          <span className="text-xs font-semibold text-[#075DD8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-auto">
            หน่วย: ล้านบาท (THB)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">ชุดงาน</th>
                <th className="py-3 px-4 text-right">งบปัจจุบัน</th>
                <th className="py-3 px-4 text-right">เกิดจริง</th>
                <th className="py-3 px-4 text-right">ผูกพันเหลือ</th>
                <th className="py-3 px-4 text-right">คาดจบงาน</th>
                <th className="py-3 px-4 text-center">เทียบงบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((row) => {
                const isOver = row.variance > 0;
                return (
                  <tr key={row.id} className="hover:bg-blue-50/20 transition">
                    <td className="py-3.5 px-4 font-semibold text-[#132142]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#075DD8]" />
                        <span>{row.packageTitle}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                      {row.budgetAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      {row.actualCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-amber-600">
                      {row.committedCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                      {row.forecastTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOver
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isOver ? `+${row.variance.toFixed(2)}` : `${row.variance.toFixed(2)}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50/80 font-bold border-t border-gray-300 text-gray-900">
              <tr>
                <td className="py-3.5 px-4">รวมทั้งสิ้น</td>
                <td className="py-3.5 px-4 text-right">{summary.currentBudget.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-right text-emerald-700">{summary.actualCost.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-right text-amber-700">{summary.committedRemaining.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-right text-rose-700">{summary.forecastTotal.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-center text-rose-700">+{summary.overBudget.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2 Information Callouts matching SVG 27 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notice 1: จ่ายแล้ว */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#075DD8] mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-[#075DD8]">
              จ่ายแล้ว {summary.paidAmount.toFixed(2)} ล้านบาท
            </h4>
            <p className="text-gray-600 mt-1 leading-relaxed">
              เป็นสถานะการชำระเงินตามรอบบัญชี ไม่บวกซ้ำในต้นทุนเกิดจริง (Actual Cost) เพื่อความถูกต้องของกระแสเงินสด
            </p>
          </div>
        </div>

        {/* Notice 2: ทบทวนผลกระทบก่อนอนุมัติ */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-800">ทบทวนผลกระทบก่อนอนุมัติ</h4>
            <p className="text-gray-600 mt-1 leading-relaxed">
              การเปลี่ยนปริมาณ / งานแก้ไข / เที่ยวรถเพิ่ม ต้องผูกชุดงานและ Cost Code เพื่อประเมินงบและควบคุมไม่ให้เกิด Overrun
            </p>
          </div>
        </div>
      </div>

      {/* Change Order Modal */}
      {showChangeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#132142]">
              เปิดคำขอเปลี่ยนแปลงงบ (Change Order Request)
            </h3>
            <p className="text-xs text-gray-500">
              เสนอขอปรับปรุงงบประมาณโครงการต่อผู้มีอำนาจอนุมัติ (ผู้บริหาร / Cost Control)
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                จำนวนเงินที่ขอปรับปรุง (ล้านบาท) *
              </label>
              <input
                type="number"
                step="0.01"
                value={changeAmount}
                onChange={(e) => setChangeAmount(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                เหตุผลและความจำเป็น *
              </label>
              <textarea
                rows={3}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChangeOrderModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("ส่งคำขอเปลี่ยนแปลงงบ CO-260002 เรียบร้อยแล้ว (ส่งต่อไปยังคิวอนุมัติของผู้บริหาร)");
                  setShowChangeOrderModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700"
              >
                ส่งคำขอปรับงบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
