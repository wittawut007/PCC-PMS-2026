"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  CreditCard,
  FileText,
  Camera,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";

interface OwnerPortalViewProps {
  data: {
    project: any;
    metrics: {
      qcProgress: number;
      targetDate: string;
      pendingInvoiceAmount: string;
      pendingInvoiceTitle: string;
    };
    progressByCategory: Array<{ name: string; percent: number }>;
    publishedDocuments: Array<{ title: string; revision: string; date: string; fileType: string }>;
    recentPhotos: Array<{ title: string; date: string; image: string }>;
    billings: Array<{ term: string; status: string; statusTone: string; dueDate: string }>;
  };
}

export function OwnerPortalView({ data }: OwnerPortalViewProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 30 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">PCC PMS  /  โครงการของคุณ  /</span>
              <span className="text-xs font-semibold text-[#075DD8]">ภาพรวมโครงการของคุณ</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#132142]">ภาพรวมโครงการของคุณ</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                พอร์ทัลเจ้าของโครงการ (Owner Portal)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.project.name} · อัปเดตที่เผยแพร่ล่าสุด 12 ก.ย. 2569
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#075DD8]">
            <Lock className="w-3.5 h-3.5" />
            <span>แสดงเฉพาะข้อมูลที่เผยแพร่ให้คุณ (ไม่มีต้นทุนภายใน)</span>
          </div>
        </div>
      </div>

      {/* 3 Key Stat Cards matching SVG 30 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: ความก้าวหน้าผ่าน QC */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">ความก้าวหน้าผ่าน QC</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {data.metrics.qcProgress}%
            </div>
            <p className="text-xs text-gray-500 mt-1">ผลงานที่รับรองและเผยแพร่</p>
          </div>
          <div className="mt-4 w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all"
              style={{ width: `${data.metrics.qcProgress}%` }}
            />
          </div>
        </div>

        {/* Card 2: เป้าหมายส่งมอบ */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">เป้าหมายส่งมอบ</span>
              <Calendar className="w-5 h-5 text-[#075DD8]" />
            </div>
            <div className="text-3xl font-extrabold text-[#132142] mt-2">
              {data.metrics.targetDate}
            </div>
            <p className="text-xs text-gray-500 mt-1">ตามแผนและสัญญาหลัก</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5" />
            <span>เหลืองานอีก 78 วัน</span>
          </div>
        </div>

        {/* Card 3: งวดรอชำระ */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">งวดรอชำระ</span>
              <CreditCard className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">
              {data.metrics.pendingInvoiceAmount}
            </div>
            <p className="text-xs text-gray-500 mt-1">{data.metrics.pendingInvoiceTitle}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-amber-800 font-medium">สถานะ</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
              รอชำระเงิน
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: ความก้าวหน้ารายประเภทงาน & เอกสารที่เผยแพร่ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): ความก้าวหน้ารายประเภทงาน */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#132142]">ความก้าวหน้ารายประเภทงาน</h2>
            <span className="text-xs text-emerald-600 font-bold">รับรองคุณภาพแล้ว</span>
          </div>

          <div className="space-y-4 pt-1">
            {data.progressByCategory.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                  <span>{cat.name}</span>
                  <span className="font-bold text-emerald-600">{cat.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): เอกสารที่เผยแพร่ */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#132142]">เอกสารที่เผยแพร่</h2>
            <button
              onClick={() => alert("กำลังดาวน์โหลดชุดเอกสารโครงการ...")}
              className="text-xs font-bold text-[#075DD8] hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              ดาวน์โหลดเอกสาร
            </button>
          </div>

          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">เอกสาร</th>
                  <th className="py-2.5 px-3">ฉบับ</th>
                  <th className="py-2.5 px-3 text-right">เปิดดู</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.publishedDocuments.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-semibold text-[#132142] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#075DD8]" />
                      <span>{doc.title}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{doc.revision}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => alert(`เปิดดู ${doc.title}`)}
                        className="text-[#075DD8] hover:underline font-semibold"
                      >
                        ดูไฟล์
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom 2-Column: ภาพความก้าวหน้าล่าสุด & งวดเรียกเก็บของโครงการ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ภาพความก้าวหน้าล่าสุด (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2 pb-3 border-b border-gray-100">
            <Camera className="w-4 h-4 text-[#075DD8]" />
            ภาพความก้าวหน้าล่าสุด
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.recentPhotos.map((photo, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="h-32 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-500 mb-2">
                  <Camera className="w-6 h-6 opacity-60 mb-1" />
                  <span className="text-[11px] font-semibold">{photo.title}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-semibold text-gray-700">{photo.title}</span>
                  <span>{photo.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* งวดเรียกเก็บของโครงการ (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2 pb-3 border-b border-gray-100">
            <CreditCard className="w-4 h-4 text-[#075DD8]" />
            งวดเรียกเก็บของโครงการ
          </h2>

          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">งวด / จำนวน</th>
                  <th className="py-2.5 px-3">กำหนดชำระ</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.billings.map((bill, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-semibold text-[#132142]">{bill.term}</td>
                    <td className="py-3 px-3 text-gray-600">{bill.dueDate}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          bill.statusTone === "green"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : bill.statusTone === "amber"
                            ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
