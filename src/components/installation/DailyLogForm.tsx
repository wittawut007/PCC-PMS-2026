"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Layers,
  Users,
  Truck,
  Camera,
  AlertCircle,
  Save,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { createDailyLogAction } from "@/app/actions/installation";

interface DailyLogFormProps {
  project: any;
  workPackages: any[];
}

export function DailyLogForm({ project, workPackages }: DailyLogFormProps) {
  const router = useRouter();

  const [packageId, setPackageId] = useState(workPackages[0]?.id || "");
  const [logDate, setLogDate] = useState("2026-09-12");
  const [location, setLocation] = useState("F01–F05");
  const [activity, setActivity] = useState("ติดตั้งแผ่น");
  const [quantity, setQuantity] = useState("20");
  const [unit, setUnit] = useState("แผ่น");
  const [workers, setWorkers] = useState("6");
  const [workHours, setWorkHours] = useState("8");
  const [equipment, setEquipment] = useState("รถ / เครื่องยก 1 คัน 4 ชม. (CC-F-EQP)");
  const [issues, setIssues] = useState("F08 รอวัสดุทดแทนและแก้ไขรอยต่อ");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createDailyLogAction({
        projectId: project.id,
        packageId,
        logDate,
        location,
        activity,
        quantity: Number(quantity),
        unit,
        workers: Number(workers),
        workHours: Number(workHours),
        equipment,
        issues,
      });
      alert("บันทึกผลงานประจำวันสำเร็จ");
      router.push("/installation");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb matching SVG 26 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/installation"
              className="text-xs font-medium text-gray-500 hover:text-[#075DD8] transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              การติดตั้งและตรวจคุณภาพ
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-gray-700">พื้นที่ทำงาน</span>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-[#075DD8]">
              บันทึกผลงานประจำวัน
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#132142]">
              บันทึกผลงานประจำวัน
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#075DD8] border border-blue-200">
              {project.name}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {project.code} · ข้อมูลตัวอย่างสำหรับทบทวน UX/UI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/installation"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            ยกเลิก
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Form Details */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#132142] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#075DD8]" />
              บันทึกวันที่ 12 กันยายน 2569
            </h2>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2.5 py-1 text-gray-700 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ชุดงาน */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชุดงาน *
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              >
                {workPackages.map((wp) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.code} / {wp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* กิจกรรม / ตำแหน่ง */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                กิจกรรม / ตำแหน่ง *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ติดตั้งแผ่น / F01–F05"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ปริมาณทำวันนี้ */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ปริมาณทำวันนี้ *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>

            {/* หน่วยตามกิจกรรม */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                หน่วยตามกิจกรรม
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
              />
            </div>
          </div>

          {/* Sub-section: ทรัพยากร matching SVG 26 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              ทรัพยากร
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">ทรัพยากร</th>
                    <th className="py-2.5 px-3">จำนวน</th>
                    <th className="py-2.5 px-3">ระยะเวลา</th>
                    <th className="py-2.5 px-3">ต้นทุนอ้างอิง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-gray-800">ทีมติดตั้ง</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={workers}
                        onChange={(e) => setWorkers(e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />{" "}
                      คน
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={workHours}
                        onChange={(e) => setWorkHours(e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />{" "}
                      ชม.
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">CC-F-LAB</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-gray-800">รถ / เครื่องยก</td>
                    <td className="py-2.5 px-3">1 คัน</td>
                    <td className="py-2.5 px-3">4 ชม.</td>
                    <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">CC-F-EQP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ปัญหา / งานต่อเนื่อง */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ปัญหา / งานต่อเนื่อง
            </label>
            <textarea
              rows={3}
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]"
            />
          </div>

          {/* แนบรูปผลงาน */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">แนบรูปผลงาน</label>
              <button
                type="button"
                className="text-xs font-semibold text-[#075DD8] hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                + เพิ่มรูปภาพ
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="h-24 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 p-2">
                <Camera className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-[10px] text-gray-500 font-medium">site-f01-f05.jpg</span>
              </div>
              <div className="h-24 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 p-2">
                <Camera className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-[10px] text-gray-500 font-medium">panel-erect-02.jpg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Summary & Actions matching SVG 26 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: สรุปการบันทึก */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#132142] pb-3 border-b border-gray-100">
              สรุปการบันทึก
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">ทำวันนี้</span>
                <span className="text-base font-bold text-[#075DD8]">
                  {quantity} {unit}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">สถานะรายงาน</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                  ร่าง
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">สถานะ QC</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                  ยังไม่รับรอง
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: ข้อควรทราบ ทำแล้ว ≠ ผ่าน QC matching SVG 26 */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#075DD8]">
              <AlertCircle className="w-4 h-4 text-[#075DD8]" />
              ทำแล้ว ≠ ผ่าน QC
            </div>
            <p className="text-xs text-blue-900 mt-1 leading-relaxed">
              ส่งตรวจแยกตามขอบเขตงาน ปริมาณงานที่บันทึกยังไม่ถือเป็นผลงานรับรองจนกว่าจะผ่านการตรวจ QC
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#075DD8] rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              บันทึกผ่านอินเทอร์เน็ต
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              พิมพ์รายงานประจำวัน
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
