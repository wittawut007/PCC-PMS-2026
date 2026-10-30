"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Building2,
  Shield,
  Layers,
  Wrench,
  X,
} from "lucide-react";
import { createProjectAction, CreateProjectInput } from "@/app/actions/project";
import { formatThaiDate, formatBaht } from "@/lib/utils";

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProjectWizardClientProps {
  initialUsers: UserOption[];
  currentUserRole?: string | null;
}

const contractTypes = [
  "จัดหาพร้อมติดตั้ง (Turnkey)",
  "จัดหาวัสดุเท่านั้น (Supply Only)",
  "ติดตั้งเท่านั้น (Installation Only)",
  "เหมารวม (Lump Sum)",
  "ตามราคาต่อหน่วย (Unit Price)",
];

const paymentTermsList = [
  "แบ่งจ่ายตามความก้าวหน้าที่ผ่าน QC",
  "มัดจำ 30% / ส่งมอบวัสดุ 40% / ตรวจรับงาน 30%",
  "ชำระเมื่อส่งมอบและตรวจรับงานครบถ้วน",
  "เครดิต 30 วันหลังตรวจรับและรับใบแจ้งหนี้",
  "เครดิต 60 วันหลังตรวจรับและรับใบแจ้งหนี้",
];

const workTypeNames: Record<string, string> = {
  RW: "งานกำแพงกันดิน",
  RWF: "งานกำแพงกันดินพร้อมรั้ว",
  F: "งานเสารั้ว",
  PT: "งานพื้นโพสเทนชั่น",
};

const defaultPackageNames: Record<string, string> = {
  F: "ชุดงานเสารั้ว โซน A",
  RW: "กำแพงกันดินแนวโซน 1",
  RWF: "กำแพงกันดินพร้อมรั้ว โซน A",
  PT: "พื้นโพสเทนชั่น Tower A",
};

export function ProjectWizardClient({
  initialUsers,
}: ProjectWizardClientProps) {
  const router = useRouter();

  const [step, setStep] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Form State
  const [form, setForm] = useState<{
    name: string;
    type: "F" | "RW" | "RWF" | "PT";
    client: string;
    location: string;
    contract: string;
    contractType: string;
    paymentTerms: string;
    value: number;
    budget: number;
    start: string;
    end: string;
    stagingArea: string;
    accessRoute: string;
    readiness: string;
    packages: Array<{
      name: string;
      zone: string;
      target: number;
      unit: string;
      weight: number;
      siteStatus: string;
      crew: string;
      crewContact: string;
      crewUserId: string;
    }>;
    personnel: {
      pm: string;
      engineer: string;
      site: string;
      qc: string;
      logistics: string;
      cost: string;
    };
  }>({
    name: "โครงการตัวอย่าง PCC ใหม่",
    type: "F",
    client: "บริษัทลูกค้าตัวอย่าง จำกัด",
    location: "นิคมอุตสาหกรรมบางปะอิน จ.พระนครศรีอยุธยา",
    contract: "PO-2026-09901",
    contractType: "จัดหาพร้อมติดตั้ง (Turnkey)",
    paymentTerms: "แบ่งจ่ายตามความก้าวหน้าที่ผ่าน QC",
    value: 4850000,
    budget: 3200000,
    start: "2026-11-01",
    end: "2026-12-31",
    stagingArea: "Staging Area 1 · โซน A",
    accessRoute: "ถนนหลักนิคมฯ ฝั่งทิศตะวันออก รถบรรทุก 10 ล้อเข้าได้",
    readiness: "พื้นที่ปรับระดับดินและลงแนวเสาเข็มพร้อมเข้าติดตั้ง",
    packages: [
      {
        name: "ชุดงานเสารั้ว โซน A",
        zone: "โซน A",
        target: 100,
        unit: "เมตร",
        weight: 100,
        siteStatus: "ready",
        crew: "ทีมช่างวิชัย รั้วสำเร็จรูป",
        crewContact: "081-234-5678",
        crewUserId: "",
      },
    ],
    personnel: {
      pm: initialUsers.find((u) => u.role === "PM")?.id || initialUsers[0]?.id || "",
      engineer: initialUsers.find((u) => u.role === "ENGINEER")?.id || initialUsers[0]?.id || "",
      site: initialUsers.find((u) => u.role === "SITE_ENGINEER")?.id || initialUsers[0]?.id || "",
      qc: initialUsers.find((u) => u.role === "QC_INSPECTOR")?.id || initialUsers[0]?.id || "",
      logistics: initialUsers.find((u) => u.role === "WAREHOUSE" || u.role === "TRANSPORT")?.id || initialUsers[0]?.id || "",
      cost: initialUsers.find((u) => u.role === "PM" || u.role === "EXECUTIVE")?.id || initialUsers[0]?.id || "",
    },
  });

  const totalWeight = form.packages.reduce(
    (acc, p) => acc + Number(p.weight || 0),
    0
  );

  const handleTypeChange = (newType: "F" | "RW" | "RWF" | "PT") => {
    setForm((prev) => ({
      ...prev,
      type: newType,
      packages: prev.packages.map((pkg, i) =>
        i === 0
          ? {
              ...pkg,
              name: defaultPackageNames[newType] || pkg.name,
              unit: newType === "PT" ? "ตร.ม." : "เมตร",
            }
          : pkg
      ),
    }));
  };

  const handleAddPackage = () => {
    if (form.packages.length >= 10) return;
    const nextIdx = form.packages.length + 1;
    const zoneLetter = String.fromCharCode(64 + nextIdx);
    setForm((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          name: `ชุดงาน ${zoneLetter}`,
          zone: `โซน ${zoneLetter}`,
          target: 100,
          unit: prev.type === "PT" ? "ตร.ม." : "เมตร",
          weight: 0,
          siteStatus: "ready",
          crew: "",
          crewContact: "",
          crewUserId: "",
        },
      ],
    }));
  };

  const handleRemovePackage = (index: number) => {
    if (form.packages.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  const handleUpdatePackage = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      ),
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);
    if (currentStep === 0) {
      if (!form.name.trim()) {
        setErrorMsg("กรุณาระบุชื่อโครงการ");
        return false;
      }
      if (!form.client.trim()) {
        setErrorMsg("กรุณาระบุผู้ว่าจ้าง / ลูกค้า");
        return false;
      }
      if (!form.location.trim()) {
        setErrorMsg("กรุณาระบุสถานที่ก่อสร้าง");
        return false;
      }
      if (!form.start || !form.end) {
        setErrorMsg("กรุณาระบุวันที่เริ่มและเป้าหมายส่งมอบ");
        return false;
      }
      if (form.end < form.start) {
        setErrorMsg("เป้าหมายส่งมอบต้องไม่ก่อนวันที่เริ่มสัญญา");
        return false;
      }
      if (!form.value || form.value <= 0) {
        setErrorMsg("กรุณาระบุมูลค่าโครงการ");
        return false;
      }
      if (!form.budget || form.budget <= 0) {
        setErrorMsg("กรุณาระบุงบประมาณ");
        return false;
      }
    }

    if (currentStep === 1) {
      if (form.packages.length === 0) {
        setErrorMsg("ต้องมีชุดงานอย่างน้อย 1 ชุดงาน");
        return false;
      }
      if (Math.abs(totalWeight - 100) > 0.01) {
        setErrorMsg(`น้ำหนักชุดงานต้องรวม 100% (ปัจจุบัน ${totalWeight}%)`);
        return false;
      }
      for (const [i, p] of form.packages.entries()) {
        if (!p.name.trim()) {
          setErrorMsg(`ชุดงานที่ ${i + 1}: กรุณาระบุชื่อชุดงาน`);
          return false;
        }
        if (!p.target || p.target <= 0) {
          setErrorMsg(`ชุดงานที่ ${i + 1}: ปริมาณเป้าหมายต้องมากกว่า 0`);
          return false;
        }
      }
    }

    if (currentStep === 2) {
      if (!form.personnel.pm) {
        setErrorMsg("กรุณาเลือกผู้จัดการโครงการ (PM)");
        return false;
      }
      if (!form.personnel.engineer) {
        setErrorMsg("กรุณาเลือกวิศวกรโครงการ");
        return false;
      }
      for (const [i, p] of form.packages.entries()) {
        if (!p.crew.trim()) {
          setErrorMsg(`ชุดงานที่ ${i + 1}: กรุณาระบุทีมช่างติดตั้ง`);
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setErrorMsg(null);
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const payload: CreateProjectInput = {
        name: form.name,
        type: form.type,
        client: form.client,
        location: form.location,
        contract: form.contract,
        contractType: form.contractType,
        paymentTerms: form.paymentTerms,
        value: Number(form.value),
        budget: Number(form.budget),
        start: form.start,
        end: form.end,
        stagingArea: form.stagingArea,
        accessRoute: form.accessRoute,
        readiness: form.readiness,
        packages: form.packages.map((p) => ({
          name: p.name,
          zone: p.zone,
          target: Number(p.target),
          unit: p.unit,
          weight: Number(p.weight),
          siteStatus: p.siteStatus,
          crew: p.crew,
          crewContact: p.crewContact,
          crewUserId: p.crewUserId,
        })),
        personnel: form.personnel,
      };

      const res = await createProjectAction(payload);
      if (res?.success) {
        router.push(`/projects/${res.projectId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างโครงการ";
      setErrorMsg(msg);
      setShowConfirmModal(false);
      setBusy(false);
    }
  };

  const stepTitles = [
    { title: "ข้อมูลทั่วไป", desc: "ข้อมูลโครงการ สัญญา และงบประมาณ" },
    { title: "พื้นที่และชุดงาน", desc: "กำหนดโซน ชุดงาน และน้ำหนักงาน" },
    { title: "ทีมและผู้รับผิดชอบ", desc: "ระบุบุคลากรและทีมช่างแต่ละชุดงาน" },
    { title: "ตรวจทาน", desc: "ตรวจสอบข้อมูลก่อนสร้างโครงการ" },
  ];

  const assignedPersonnelCount = Object.values(form.personnel).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Heading matching SVG 03 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0D255B] tracking-tight">
            สร้างโครงการใหม่
          </h1>
          <p className="text-[#596780] text-xs sm:text-sm mt-0.5">
            {step === 0
              ? "ระบุข้อมูลพื้นฐานโครงการ สัญญา ผู้ว่าจ้าง และสถานที่ก่อสร้าง"
              : `${form.name} · ขั้นตอน ${step + 1} / 4`}
          </p>
        </div>
      </div>

      {/* 4-Step Stepper Cards matching project-wizard.css */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stepTitles.map((st, i) => {
          const isActive = step === i;
          const isDone = i < step;

          return (
            <div
              key={st.title}
              onClick={() => {
                if (isDone) setStep(i);
              }}
              className={`rounded-2xl p-4 border transition-all ${
                isDone ? "cursor-pointer" : ""
              } ${
                isActive
                  ? "border-[#79ACF0] bg-gradient-to-br from-[#EDF5FF] to-white shadow-xs"
                  : isDone
                  ? "border-[#C2E6DC] bg-[#F7FCFA]"
                  : "border-[#E0E7F0] bg-white opacity-85"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? "bg-[#075DD8] text-white shadow-xs"
                      : isDone
                      ? "bg-[#DDF3EB] text-[#168263]"
                      : "bg-[#F0F3F8] text-[#6D7E94]"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#DEECFF] text-[#075DD8]"
                      : isDone
                      ? "bg-[#E4F5ED] text-[#168263]"
                      : "bg-[#F3F5F8] text-[#738297]"
                  }`}
                >
                  {isDone ? "เสร็จแล้ว" : isActive ? "กำลังกรอก" : "รอดำเนินการ"}
                </span>
              </div>
              <div
                className={`text-sm font-bold leading-tight ${
                  isActive ? "text-[#075DD8]" : "text-[#29415F]"
                }`}
              >
                {st.title}
              </div>
              <div className="text-[11px] text-[#738297] mt-1 leading-snug">
                {st.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="bg-[#FFF0F1] border border-[#FDDCE1] text-[#B72839] rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Wizard Layout matching SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Form Card (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-[#E4EAF4] shadow-xs">
          {/* STEP 1: General Info & Contract */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0D255B]">
                  ข้อมูลทั่วไปและสัญญาโครงการ (Step 1/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ระบุข้อมูลสัญญา และเลือกประเภทงานทางด้านขวา
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ชื่อโครงการ *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="เช่น โครงการก่อสร้างรั้วสำเร็จรูป PCC"
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#596780] mb-1">
                    รหัสโครงการ
                  </label>
                  <input
                    type="text"
                    disabled
                    value="ระบบกำหนดเมื่อบันทึก"
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg bg-[#F5F7FB] text-[#788AA1] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ผู้ว่าจ้าง / ลูกค้า *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.client}
                    onChange={(e) =>
                      setForm({ ...form, client: e.target.value })
                    }
                    placeholder="เช่น บริษัท ลูกค้าพัฒนา จำกัด"
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    เลขที่สัญญา / PO
                  </label>
                  <input
                    type="text"
                    value={form.contract}
                    onChange={(e) =>
                      setForm({ ...form, contract: e.target.value })
                    }
                    placeholder="เช่น PO-2026-08892"
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ประเภทสัญญา
                  </label>
                  <select
                    value={form.contractType}
                    onChange={(e) =>
                      setForm({ ...form, contractType: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  >
                    {contractTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    วันที่เริ่มสัญญา *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.start}
                    onChange={(e) =>
                      setForm({ ...form, start: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    เป้าหมายส่งมอบ *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.end}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    สถานที่ก่อสร้าง / ไซต์งาน *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="เช่น นิคมอุตสาหกรรมบางปะอิน จ.พระนครศรีอยุธยา"
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    มูลค่าโครงการโดยประมาณ (บาท) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    งบประมาณที่อนุมัติ (บาท) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    เงื่อนไขการชำระเงิน
                  </label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) =>
                      setForm({ ...form, paymentTerms: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  >
                    {paymentTermsList.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Work Packages & Logistics */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0D255B]">
                    โครงสร้างพื้นที่และชุดงาน (Step 2/4)
                  </h2>
                  <p className="text-xs text-[#596780] mt-0.5">
                    กำหนดพื้นที่ โซน และชุดงานย่อย (Work Packages)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPackage}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075DD8] bg-[#EAF3FF] hover:bg-[#D5E7FF] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มชุดงาน</span>
                </button>
              </div>

              {/* Selected Type Notice */}
              <div className="bg-[#F0F5FB] border border-[#D9E7F9] rounded-xl p-3.5 text-xs text-[#264263] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#075DD8] flex-shrink-0" />
                <span>
                  หมวดหมู่งานที่เลือก:{" "}
                  <strong className="text-[#075DD8]">
                    {workTypeNames[form.type]} ({form.type})
                  </strong>
                </span>
              </div>

              {/* Work Packages List */}
              <div className="space-y-4">
                {form.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FBFDFF] border border-[#DFE7F2] rounded-xl p-4 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAF0F8]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#075DD8] text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#0D255B]">
                          ชุดงานที่ {idx + 1}
                        </span>
                      </div>

                      {form.packages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePackage(idx)}
                          className="text-[#B72839] hover:bg-[#FFEDF0] p-1.5 rounded-lg transition-colors"
                          title="ลบชุดงาน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                          ชื่อชุดงาน *
                        </label>
                        <input
                          type="text"
                          required
                          value={pkg.name}
                          onChange={(e) =>
                            handleUpdatePackage(idx, "name", e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                          โซน / พื้นที่
                        </label>
                        <input
                          type="text"
                          value={pkg.zone}
                          onChange={(e) =>
                            handleUpdatePackage(idx, "zone", e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                          น้ำหนักงาน (%) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={pkg.weight}
                          onChange={(e) =>
                            handleUpdatePackage(
                              idx,
                              "weight",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                          ปริมาณเป้าหมาย *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={pkg.target}
                          onChange={(e) =>
                            handleUpdatePackage(
                              idx,
                              "target",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                          หน่วยวัด
                        </label>
                        <select
                          value={pkg.unit}
                          onChange={(e) =>
                            handleUpdatePackage(idx, "unit", e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                        >
                          <option value="เมตร">เมตร</option>
                          <option value="ต้น">ต้น</option>
                          <option value="แผ่น">แผ่น</option>
                          <option value="ตร.ม.">ตร.ม.</option>
                          <option value="ท่อน">ท่อน</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                          สถานะพื้นที่
                        </label>
                        <select
                          value={pkg.siteStatus}
                          onChange={(e) =>
                            handleUpdatePackage(idx, "siteStatus", e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                        >
                          <option value="ready">พื้นที่พร้อมติดตั้ง</option>
                          <option value="pending">รอเคลียร์พื้นที่</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Site Logistics */}
              <div className="pt-4 border-t border-[#E4EAF4] space-y-4">
                <h3 className="text-xs font-bold text-[#0D255B] uppercase tracking-wider">
                  ข้อมูลการเข้าทำงานและจุดลงกองวัสดุ (Site Logistics)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      จุดขนถ่ายและลงกองชิ้นส่วน (Staging Area)
                    </label>
                    <input
                      type="text"
                      value={form.stagingArea}
                      onChange={(e) =>
                        setForm({ ...form, stagingArea: e.target.value })
                      }
                      placeholder="เช่น Staging Area 1 โซน A"
                      className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg bg-white text-[#0D255B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      เส้นทางเข้า–ออกรถขนส่ง (Access Route)
                    </label>
                    <input
                      type="text"
                      value={form.accessRoute}
                      onChange={(e) =>
                        setForm({ ...form, accessRoute: e.target.value })
                      }
                      placeholder="เช่น รถบรรทุก 10 ล้อเข้าฝั่งทิศเหนือ"
                      className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg bg-white text-[#0D255B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      เงื่อนไขพื้นที่ก่อนเริ่มติดตั้ง (Readiness / Constraints)
                    </label>
                    <textarea
                      rows={2}
                      value={form.readiness}
                      onChange={(e) =>
                        setForm({ ...form, readiness: e.target.value })
                      }
                      placeholder="ระบุข้อจำกัด หรือเงื่อนไขของพื้นที่..."
                      className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg bg-white text-[#0D255B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Personnel & Team */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0D255B]">
                  แต่งตั้งทีมงานและผู้รับผิดชอบ (Step 3/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ระบุบุคลากรหลัก 6 บทบาท และทีมช่างติดตั้งประจำแต่ละชุดงาน
                </p>
              </div>

              {/* 6 Key Personnel */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#0D255B] uppercase tracking-wider">
                  บุคลากรหลักประจำโครงการ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "pm", label: "ผู้จัดการโครงการ (PM) *" },
                    { key: "engineer", label: "วิศวกรโครงการ *" },
                    { key: "site", label: "วิศวกรหน้างาน *" },
                    { key: "qc", label: "ผู้ตรวจคุณภาพ (QC) *" },
                    { key: "logistics", label: "ผู้ประสานงานคลังและขนส่ง *" },
                    { key: "cost", label: "ผู้ควบคุมต้นทุน *" },
                  ].map((role) => (
                    <div key={role.key}>
                      <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                        {role.label}
                      </label>
                      <select
                        value={
                          form.personnel[role.key as keyof typeof form.personnel]
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            personnel: {
                              ...form.personnel,
                              [role.key]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-[#E4EAF4] rounded-lg bg-white text-[#0D255B]"
                      >
                        <option value="">-- เลือกผู้รับผิดชอบ --</option>
                        {initialUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Crew for each Work Package */}
              <div className="pt-4 border-t border-[#E4EAF4] space-y-4">
                <h3 className="text-xs font-bold text-[#0D255B] uppercase tracking-wider">
                  ทีมช่างติดตั้งประจำแต่ละชุดงาน
                </h3>

                <div className="space-y-3">
                  {form.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F8FAFD] border border-[#DFE7F2] rounded-xl p-4 space-y-3"
                    >
                      <div className="font-bold text-xs text-[#075DD8]">
                        {pkg.name} ({pkg.zone})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                            ชื่อทีมช่างติดตั้ง *
                          </label>
                          <input
                            type="text"
                            required
                            value={pkg.crew}
                            onChange={(e) =>
                              handleUpdatePackage(idx, "crew", e.target.value)
                            }
                            placeholder="เช่น ทีมช่างสมศักดิ์ รั้วสำเร็จรูป"
                            className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#596780] mb-1">
                            หัวหน้าทีม / ข้อมูลติดต่อ
                          </label>
                          <input
                            type="text"
                            value={pkg.crewContact}
                            onChange={(e) =>
                              handleUpdatePackage(
                                idx,
                                "crewContact",
                                e.target.value
                              )
                            }
                            placeholder="เช่น 081-999-8888"
                            className="w-full px-2.5 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Verify */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0D255B]">
                  ตรวจทานข้อมูลทั้งหมดก่อนสร้างโครงการ (Step 4/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ตรวจสอบความถูกต้องของข้อมูล WBS ทีมงาน และเงื่อนไขสัญญา
                </p>
              </div>

              {/* Review Overview Banner */}
              <div className="bg-[#EDF5FF] border border-[#D9E7F9] rounded-xl p-4">
                <div className="text-base font-bold text-[#0D255B]">
                  {form.name}
                </div>
                <div className="text-xs text-[#596780] mt-1">
                  {workTypeNames[form.type]} ({form.type}) ·{" "}
                  {form.packages.length} ชุดงาน · บุคลากรหลัก{" "}
                  {assignedPersonnelCount} บทบาท
                </div>
              </div>

              {/* Section 1: General Info */}
              <div className="border border-[#E4EAF4] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F4FA]">
                  <h3 className="text-xs font-bold text-[#0D255B] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#075DD8]" />
                    <span>ข้อมูลทั่วไปและสัญญา</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-[11px] font-bold text-[#075DD8] hover:underline"
                  >
                    แก้ไขขั้นตอนที่ 1
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-[#596780]">ผู้ว่าจ้าง / ลูกค้า:</span>{" "}
                    <strong className="text-[#0D255B]">{form.client}</strong>
                  </div>
                  <div>
                    <span className="text-[#596780]">เลขที่สัญญา:</span>{" "}
                    <strong className="text-[#0D255B]">
                      {form.contract || "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#596780]">ช่วงสัญญา:</span>{" "}
                    <strong className="text-[#0D255B]">
                      {formatThaiDate(form.start)} – {formatThaiDate(form.end)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#596780]">สถานที่ก่อสร้าง:</span>{" "}
                    <strong className="text-[#0D255B]">{form.location}</strong>
                  </div>
                  <div>
                    <span className="text-[#596780]">มูลค่าโครงการ:</span>{" "}
                    <strong className="text-[#075DD8]">
                      {formatBaht(form.value)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#596780]">งบประมาณ:</span>{" "}
                    <strong className="text-[#147747]">
                      {formatBaht(form.budget)}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#596780]">เงื่อนไขการชำระเงิน:</span>{" "}
                    <strong className="text-[#0D255B]">
                      {form.paymentTerms}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 2: WBS Packages */}
              <div className="border border-[#E4EAF4] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F4FA]">
                  <h3 className="text-xs font-bold text-[#0D255B] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#075DD8]" />
                    <span>ชุดงาน WBS และพื้นที่ ({form.packages.length} ชุดงาน)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] font-bold text-[#075DD8] hover:underline"
                  >
                    แก้ไขขั้นตอนที่ 2
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#596780] border-b border-[#F0F4FA]">
                        <th className="pb-2">ชุดงาน</th>
                        <th className="pb-2">โซน</th>
                        <th className="pb-2">เป้าหมาย</th>
                        <th className="pb-2 text-right">น้ำหนัก %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4FA]">
                      {form.packages.map((pkg, i) => (
                        <tr key={i}>
                          <td className="py-2 font-semibold text-[#0D255B]">
                            {pkg.name}
                          </td>
                          <td className="py-2 text-[#596780]">{pkg.zone}</td>
                          <td className="py-2 text-[#596780]">
                            {pkg.target} {pkg.unit}
                          </td>
                          <td className="py-2 text-right font-bold text-[#075DD8]">
                            {pkg.weight}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Personnel */}
              <div className="border border-[#E4EAF4] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F4FA]">
                  <h3 className="text-xs font-bold text-[#0D255B] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#075DD8]" />
                    <span>ทีมและผู้รับผิดชอบ</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] font-bold text-[#075DD8] hover:underline"
                  >
                    แก้ไขขั้นตอนที่ 3
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(form.personnel).map(([roleKey, userId]) => {
                    const userObj = initialUsers.find((u) => u.id === userId);
                    const labelMap: Record<string, string> = {
                      pm: "PM",
                      engineer: "วิศวกรโครงการ",
                      site: "วิศวกรหน้างาน",
                      qc: "ผู้ตรวจคุณภาพ QC",
                      logistics: "คลัง/ขนส่ง",
                      cost: "ควบคุมต้นทุน",
                    };
                    return (
                      <div key={roleKey} className="flex justify-between py-1 border-b border-[#F5F8FC]">
                        <span className="text-[#596780]">{labelMap[roleKey]}:</span>
                        <strong className="text-[#0D255B]">
                          {userObj ? userObj.name : "ยังไม่ระบุ"}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Card (Col 4) matching SVG 03 Aside */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#E4EAF4] shadow-xs space-y-5">
            {step === 0 && (
              <>
                <div>
                  <h2 className="text-sm font-bold text-[#0D255B]">
                    เลือกหมวดหมู่งาน (1 หมวดหมู่เท่านั้น)
                  </h2>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    กำหนดโครงสร้าง WBS และ Master Plan
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      id: "RW",
                      title: "งานกำแพงกันดิน (RW)",
                      desc: "งานคันดิน ป้องกันดินสไลด์",
                    },
                    {
                      id: "RWF",
                      title: "กำแพงกันดินพร้อมรั้ว (RWF)",
                      desc: "กำแพงกันดินเชื่อมรั้วส่วนบน",
                    },
                    {
                      id: "F",
                      title: "งานเสารั้ว (F)",
                      desc: "เสารั้ว แผ่นผนัง ทับหลัง",
                    },
                    {
                      id: "PT",
                      title: "งานพื้นโพสเทนชั่น (PT)",
                      desc: "งานดึงลวดอัดแรง AP1–AP7",
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        form.type === item.id
                          ? "border-[#075DD8] bg-[#EAF3FF] ring-1 ring-[#075DD8]"
                          : "border-[#E4EAF4] hover:bg-[#F9FBFE]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="workType"
                        value={item.id}
                        checked={form.type === item.id}
                        onChange={() =>
                          handleTypeChange(item.id as "F" | "RW" | "RWF" | "PT")
                        }
                        className="mt-0.5 text-[#075DD8] focus:ring-[#075DD8]"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0D255B]">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#596780] mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="bg-[#FFFDF5] border border-[#FCEECF] rounded-xl p-3 text-[11px] text-[#965500] flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>1 โครงการ 1 หมวดหมู่เท่านั้น:</strong>{" "}
                    ระบบจะสร้างแม่แบบ WBS กิจกรรม และจุดตรวจสอบคุณภาพ (QC Gates)
                    ตามหมวดหมู่งานที่เลือก
                  </span>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-sm font-bold text-[#0D255B]">
                  สรุปโครงสร้าง WBS โครงการ
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F0F4FA]">
                    <span className="text-[#596780]">หมวดหมู่งาน</span>
                    <strong className="text-[#075DD8]">
                      {workTypeNames[form.type]}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F0F4FA]">
                    <span className="text-[#596780]">จำนวนชุดงาน</span>
                    <strong className="text-[#0D255B]">
                      {form.packages.length} ชุดงาน
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F0F4FA]">
                    <span className="text-[#596780]">น้ำหนักรวม</span>
                    <strong
                      className={
                        Math.abs(totalWeight - 100) < 0.01
                          ? "text-[#147747]"
                          : "text-[#B72839]"
                      }
                    >
                      {totalWeight}%
                    </strong>
                  </div>
                </div>

                {Math.abs(totalWeight - 100) > 0.01 ? (
                  <div className="bg-[#FFEDF0] border border-[#FDDCE1] rounded-xl p-3 text-[11px] text-[#B72839]">
                    น้ำหนักรวมต้องเท่ากับ 100% พอดี (ปัจจุบัน {totalWeight}%)
                  </div>
                ) : (
                  <div className="bg-[#EAF7F0] border border-[#D5EFE3] rounded-xl p-3 text-[11px] text-[#147747] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>น้ำหนักครบ 100% พร้อมดำเนินการ</span>
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-sm font-bold text-[#0D255B]">
                  สรุปสถานะทีมและความพร้อม
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F0F4FA]">
                    <span className="text-[#596780]">บุคลากรหลัก</span>
                    <strong className="text-[#075DD8]">
                      {assignedPersonnelCount} / 6 บทบาท
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F0F4FA]">
                    <span className="text-[#596780]">ทีมช่างประจำชุดงาน</span>
                    <strong className="text-[#0D255B]">
                      {form.packages.filter((p) => p.crew.trim()).length} /{" "}
                      {form.packages.length} ชุดงาน
                    </strong>
                  </div>
                </div>

                <div className="bg-[#F0F5FB] border border-[#D9E7F9] rounded-xl p-3 text-[11px] text-[#264263]">
                  การแต่งตั้งผู้ใช้งานและทีมช่างมีผลต่อการกำหนดสิทธิ์ในการเข้าถึงข้อมูลและการบันทึกรายงานหน้างาน
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-sm font-bold text-[#0D255B]">
                  ความครบถ้วนก่อนเปิดงาน
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#147747]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ข้อมูลทั่วไปและสัญญาครบถ้วน</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#147747]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>WBS และน้ำหนักรวม 100%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#147747]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>แต่งตั้งทีมงานและช่างครบถ้วน</span>
                  </div>
                </div>
              </>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#E4EAF4]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={step === 0 || busy}
                  onClick={handleBack}
                  className="px-3 py-2.5 rounded-lg border border-[#E4EAF4] text-xs font-semibold text-[#596780] hover:bg-[#F5F8FD] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleNext}
                  className="px-3 py-2.5 rounded-lg bg-[#075DD8] hover:bg-[#004AB3] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>{step === 3 ? "สร้างโครงการ" : "ถัดไป"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <Link
                  href="/projects"
                  className="text-xs text-[#596780] hover:text-[#075DD8] hover:underline"
                >
                  กลับรายการโครงการ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E4EAF4] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4FA]">
              <h2 className="text-base font-bold text-[#0D255B]">
                ยืนยันการสร้างโครงการ
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-[#7086A8] hover:text-[#0D255B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#596780]">
              ต้องการสร้างโครงการด้วยข้อมูลที่ตรวจทานแล้วหรือไม่?
            </p>

            <div className="bg-[#EDF5FF] rounded-xl p-3 border border-[#D9E7F9]">
              <div className="font-bold text-xs text-[#0D255B]">{form.name}</div>
              <div className="text-[11px] text-[#075DD8] mt-0.5">
                {workTypeNames[form.type]} ({form.type}) · {form.packages.length} ชุดงาน
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-[#596780]">
              <div className="flex justify-between">
                <span>ผู้ว่าจ้าง:</span>
                <strong className="text-[#0D255B]">{form.client}</strong>
              </div>
              <div className="flex justify-between">
                <span>มูลค่าสัญญา:</span>
                <strong className="text-[#075DD8]">{formatBaht(form.value)}</strong>
              </div>
              <div className="flex justify-between">
                <span>งบประมาณ:</span>
                <strong className="text-[#147747]">{formatBaht(form.budget)}</strong>
              </div>
              <div className="flex justify-between">
                <span>กำหนดการ:</span>
                <strong className="text-[#0D255B]">
                  {formatThaiDate(form.start)} – {formatThaiDate(form.end)}
                </strong>
              </div>
            </div>

            <div className="bg-[#FFFDF5] border border-[#FCEECF] rounded-xl p-3 text-[11px] text-[#965500]">
              ระบบจะสร้างโครงการพร้อมโครงสร้าง WBS สัญญา และทีมงานในฐานข้อมูลจริง โครงการจะเริ่มในสถานะกำลังดำเนินงาน
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4FA]">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={busy}
                className="px-4 py-2 text-xs font-semibold text-[#596780] hover:bg-[#F5F8FC] rounded-lg border border-[#E4EAF4]"
              >
                กลับไปตรวจทาน
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={busy}
                className="px-4 py-2 text-xs font-bold text-white bg-[#075DD8] hover:bg-[#004AB3] rounded-lg shadow-sm"
              >
                {busy ? "กำลังบันทึก..." : "ยืนยันสร้างโครงการ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
