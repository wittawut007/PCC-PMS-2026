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
  Upload,
  ChevronRight,
  RotateCcw,
  Users,
  Pencil,
  Calendar,
} from "lucide-react";
import { createProjectAction, CreateProjectInput } from "@/app/actions/project";
import { formatThaiDate, formatBaht } from "@/lib/utils";
import { CallyDatePicker } from "@/components/common/CallyDatePicker";
import { FlowbiteDropdown } from "@/components/common/FlowbiteDropdown";
import {
  getTemplateForWorkType,
  defaultPlan,
  addPlanDays,
  planDays,
  TemplateItem,
} from "@/lib/templates";
import "./project-wizard.css";

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

export interface WorkPackageQuantity {
  id: string;
  kind: string;
  name: string;
  qty: number;
  unit: string;
  primary: boolean;
}

export interface WorkPackagePlanItem {
  code: string;
  title: string;
  type: string;
  responsible: string;
  duration: number;
  start: string;
  end: string;
  predecessor?: string;
}

export interface WorkPackageItem {
  name: string;
  zone: string;
  target: number;
  unit: string;
  weight: number;
  siteStatus: string;
  scope?: string;
  readyDate?: string;
  readinessDetail?: string;
  constraints?: string;
  quantities: WorkPackageQuantity[];
  plan: WorkPackagePlanItem[];
  crew: string;
  crewContact: string;
  crewUserId: string;
}

const packageCatalog: Record<string, Array<[string, string, string[]]>> = {
  F: [
    ["fence", "แนวรั้ว / พื้นที่รั้ว", ["เมตร", "ตร.ม."]],
    ["pile", "เสาเข็ม", ["ต้น"]],
    ["post", "เสารั้ว", ["ต้น"]],
    ["foundation", "ฐานราก", ["ฐาน", "ลบ.ม."]],
    ["panel", "แผ่นรั้ว", ["แผ่น"]],
    ["capping", "ทับหลัง", ["ชิ้น", "เมตร"]],
    ["other", "รายการอื่นตามขอบเขตงาน", ["เมตร", "ตร.ม.", "ลบ.ม.", "ต้น", "แผ่น", "ชิ้น", "ชุด"]],
  ],
  RW: [
    ["wallLength", "แนวกำแพง / พื้นที่กำแพง", ["เมตร", "ตร.ม."]],
    ["wall", "ชิ้นส่วน L-Wall", ["ชิ้น", "แผ่น"]],
    ["pile", "เสาเข็ม", ["ต้น"]],
    ["foundation", "คอนกรีตฐานราก", ["ลบ.ม."]],
    ["drainage", "ระบบระบายน้ำ", ["เมตร", "ชุด"]],
    ["backfill", "งานถมดิน", ["ลบ.ม."]],
    ["other", "รายการอื่นตามขอบเขตงาน", ["เมตร", "ตร.ม.", "ลบ.ม.", "ต้น", "แผ่น", "ชิ้น", "ชุด"]],
  ],
  RWF: [
    ["wallLength", "แนวกำแพง / พื้นที่กำแพง", ["เมตร", "ตร.ม."]],
    ["wall", "ชิ้นส่วน L-Wall", ["ชิ้น", "แผ่น"]],
    ["fence", "แนวรั้ว / พื้นที่รั้ว", ["เมตร", "ตร.ม."]],
    ["pile", "เสาเข็ม", ["ต้น"]],
    ["foundation", "คอนกรีตฐานราก", ["ลบ.ม."]],
    ["post", "เสารั้ว", ["ต้น"]],
    ["panel", "แผ่นรั้ว", ["แผ่น"]],
    ["capping", "ทับหลัง", ["ชิ้น", "เมตร"]],
    ["drainage", "ระบบระบายน้ำ", ["เมตร", "ชุด"]],
    ["backfill", "งานถมดิน", ["ลบ.ม."]],
    ["other", "รายการอื่นตามขอบเขตงาน", ["เมตร", "ตร.ม.", "ลบ.ม.", "ต้น", "แผ่น", "ชิ้น", "ชุด"]],
  ],
  PT: [
    ["floor", "พื้นที่พื้น PT", ["ตร.ม."]],
    ["concrete", "คอนกรีตพื้น", ["ลบ.ม."]],
    ["tendon", "Tendon", ["เส้น", "ชุด"]],
    ["strand", "Strand", ["เมตร", "กก."]],
    ["duct", "Duct", ["เมตร"]],
    ["anchorage", "Anchorage", ["ชุด"]],
    ["grout", "งาน Grouting", ["ชุด", "ลบ.ม."]],
    ["other", "รายการอื่นตามขอบเขตงาน", ["เมตร", "ตร.ม.", "ลบ.ม.", "ต้น", "แผ่น", "ชิ้น", "ชุด"]],
  ],
};

const readinessLabels: Record<string, string> = {
  ready: "พื้นที่พร้อม",
  partial: "พร้อมบางส่วน",
  pending: "ยังไม่พร้อม",
};

function formatThaiDateStr(isoStr?: string | null): string {
  if (!isoStr) return "ยังไม่ระบุ";
  const parts = isoStr.split("-");
  if (parts.length !== 3) return isoStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return isoStr;
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  return `${d} ${months[m - 1]} ${y + 543}`;
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
  RWF: "งานกำแพงกันดิน เสารั้ว แผ่นรั้ว ทับหลัง",
  F: "งานเสารั้ว แผ่นรั้ว ทับหลัง",
  PT: "งานพื้นโพสเทนชั่น",
};

const defaultPackageNames: Record<string, string> = {
  F: "เสารั้ว แผ่นผนัง ทับหลัง",
  RW: "งานคันดิน ป้องกันดินสไลด์",
  RWF: "ทำแพงกันดินพร้อมรั้วส่วนบน",
  PT: "งานดึงลวดอัดแรง AP1-AP7",
};

const teamRolesDef = [
  ["pm", "ผู้จัดการโครงการ (PM)"],
  ["engineer", "วิศวกรโครงการ"],
  ["site", "วิศวกรหน้างาน"],
  ["qc", "ผู้ตรวจคุณภาพ (QC)"],
  ["logistics", "ผู้ประสานงานคลังและขนส่ง"],
  ["cost", "ผู้ควบคุมต้นทุน"],
] as const;

const roleNameMap: Record<string, string> = {
  SYSTEM_ADMIN: "ผู้ดูแลระบบ",
  EXECUTIVE: "ผู้บริหารโครงการ",
  PM: "ผู้จัดการโครงการ",
  ENGINEER: "วิศวกรแบบ / โครงการ",
  SITE_ENGINEER: "วิศวกรหน้างาน",
  QC_INSPECTOR: "เจ้าหน้าที่ QC",
  WAREHOUSE: "ผู้ประสานงานคลัง",
  TRANSPORT: "ผู้ควบคุมขนส่ง",
  OWNER: "เจ้าของโครงการ",
  STAFF: "พนักงาน",
};

const formatUserOptionLabel = (u: UserOption) => {
  const roleTh = roleNameMap[u.role] || u.role;
  const username = u.email ? u.email.split("@")[0] : u.id;
  return `${u.name} · ${roleTh} (${username})`;
};

export function ProjectWizardClient({
  initialUsers,
}: ProjectWizardClientProps) {
  const router = useRouter();

  const [step, setStep] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const dropdownTriggerMode = "click";

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Document Upload State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docExtracting, setDocExtracting] = useState<boolean>(false);
  const [docMessage, setDocMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleDocumentUpload = async (file: File) => {
    if (!file) return;
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
      setDocMessage({ text: "รองรับเฉพาะไฟล์ PDF, Word (.docx) และ TXT เท่านั้น", isError: true });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setDocMessage({ text: "ขนาดไฟล์ต้องไม่เกิน 8 MB", isError: true });
      return;
    }

    setDocFile(file);
    setDocExtracting(true);
    setDocMessage({ text: `กำลังอ่านข้อมูลจาก ${file.name}...` });

    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        const lines = text.split("\n");
        const updates: Partial<typeof form> = {};
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("ชื่อโครงการ:") || trimmed.startsWith("โครงการ:")) {
            updates.name = trimmed.split(":")[1].trim();
          } else if (trimmed.startsWith("ผู้ว่าจ้าง:") || trimmed.startsWith("ลูกค้า:")) {
            updates.client = trimmed.split(":")[1].trim();
          } else if (trimmed.startsWith("เลขที่สัญญา:") || trimmed.startsWith("PO:")) {
            updates.contract = trimmed.split(":")[1].trim();
          } else if (trimmed.startsWith("สถานที่:")) {
            updates.location = trimmed.split(":")[1].trim();
          }
        }
        if (Object.keys(updates).length > 0) {
          setForm(prev => ({ ...prev, ...updates }));
          setDocMessage({ text: `อ่านข้อมูลสำเร็จ เติมข้อมูลลงฟอร์มแล้ว (${Object.keys(updates).length} รายการ)` });
        } else {
          setDocMessage({ text: `อ่าน ${file.name} เรียบร้อย กรุณาตรวจสอบและกรอกข้อมูลเพิ่มเติม` });
        }
      } else {
        setTimeout(() => {
          setDocExtracting(false);
          setDocMessage({ text: `อ่านข้อมูลจาก ${file.name} เรียบร้อยแล้ว กรุณาตรวจสอบข้อมูลก่อนดำเนินการต่อ` });
        }, 800);
      }
    } catch {
      setDocMessage({ text: "ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้งหรือกรอกข้อมูลเอง", isError: true });
    } finally {
      setDocExtracting(false);
    }
  };

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
    packages: WorkPackageItem[];
    personnel: {
      pm: string;
      engineer: string;
      site: string;
      qc: string;
      logistics: string;
      cost: string;
    };
  }>({
    name: "",
    type: "F",
    client: "",
    location: "นิคมอุตสาหกรรมบางปะอิน จ.พระนครศรีอยุธยา",
    contract: "",
    contractType: "จัดหาพร้อมติดตั้ง (Turnkey)",
    paymentTerms: "แบ่งจ่ายตามความก้าวหน้าที่ผ่าน QC",
    value: 4850000,
    budget: 3200000,
    start: "2026-10-01",
    end: "2026-11-30",
    stagingArea: "Staging Area 1 · โซน A",
    accessRoute: "ถนนหลักนิคมฯ ฝั่งทิศตะวันออก รถบรรทุก 10 ล้อเข้าได้",
    readiness: "พื้นที่ปรับระดับดินและลงแนวเสาเข็มพร้อมเข้าติดตั้ง",
    packages: [
      {
        name: "ชุดงานเสารั้ว แผ่นรั้ว ทับหลัง",
        zone: "พื้นที่หลัก",
        target: 100,
        unit: "เมตร",
        weight: 100,
        siteStatus: "ready",
        scope: "",
        readyDate: "",
        readinessDetail: "",
        constraints: "",
        quantities: [
          {
            id: "q-1",
            kind: "fence",
            name: "แนวรั้ว / พื้นที่รั้ว",
            qty: 100,
            unit: "เมตร",
            primary: true,
          },
        ],
        plan: defaultPlan(getTemplateForWorkType("F"), "2026-10-01").map((t) => ({
          code: t.code,
          title: t.title,
          type: t.type,
          responsible: "ยังไม่ระบุ",
          duration: t.duration,
          start: t.start,
          end: t.end,
          predecessor: t.predecessor,
        })),
        crew: "",
        crewContact: "",
        crewUserId: "",
      },
    ],
    personnel: {
      pm: "",
      engineer: "",
      site: "",
      qc: "",
      logistics: "",
      cost: "",
    },
  });

  // Modals state for Step 2
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);
  const [packageDraft, setPackageDraft] = useState<WorkPackageItem | null>(null);

  const [editingPlanItem, setEditingPlanItem] = useState<{
    packageIndex: number;
    planIndex: number;
  } | null>(null);
  const [planDraft, setPlanDraft] = useState<WorkPackagePlanItem | null>(null);

  const totalWeight = form.packages.reduce(
    (acc, p) => acc + Number(p.weight || 0),
    0
  );

  const totalQuantitiesCount = form.packages.reduce(
    (acc, p) => acc + (p.quantities?.length || 1),
    0
  );

  const allPlans = form.packages.flatMap((p) => p.plan || []);
  const planStarts = allPlans.map((r) => r.start).filter(Boolean).sort();
  const planEnds = allPlans.map((r) => r.end).filter(Boolean).sort();
  const planStartDate = planStarts[0] || form.start;
  const planEndDate = planEnds[planEnds.length - 1] || form.end;
  const planDateRangeText =
    planStarts.length && planEnds.length
      ? `${formatThaiDateStr(planStartDate)} – ${formatThaiDateStr(planEndDate)}`
      : "ยังไม่กำหนด";
  const planTotalDays =
    planStarts.length && planEnds.length
      ? planDays(planStartDate, planEndDate)
      : 0;
  const planTotalActivities = allPlans.length;
  const planApprovalPoints = allPlans.filter(
    (r) => ["Milestone", "Hold Point"].includes(r.type) || r.code.includes("-AP")
  ).length;

  const readyCount = form.packages.filter((p) => p.siteStatus === "ready").length;
  const partialCount = form.packages.filter((p) => p.siteStatus === "partial").length;
  const pendingCount = form.packages.filter((p) => p.siteStatus === "pending").length;

  const totalQuantitiesMap = new Map<string, { label: string; unit: string; qty: number }>();
  for (const p of form.packages) {
    for (const q of p.quantities || []) {
      const key = `${q.name}|${q.unit}`;
      const existing = totalQuantitiesMap.get(key) || { label: q.name, unit: q.unit, qty: 0 };
      existing.qty += Number(q.qty) || 0;
      totalQuantitiesMap.set(key, existing);
    }
  }
  const quantitySummaryList = Array.from(totalQuantitiesMap.values());

  const handleOpenPackageModal = (idx: number) => {
    setEditingPackageIndex(idx);
    setPackageDraft(JSON.parse(JSON.stringify(form.packages[idx])));
  };

  const handleSavePackageModal = () => {
    if (editingPackageIndex === null || !packageDraft) return;
    setForm((prev) => ({
      ...prev,
      packages: prev.packages.map((p, i) =>
        i === editingPackageIndex ? packageDraft : p
      ),
    }));
    setEditingPackageIndex(null);
    setPackageDraft(null);
  };

  const handleOpenPlanModal = (packageIndex: number, planIndex: number) => {
    setEditingPlanItem({ packageIndex, planIndex });
    setPlanDraft(JSON.parse(JSON.stringify(form.packages[packageIndex].plan[planIndex])));
  };

  const handleSavePlanModal = () => {
    if (!editingPlanItem || !planDraft) return;
    const { packageIndex, planIndex } = editingPlanItem;
    setForm((prev) => ({
      ...prev,
      packages: prev.packages.map((p, pI) =>
        pI === packageIndex
          ? {
              ...p,
              plan: p.plan.map((pl, plI) => (plI === planIndex ? planDraft : pl)),
            }
          : p
      ),
    }));
    setEditingPlanItem(null);
    setPlanDraft(null);
  };

  const handleResetPlan = (pkgIndex: number) => {
    const pkg = form.packages[pkgIndex];
    if (!pkg) return;
    const template = getTemplateForWorkType(form.type);
    const startDate = form.start || "2026-10-01";
    const newPlan = defaultPlan(template, startDate).map((t, idx) => {
      const existing = pkg.plan?.[idx];
      return {
        code: t.code,
        title: existing?.title || t.title,
        type: t.type,
        responsible: existing?.responsible || "ยังไม่ระบุ",
        duration: t.duration,
        start: t.start,
        end: t.end,
        predecessor: t.predecessor,
      };
    });

    setForm((prev) => ({
      ...prev,
      packages: prev.packages.map((p, idx) =>
        idx === pkgIndex ? { ...p, plan: newPlan } : p
      ),
    }));
  };

  const handleTypeChange = (newType: "F" | "RW" | "RWF" | "PT") => {
    const pkgName = workTypeNames[newType];
    const cat = packageCatalog[newType] || packageCatalog["F"];
    const firstItem = cat[0];
    const defaultStartDate = form.start || "2026-10-01";
    const template = getTemplateForWorkType(newType);
    const plan = defaultPlan(template, defaultStartDate).map((t) => ({
      code: t.code,
      title: t.title,
      type: t.type,
      responsible: "ยังไม่ระบุ",
      duration: t.duration,
      start: t.start,
      end: t.end,
      predecessor: t.predecessor,
    }));

    setForm((prev) => ({
      ...prev,
      type: newType,
      packages: [
        {
          name: pkgName,
          zone: "พื้นที่หลัก",
          target: 100,
          unit: firstItem[2][0],
          weight: 100,
          siteStatus: "ready",
          scope: "",
          readyDate: "",
          readinessDetail: "",
          constraints: "",
          quantities: [
            {
              id: "q-1",
              kind: firstItem[0],
              name: firstItem[1],
              qty: 100,
              unit: firstItem[2][0],
              primary: true,
            },
          ],
          plan,
          crew: prev.packages[0]?.crew || "",
          crewContact: prev.packages[0]?.crewContact || "",
          crewUserId: prev.packages[0]?.crewUserId || "",
        },
      ],
    }));
  };

  const handleAddPackage = () => {
    if (form.packages.length >= 10) return;
    const nextIdx = form.packages.length + 1;
    const zoneLetter = String.fromCharCode(64 + nextIdx);
    const cat = packageCatalog[form.type] || packageCatalog["F"];
    const firstItem = cat[0];
    const defaultStartDate = form.start || "2026-10-01";
    const template = getTemplateForWorkType(form.type);
    const plan = defaultPlan(template, defaultStartDate).map((t) => ({
      code: t.code,
      title: t.title,
      type: t.type,
      responsible: "ยังไม่ระบุ",
      duration: t.duration,
      start: t.start,
      end: t.end,
      predecessor: t.predecessor,
    }));

    setForm((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          name: `ชุดงาน ${zoneLetter}`,
          zone: `โซน ${zoneLetter}`,
          target: 100,
          unit: firstItem[2][0],
          weight: 0,
          siteStatus: "ready",
          scope: "",
          readyDate: "",
          readinessDetail: "",
          constraints: "",
          quantities: [
            {
              id: `q-${Date.now()}`,
              kind: firstItem[0],
              name: firstItem[1],
              qty: 100,
              unit: firstItem[2][0],
              primary: true,
            },
          ],
          plan,
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
    const errors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!form.name.trim()) {
        errors["name"] = "กรุณาระบุชื่อโครงการ";
      }
      if (!form.client.trim()) {
        errors["client"] = "กรุณาระบุผู้ว่าจ้าง / ลูกค้า";
      }
      if (!form.start) {
        errors["start"] = "กรุณาระบุวันที่เริ่มสัญญา";
      }
      if (!form.end) {
        errors["end"] = "กรุณาระบุเป้าหมายส่งมอบ";
      } else if (form.start && form.end < form.start) {
        errors["end"] = "เป้าหมายส่งมอบต้องไม่ก่อนวันที่เริ่มสัญญา";
      }
      if (!form.location.trim()) {
        errors["location"] = "กรุณาระบุสถานที่ก่อสร้าง";
      }
      if (!form.value || form.value <= 0) {
        errors["value"] = "กรุณาระบุมูลค่าโครงการ";
      }
      if (!form.budget || form.budget <= 0) {
        errors["budget"] = "กรุณาระบุงบประมาณ";
      }
    }

    if (currentStep === 1) {
      if (form.packages.length === 0) {
        errors["packages"] = "ต้องมีชุดงานอย่างน้อย 1 ชุดงาน";
      }
      if (Math.abs(totalWeight - 100) > 0.01) {
        errors["totalWeight"] = `น้ำหนักชุดงานต้องรวม 100% (ปัจจุบัน ${totalWeight}%)`;
      }
      for (const [i, p] of form.packages.entries()) {
        if (!p.name.trim()) {
          errors[`pkg-name-${i}`] = `กรุณาระบุชื่อชุดงาน`;
        }
        if (!p.target || p.target <= 0) {
          errors[`pkg-target-${i}`] = `ปริมาณเป้าหมายต้องมากกว่า 0`;
        }
      }
    }

    if (currentStep === 2) {
      for (const [id, label] of teamRolesDef) {
        if (!form.personnel[id as keyof typeof form.personnel]) {
          errors[`person-${id}`] = `กรุณาเลือก${label}`;
        }
      }
      for (const [i, p] of form.packages.entries()) {
        if (!p.crew.trim()) {
          errors[`crew-${i}`] = `กรุณาระบุทีมช่างติดตั้ง`;
        }
      }
    }

    setFieldErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const firstMsg = errors[firstKey];
      setErrorMsg(firstMsg);

      // เลื่อนและโฟกัสไปยังตำแหน่งจริงของช่องนั้นๆ ทันที
      setTimeout(() => {
        const el = document.getElementById(`field-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus?.();
        }
      }, 50);

      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 3) {
      setFieldErrors({});
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setErrorMsg(null);
      setFieldErrors({});
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (targetStep: number) => {
    setErrorMsg(null);
    setFieldErrors({});
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const uniqueUsersCount = new Set(Object.values(form.personnel).filter(Boolean)).size;
  const crewCompleteCount = form.packages.filter((p) => p.crew.trim()).length;

  const teamIssuesList: string[] = [];
  for (const [id, label] of teamRolesDef) {
    if (!form.personnel[id as keyof typeof form.personnel]) {
      teamIssuesList.push(`เลือก${label}จากผู้ใช้งานในระบบ`);
    }
  }
  form.packages.forEach((w, i) => {
    if (!w.crew.trim()) {
      teamIssuesList.push(`ชุดงาน ${i + 1}: ระบุทีมช่างติดตั้ง`);
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Heading & Breadcrumb matching reference screenshots (displayed on step 2+) */}
      {step > 0 && (
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#596780]">
            <Link href="/dashboard" className="hover:text-[#075DD8]">
              PCC PMS
            </Link>
            <span>/</span>
            <span className="text-[#596780]">พื้นที่ทำงาน</span>
            <span>/</span>
            <span className="text-[#075DD8] font-medium">
              {step === 1 ? "กำหนดพื้นที่และชุดงาน" : step === 2 ? "ทีมและผู้รับผิดชอบ" : "ตรวจทาน"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0D255B] tracking-tight">
            {step === 1 ? "กำหนดพื้นที่และชุดงาน" : step === 2 ? "ทีมและผู้รับผิดชอบ" : "ตรวจทาน"}
          </h1>
          <p className="text-[#596780] text-xs sm:text-sm mt-0.5">
            {form.name || "Wittawut Chareonsri"} · ขั้นตอน {step + 1} / 4
          </p>
        </div>
      )}

      {/* 4-Step Stepper Cards matching website-demo / image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {stepTitles.map((st, i) => {
          const isActive = step === i;
          const isDone = i < step;

          return (
            <div
              key={st.title}
              onClick={() => {
                if (isDone) setStep(i);
              }}
              className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                isDone ? "cursor-pointer" : ""
              } ${
                isActive
                  ? "border-[#70A5F9] bg-white shadow-xs"
                  : isDone
                  ? "border-[#C2E6DC] bg-[#F7FCFA]"
                  : "border-[#E0E7F0] bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? "bg-[#075DD8] text-white shadow-xs"
                      : isDone
                      ? "bg-[#DDF3EB] text-[#168263]"
                      : "bg-[#F0F3F8] text-[#6D7E94]"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : i + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
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
              <h3
                className={`text-[14px] font-bold leading-tight ${
                  isActive ? "text-[#075DD8]" : "text-[#29415F]"
                }`}
              >
                {st.title}
              </h3>
              <p className="text-[11px] text-[#738297] mt-1 leading-snug">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2-Column Wizard Layout matching SVG & Website Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Form Card (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-[#E4EAF4] shadow-xs">
          {/* STEP 1: General Info & Contract */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base sm:text-[17px] font-bold text-[#0D255B]">
                  ข้อมูลทั่วไปและสัญญาโครงการ (Step 1/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ระบุข้อมูลสัญญา และเลือกประเภทงานทางด้านขวา
                </p>
              </div>

              {/* Document Upload Box matching reference image */}
              <div className="project-document">
                <div className="project-document-heading">
                  <span className="project-document-icon">
                    <Upload className="w-5 h-5" />
                  </span>
                  <div>
                    <h3>กรอกข้อมูลจากเอกสารโครงการ</h3>
                    <p>อัปโหลดสัญญา หรือใบสั่งซื้อ เพื่อช่วยเติมรายละเอียดโครงการ</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E0EDFF] text-[#075DD8]">
                    ตัวช่วยกรอกข้อมูล
                  </span>
                </div>

                <div className="project-document-drop">
                  <div>
                    <strong>ลากเอกสารมาวางที่นี่ หรือเลือกไฟล์</strong>
                    <small>PDF ที่มีข้อความ, Word (.docx), TXT · สูงสุด 8 MB</small>
                  </div>
                  <label
                    htmlFor="project-doc-input"
                    className="cursor-pointer px-3.5 py-2 rounded-lg border border-[#D0DDEC] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>เลือกเอกสาร</span>
                  </label>
                  <input
                    id="project-doc-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file);
                    }}
                  />
                </div>

                <p className="project-document-help">
                  ตรวจสอบข้อมูลที่อ่านได้ก่อนเดินหน้าต่อจริง · ไฟล์ใช้สำหรับดึงอ่านข้อมูลเท่านั้น ยังไม่แนบเก็บในโครงการ
                </p>

                {docMessage && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      docMessage.isError
                        ? "bg-[#FFF0F1] text-[#B72839] border border-[#FDDCE1]"
                        : "bg-[#EDF5FF] text-[#075DD8] border border-[#D8E6F8]"
                    }`}
                  >
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{docMessage.text}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="field-name"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["name"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    ชื่อโครงการ *
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      clearFieldError("name");
                    }}
                    placeholder="เช่น โครงการก่อสร้างรั้วสำเร็จรูป PCC"
                    className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border rounded-xl outline-none transition-all ${
                      fieldErrors["name"]
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9] text-[#0D255B]"
                        : "border-[#E0E7F0] focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                    }`}
                  />
                  {fieldErrors["name"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["name"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#596780] mb-1.5">
                    รหัสโครงการ
                  </label>
                  <input
                    type="text"
                    disabled
                    value="ระบบกำหนดเมื่อบันทึก"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border border-[#E0E7F0] rounded-xl bg-[#F5F7FB] text-[#788AA1] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-client"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["client"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    ผู้ว่าจ้าง / ลูกค้า *
                  </label>
                  <input
                    id="field-client"
                    type="text"
                    value={form.client}
                    onChange={(e) => {
                      setForm({ ...form, client: e.target.value });
                      clearFieldError("client");
                    }}
                    placeholder="เช่น บริษัท ลูกค้าพัฒนา จำกัด"
                    className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border rounded-xl outline-none transition-all ${
                      fieldErrors["client"]
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9] text-[#0D255B]"
                        : "border-[#E0E7F0] focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                    }`}
                  />
                  {fieldErrors["client"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["client"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0D255B] mb-1.5">
                    เลขที่สัญญา / PO
                  </label>
                  <input
                    type="text"
                    value={form.contract}
                    onChange={(e) =>
                      setForm({ ...form, contract: e.target.value })
                    }
                    placeholder="เช่น PO-2026-08892"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border border-[#E0E7F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0D255B] mb-1.5">
                    ประเภทสัญญา
                  </label>
                  <FlowbiteDropdown
                    id="dropdownContractType"
                    trigger={dropdownTriggerMode}
                    value={form.contractType}
                    onChange={(val) =>
                      setForm({ ...form, contractType: val })
                    }
                    options={contractTypes.map((t) => ({ value: t, label: t }))}
                    placeholder="เลือกประเภทสัญญา"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-start"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["start"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    วันที่เริ่มสัญญา *
                  </label>
                  <CallyDatePicker
                    id="field-start"
                    value={form.start}
                    onChange={(val) => {
                      setForm({ ...form, start: val });
                      clearFieldError("start");
                    }}
                    className={
                      fieldErrors["start"]
                        ? "!border-[#E11D48] !ring-2 !ring-[#E11D48]/15 !bg-[#FFF9F9]"
                        : ""
                    }
                  />
                  {fieldErrors["start"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["start"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="field-end"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["end"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    เป้าหมายส่งมอบ *
                  </label>
                  <CallyDatePicker
                    id="field-end"
                    value={form.end}
                    onChange={(val) => {
                      setForm({ ...form, end: val });
                      clearFieldError("end");
                    }}
                    min={form.start}
                    className={
                      fieldErrors["end"]
                        ? "!border-[#E11D48] !ring-2 !ring-[#E11D48]/15 !bg-[#FFF9F9]"
                        : ""
                    }
                  />
                  {fieldErrors["end"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["end"]}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="field-location"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["location"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    สถานที่ก่อสร้าง / ไซต์งาน *
                  </label>
                  <input
                    id="field-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => {
                      setForm({ ...form, location: e.target.value });
                      clearFieldError("location");
                    }}
                    placeholder="เช่น นิคมอุตสาหกรรมบางปะอิน จ.พระนครศรีอยุธยา"
                    className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border rounded-xl outline-none transition-all ${
                      fieldErrors["location"]
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9] text-[#0D255B]"
                        : "border-[#E0E7F0] focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                    }`}
                  />
                  {fieldErrors["location"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["location"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="field-value"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["value"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    มูลค่าโครงการโดยประมาณ (บาท) *
                  </label>
                  <input
                    id="field-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value || ""}
                    onChange={(e) => {
                      setForm({ ...form, value: Number(e.target.value) });
                      clearFieldError("value");
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border rounded-xl outline-none transition-all ${
                      fieldErrors["value"]
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9] text-[#0D255B]"
                        : "border-[#E0E7F0] focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                    }`}
                  />
                  {fieldErrors["value"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["value"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="field-budget"
                    className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                      fieldErrors["budget"] ? "text-[#E11D48]" : "text-[#0D255B]"
                    }`}
                  >
                    งบประมาณที่อนุมัติ (บาท) *
                  </label>
                  <input
                    id="field-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget || ""}
                    onChange={(e) => {
                      setForm({ ...form, budget: Number(e.target.value) });
                      clearFieldError("budget");
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border rounded-xl outline-none transition-all ${
                      fieldErrors["budget"]
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9] text-[#0D255B]"
                        : "border-[#E0E7F0] focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] bg-white text-[#0D255B]"
                    }`}
                  />
                  {fieldErrors["budget"] && (
                    <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fieldErrors["budget"]}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#0D255B] mb-1.5">
                    เงื่อนไขการชำระเงิน
                  </label>
                  <FlowbiteDropdown
                    id="dropdownPaymentTerms"
                    trigger={dropdownTriggerMode}
                    value={form.paymentTerms}
                    onChange={(val) =>
                      setForm({ ...form, paymentTerms: val })
                    }
                    options={[
                      { value: "", label: "เลือกเงื่อนไขการชำระเงิน" },
                      ...paymentTermsList.map((pt) => ({ value: pt, label: pt })),
                    ]}
                    placeholder="เลือกเงื่อนไขการชำระเงิน"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Work Packages & Logistics matching reference screenshots */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base sm:text-[17px] font-bold text-[#0D255B]">
                  โครงสร้างพื้นที่และชุดงาน (Step 2/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ตรวจข้อมูลในขั้นตอนนี้ก่อนดำเนินการต่อ
                </p>
              </div>

              {/* Banner: หมวดหมู่งานที่เลือก */}
              <div className="bg-[#F0F5FD] border border-[#D9E7F9] rounded-xl p-3.5 text-xs text-[#075DD8]">
                หมวดหมู่งานที่เลือก: <strong>{workTypeNames[form.type]}</strong>
              </div>

              {/* SECTION 1: รายการชุดงานย่อยประจำโครงการ (Work Packages) */}
              <div className="bg-white border border-[#E4EAF4] rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0F4FA] bg-[#FDFEFE] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#075DD8] flex items-center justify-center font-bold text-xs shrink-0 border border-[#DBEAFE]">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0D255B] flex items-center gap-2">
                        <span>รายการชุดงานย่อยประจำโครงการ</span>
                        <span className="text-xs font-normal text-[#596780]">(Work Packages)</span>
                      </h3>
                      <p className="text-xs text-[#596780] mt-0.5">
                        แต่ละโครงการใช้ชุดงานเดียว น้ำหนัก 100% · จัดการขอบเขต รายการปริมาณงาน และความพร้อมผ่านปุ่ม “รายละเอียด/แก้ไข”
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#075DD8] border border-[#BFDBFE]">
                      {form.packages.length} ชุดงาน · {totalWeight}%
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="border border-[#E4EAF4] rounded-xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                            <th className="py-2.5 px-3.5">ชุดงาน / โซน</th>
                            <th className="py-2.5 px-3.5">รายการปริมาณงาน</th>
                            <th className="py-2.5 px-3.5">น้ำหนัก</th>
                            <th className="py-2.5 px-3.5">ความพร้อม / ข้อจำกัด</th>
                            <th className="py-2.5 px-3.5 text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4FA]">
                          {form.packages.map((pkg, idx) => (
                            <tr key={idx} className="hover:bg-[#F8FAFD] transition-colors">
                              <td className="py-3 px-3.5 align-top">
                                <div className="font-bold text-xs text-[#0D255B]">{pkg.name}</div>
                                <div className="text-[11px] text-[#596780] mt-0.5">{pkg.zone || "พื้นที่หลัก"}</div>
                              </td>
                              <td className="py-3 px-3.5 align-top">
                                <div className="space-y-1">
                                  {pkg.quantities?.map((q, qIdx) => (
                                    <div key={qIdx} className="flex items-center gap-1.5 text-xs text-[#0D255B]">
                                      <span>{q.name} · {q.qty} {q.unit}</span>
                                      {q.primary && (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#075DD8] border border-[#BFDBFE]">
                                          วัดความก้าวหน้า
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-3.5 align-top font-bold text-xs text-[#0D255B]">
                                {pkg.weight}%
                              </td>
                              <td className="py-3 px-3.5 align-top">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                    pkg.siteStatus === "ready"
                                      ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                                      : pkg.siteStatus === "partial"
                                      ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                                      : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                                  }`}
                                >
                                  {readinessLabels[pkg.siteStatus] || "พื้นที่พร้อม"}
                                </span>
                                {pkg.readinessDetail && (
                                  <div className="text-[11px] text-[#596780] mt-0.5">{pkg.readinessDetail}</div>
                                )}
                                {pkg.readyDate && (
                                  <div className="text-[11px] text-[#596780] mt-0.5">คาดว่าพร้อม {formatThaiDateStr(pkg.readyDate)}</div>
                                )}
                                {pkg.constraints && (
                                  <div className="text-[11px] text-[#596780] mt-0.5">ข้อจำกัด: {pkg.constraints}</div>
                                )}
                              </td>
                              <td className="py-3 px-3.5 align-top text-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPackageModal(idx)}
                                  className="px-3 py-1.5 text-xs font-semibold text-[#075DD8] border border-[#075DD8] hover:bg-[#F0F5FD] rounded-lg transition-colors shadow-2xs"
                                >
                                  รายละเอียด/แก้ไข
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ข้อมูลการเข้าทำงานและจุดลงกองวัสดุ (Site Logistics) */}
              <div className="bg-white border border-[#E4EAF4] rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0F4FA] bg-[#FDFEFE] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-bold text-xs shrink-0 border border-[#DCFCE7]">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D255B] flex items-center gap-2">
                      <span>ข้อมูลการเข้าทำงานและจุดลงกองวัสดุ</span>
                      <span className="text-xs font-normal text-[#596780]">(Site Logistics)</span>
                    </h3>
                    <p className="text-xs text-[#596780] mt-0.5">
                      ระบุจุดขนถ่าย เส้นทางเข้า–ออก และเงื่อนไขพื้นที่ก่อนเริ่มติดตั้ง
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div>
                      <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                        จุดขนถ่ายและลงกองชิ้นส่วน
                      </label>
                      <input
                        type="text"
                        value={form.stagingArea}
                        onChange={(e) => setForm({ ...form, stagingArea: e.target.value })}
                        placeholder="เช่น Staging Area 1 · โซน A"
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] shadow-xs transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                        เส้นทางเข้า–ออกรถขนส่ง
                      </label>
                      <input
                        type="text"
                        value={form.accessRoute}
                        onChange={(e) => setForm({ ...form, accessRoute: e.target.value })}
                        placeholder="เช่น ถนนหลักนิคมฯ ฝั่งทิศตะวันออก รถบรรทุก 10 ล้อเข้าได้"
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] shadow-xs transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                        เงื่อนไขพื้นที่ก่อนเริ่มติดตั้ง
                      </label>
                      <input
                        type="text"
                        value={form.readiness}
                        onChange={(e) => setForm({ ...form, readiness: e.target.value })}
                        placeholder="เช่น พื้นที่ปรับระดับดินและลงแนวเสาเข็มพร้อมเข้าติดตั้ง"
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:outline-none focus:ring-2 focus:ring-[#075DD8]/20 focus:border-[#075DD8] shadow-xs transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: แผนงานดำเนินโครงการ */}
              <div className="bg-white border border-[#E4EAF4] rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0F4FA] bg-[#FDFEFE] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center font-bold text-xs shrink-0 border border-[#F3E8FF]">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0D255B] flex items-center gap-2">
                        <span>แผนงานดำเนินโครงการ</span>
                        <span className="text-xs font-normal text-[#596780]">(Project Schedule)</span>
                      </h3>
                      <p className="text-xs text-[#596780] mt-0.5">
                        ดูแผนงานในตาราง กด “แก้ไข” เพื่อปรับกิจกรรม วันที่ ระยะเวลา และผู้รับผิดชอบ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
                      {allPlans.length} กิจกรรม · {planTotalDays} วัน
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-[#F0F5FD] border border-[#D9E7F9] rounded-xl p-3.5 text-xs text-[#596780]">
                    ระยะเวลาเป็นวันปฏิทิน รวมวันเริ่มและวันสิ้นสุด จุดอนุมัติใช้ระยะเวลาตามหมวดงาน แผนเริ่มต้นเป็นตัวอย่าง กรุณาปรับให้เหมาะกับหน้างาน
                  </div>

                  {form.packages.map((pkg, pIdx) => (
                    <div key={pIdx} className="border border-[#E4EAF4] rounded-xl p-4 bg-white space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#F0F4FA]">
                        <h4 className="text-xs font-bold text-[#0D255B]">
                          {pkg.name} · {pkg.zone || "พื้นที่หลัก"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleResetPlan(pIdx)}
                          className="px-2.5 py-1 text-xs font-medium text-[#596780] bg-white border border-[#DFE7F2] hover:bg-[#F8FAFD] rounded-lg transition-colors shadow-2xs"
                        >
                          จัดแผนใหม่ตามระยะเวลา
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                              <th className="py-2.5 px-3">รหัส</th>
                              <th className="py-2.5 px-3">กิจกรรม</th>
                              <th className="py-2.5 px-3">ชนิดงาน</th>
                              <th className="py-2.5 px-3">งานก่อนหน้า</th>
                              <th className="py-2.5 px-3">เริ่มตามแผน</th>
                              <th className="py-2.5 px-3">สิ้นสุดตามแผน</th>
                              <th className="py-2.5 px-3">ระยะเวลา</th>
                              <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                              <th className="py-2.5 px-3 text-center">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F4FA]">
                            {pkg.plan?.map((item, planIdx) => {
                              const isGate = ["Milestone", "Hold Point"].includes(item.type) || item.code.includes("-AP");
                              return (
                                <tr key={item.code} className="hover:bg-[#F8FAFD] transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-[#0D255B]">{item.code}</td>
                                  <td className="py-2.5 px-3 text-[#0D255B]">
                                    <div>{item.title}</div>
                                    {isGate && (
                                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                                        จุดอนุมัติ
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#596780]">{item.type}</td>
                                  <td className="py-2.5 px-3 text-[#596780]">{item.predecessor || "—"}</td>
                                  <td className="py-2.5 px-3 text-[#596780] whitespace-nowrap">{formatThaiDateStr(item.start)}</td>
                                  <td className="py-2.5 px-3 text-[#596780] whitespace-nowrap">{formatThaiDateStr(item.end)}</td>
                                  <td className="py-2.5 px-3 text-[#596780] whitespace-nowrap">{item.duration} วัน</td>
                                  <td className="py-2.5 px-3 text-[#596780]">{item.responsible || "ยังไม่ระบุ"}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPlanModal(pIdx, planIdx)}
                                      className="px-2.5 py-1 text-xs font-semibold text-[#075DD8] border border-[#DFE7F2] hover:border-[#075DD8] hover:bg-[#F0F5FD] rounded-lg transition-colors"
                                    >
                                      แก้ไข
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Personnel & Team matching media_1794069180901_376a437b.png */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0D255B]">
                  แต่งตั้งทีมงานและผู้รับผิดชอบ (Step 3/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ตรวจข้อมูลในขั้นตอนนี้ก่อนดำเนินการต่อ
                </p>
              </div>

              {/* SECTION 1: บุคลากรหลักประจำโครงการ */}
              <div className="bg-white border border-[#E4EAF4] rounded-2xl shadow-xs relative z-20">
                <div className="px-5 py-4 border-b border-[#F0F4FA] bg-[#FDFEFE] rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#075DD8] flex items-center justify-center font-bold text-xs shrink-0 border border-[#DBEAFE]">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0D255B] flex items-center gap-2">
                        <span>บุคลากรหลักประจำโครงการ</span>
                        <span className="text-xs font-normal text-[#596780]">(Key Personnel)</span>
                      </h3>
                      <p className="text-xs text-[#596780] mt-0.5">
                        เลือกจากบัญชีผู้ใช้งานในระบบ การมอบหมายบทบาทโครงการไม่เปลี่ยนสิทธิ์บัญชีผู้ใช้งาน
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const assignedCount = Object.values(form.personnel).filter(Boolean).length;
                      return (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            assignedCount === 6
                              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                              : "bg-[#EFF6FF] text-[#075DD8] border border-[#BFDBFE]"
                          }`}
                        >
                          ระบุแล้ว {assignedCount} / 6 บทบาท
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "pm", label: "ผู้จัดการโครงการ (PM) *", priority: ["PM", "EXECUTIVE"] },
                      { key: "engineer", label: "วิศวกรโครงการ *", priority: ["ENGINEER", "PM"] },
                      { key: "site", label: "วิศวกรหน้างาน *", priority: ["SITE_ENGINEER", "ENGINEER"] },
                      { key: "qc", label: "ผู้ตรวจคุณภาพ (QC) *", priority: ["QC_INSPECTOR"] },
                      { key: "logistics", label: "ผู้ประสานงานคลังและขนส่ง *", priority: ["WAREHOUSE", "TRANSPORT"] },
                      { key: "cost", label: "ผู้ควบคุมต้นทุน *", priority: ["PM", "EXECUTIVE", "STAFF"] },
                    ].map((role) => {
                      const sortedUsers = [...initialUsers].sort((a, b) => {
                        const aPri = role.priority.includes(a.role) ? 1 : 0;
                        const bPri = role.priority.includes(b.role) ? 1 : 0;
                        if (aPri !== bPri) return bPri - aPri;
                        return a.name.localeCompare(b.name, "th");
                      });

                      return (
                        <div key={role.key}>
                          <label
                            htmlFor={`field-person-${role.key}`}
                            className={`block text-xs font-semibold mb-1.5 transition-colors ${
                              fieldErrors[`person-${role.key}`] ? "text-[#E11D48]" : "text-[#0D255B]"
                            }`}
                          >
                            {role.label}
                          </label>
                          <FlowbiteDropdown
                            id={`dropdown-person-${role.key}`}
                            trigger={dropdownTriggerMode}
                            value={form.personnel[role.key as keyof typeof form.personnel] || ""}
                            onChange={(val) => {
                              setForm({
                                ...form,
                                personnel: {
                                  ...form.personnel,
                                  [role.key]: val,
                                },
                              });
                              clearFieldError(`person-${role.key}`);
                            }}
                            options={[
                              { value: "", label: "เลือกผู้ใช้งาน" },
                              ...sortedUsers.map((u) => ({
                                value: u.id,
                                label: formatUserOptionLabel(u),
                              })),
                            ]}
                            placeholder="เลือกผู้ใช้งาน"
                            error={fieldErrors[`person-${role.key}`]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: ทีมช่างติดตั้งประจำแต่ละชุดงาน */}
              <div className="bg-white border border-[#E4EAF4] rounded-2xl shadow-xs relative z-10">
                <div className="px-5 py-4 border-b border-[#F0F4FA] bg-[#FDFEFE] rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-bold text-xs shrink-0 border border-[#DCFCE7]">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0D255B] flex items-center gap-2">
                        <span>ทีมช่างติดตั้งประจำแต่ละชุดงาน</span>
                        <span className="text-xs font-normal text-[#596780]">(Installation Crew)</span>
                      </h3>
                      <p className="text-xs text-[#596780] mt-0.5">
                        มอบหมายทีมช่างรับผิดชอบการติดตั้งหน้างานจริงสำหรับแต่ละชุดงาน
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                      {form.packages.length} ชุดงาน
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {form.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="border border-[#DFE7F2] rounded-xl p-4 sm:p-5 bg-white space-y-4"
                    >
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#0D255B]">
                        {pkg.name} · {pkg.zone || "พื้นที่หลัก"}
                      </h4>

                      <div>
                        <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                          เลือกทีมช่าง / ผู้รับผิดชอบ *
                        </label>
                        <FlowbiteDropdown
                          id={`dropdown-crew-${idx}`}
                          trigger={dropdownTriggerMode}
                          value={pkg.crewUserId || ""}
                          onChange={(selectedUserId) => {
                            const userObj = initialUsers.find((u) => u.id === selectedUserId);
                            const updated = [...form.packages];
                            updated[idx] = {
                              ...pkg,
                              crewUserId: selectedUserId,
                              crew: userObj ? userObj.name : (selectedUserId === "" ? "" : pkg.crew),
                            };
                            setForm({ ...form, packages: updated });
                          }}
                          options={[
                            { value: "", label: "ทีมช่างภายนอก / ระบุชื่อเอง" },
                            ...initialUsers.map((u) => ({
                              value: u.id,
                              label: formatUserOptionLabel(u),
                            })),
                          ]}
                          placeholder="เลือกทีมช่าง / ผู้รับผิดชอบ"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`field-crew-${idx}`}
                            className={`block text-xs font-semibold mb-1.5 transition-colors ${
                              fieldErrors[`crew-${idx}`] ? "text-[#E11D48]" : "text-[#0D255B]"
                            }`}
                          >
                            ชื่อทีมช่างติดตั้ง *
                          </label>
                          <input
                            id={`field-crew-${idx}`}
                            type="text"
                            readOnly={Boolean(pkg.crewUserId)}
                            value={pkg.crew}
                            onChange={(e) => {
                              handleUpdatePackage(idx, "crew", e.target.value);
                              clearFieldError(`crew-${idx}`);
                            }}
                            placeholder={pkg.crewUserId ? "" : "เช่น ทีมช่างสมศักดิ์ รั้วสำเร็จรูป"}
                            className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border rounded-xl text-[#0D255B] outline-none transition-all ${
                              fieldErrors[`crew-${idx}`]
                                ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9]"
                                : pkg.crewUserId
                                ? "border-[#DFE7F2] bg-[#F8FAFD] cursor-not-allowed text-[#596780]"
                                : "border-[#DFE7F2] bg-white focus:border-[#075DD8]"
                            }`}
                          />
                          {fieldErrors[`crew-${idx}`] && (
                            <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{fieldErrors[`crew-${idx}`]}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#0D255B] mb-1.5">
                            หัวหน้าทีม / ข้อมูลติดต่อ
                          </label>
                          <input
                            type="text"
                            value={pkg.crewContact}
                            onChange={(e) => handleUpdatePackage(idx, "crewContact", e.target.value)}
                            placeholder="เช่น 081-234-5678"
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] border border-[#DFE7F2] rounded-xl bg-white text-[#0D255B] focus:border-[#075DD8] outline-none"
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
                <h2 className="text-base sm:text-lg font-bold text-[#0D255B]">
                  ตรวจทานข้อมูลทั้งหมดก่อนสร้างโครงการ (Step 4/4)
                </h2>
                <p className="text-xs text-[#596780] mt-0.5">
                  ตรวจสอบความถูกต้องของข้อมูล รายละเอียดโครงการ พื้นที่และชุดงาน แผนงาน และผู้รับผิดชอบ
                </p>
              </div>

              {/* Review Overview Banner */}
              <div className="review-overview">
                <b>{form.name || "ยังไม่ได้ตั้งชื่อโครงการ"}</b>
                <p>
                  {workTypeNames[form.type]} ({form.type}) · {form.packages.length} ชุดงาน · บุคลากรหลัก {assignedPersonnelCount} บทบาท
                </p>
                <div className="review-jump">
                  <button
                    type="button"
                    onClick={() => scrollToSection("review-general")}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>ข้อมูลโครงการ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection("review-packages")}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>ชุดงานและแผนงาน</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection("review-team")}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>ทีมผู้รับผิดชอบ</span>
                  </button>
                </div>
              </div>

              {/* Section 1: General Info */}
              <section className="review-section" id="review-general">
                <div className="review-section-head">
                  <h3>
                    <span>1</span>
                    ข้อมูลทั่วไปและสัญญาโครงการ
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(0)}
                    className="px-3 py-1.5 rounded-lg border border-[#D0DDEC] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไขขั้นตอนที่ 1</span>
                  </button>
                </div>

                <dl className="review-data">
                  <div>
                    <dt>ชื่อโครงการ</dt>
                    <dd>{form.name || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>หมวดหมู่งาน</dt>
                    <dd>{workTypeNames[form.type]} ({form.type})</dd>
                  </div>
                  <div>
                    <dt>รหัสโครงการ</dt>
                    <dd className="text-[#596780]">ระบบกำหนดเมื่อสร้างโครงการ</dd>
                  </div>
                  <div>
                    <dt>ผู้ว่าจ้าง / ลูกค้า</dt>
                    <dd>{form.client || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>เลขที่สัญญา / PO</dt>
                    <dd>{form.contract || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>ประเภทสัญญา</dt>
                    <dd>{form.contractType || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>วันที่เริ่มสัญญา</dt>
                    <dd>{formatThaiDateStr(form.start)}</dd>
                  </div>
                  <div>
                    <dt>เป้าหมายส่งมอบ</dt>
                    <dd>{formatThaiDateStr(form.end)}</dd>
                  </div>
                  <div>
                    <dt>สถานที่ก่อสร้าง / ไซต์งาน</dt>
                    <dd>{form.location || "ยังไม่ระบุ"}</dd>
                  </div>
                  <div>
                    <dt>มูลค่าโครงการ</dt>
                    <dd className="text-[#075DD8] font-bold">
                      {Number(form.value).toLocaleString()} บาท
                    </dd>
                  </div>
                  <div>
                    <dt>งบประมาณ</dt>
                    <dd className="text-[#147747] font-bold">
                      {Number(form.budget).toLocaleString()} บาท
                    </dd>
                  </div>
                  <div>
                    <dt>เงื่อนไขการชำระเงิน</dt>
                    <dd>{form.paymentTerms || "ยังไม่ระบุ"}</dd>
                  </div>
                </dl>
              </section>

              {/* Section 2: Areas, Work Packages & Plan */}
              <section className="review-section" id="review-packages">
                <div className="review-section-head">
                  <h3>
                    <span>2</span>
                    พื้นที่ ชุดงาน และแผนดำเนินงาน
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="px-3 py-1.5 rounded-lg border border-[#D0DDEC] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไขขั้นตอนที่ 2</span>
                  </button>
                </div>

                <div className="review-package-totals">
                  <span>{form.packages.length} ชุดงาน</span>
                  <span>{form.packages.reduce((n, w) => n + (w.quantities?.length || 0), 0)} รายการปริมาณ</span>
                  <span>น้ำหนักรวม {form.packages.reduce((n, w) => n + Number(w.weight || 0), 0)}%</span>
                </div>

                {form.packages.map((w, i) => {
                  const currentTemplate = getTemplateForWorkType(form.type);
                  return (
                    <article key={i} className="review-package">
                      <h4>
                        {i + 1}. {w.name}{" "}
                        <small className="text-[#596780] font-normal">· {w.zone || "พื้นที่หลัก"}</small>
                      </h4>

                      <dl className="review-data">
                        <div>
                          <dt>ขอบเขตงาน</dt>
                          <dd>{w.scope || "ยังไม่ระบุ"}</dd>
                        </div>
                        <div>
                          <dt>น้ำหนักชุดงาน</dt>
                          <dd className="text-[#075DD8] font-bold">{w.weight}%</dd>
                        </div>
                        <div>
                          <dt>ความพร้อมพื้นที่</dt>
                          <dd>{readinessLabels[w.siteStatus] || "พื้นที่พร้อม"}</dd>
                        </div>
                        <div>
                          <dt>รายละเอียดความพร้อม</dt>
                          <dd>{w.readinessDetail || "ยังไม่ระบุ"}</dd>
                        </div>
                        <div>
                          <dt>วันที่คาดว่าพร้อม</dt>
                          <dd>{w.readyDate ? formatThaiDateStr(w.readyDate) : "ยังไม่ระบุ"}</dd>
                        </div>
                        <div>
                          <dt>ข้อจำกัด / เงื่อนไข</dt>
                          <dd>{w.constraints || "ไม่ได้ระบุข้อจำกัด"}</dd>
                        </div>
                      </dl>

                      {/* Quantities Table */}
                      <div className="mt-3">
                        <h4 className="text-xs font-bold text-[#0D255B] mb-2">รายการปริมาณงาน</h4>
                        <div className="overflow-x-auto border border-[#E4EAF4] rounded-xl">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#F8FAFD] text-[#596780] border-b border-[#E4EAF4]">
                              <tr>
                                <th className="py-2.5 px-3 font-semibold">รายการงาน</th>
                                <th className="py-2.5 px-3 font-semibold text-right">ปริมาณ</th>
                                <th className="py-2.5 px-3 font-semibold">หน่วย</th>
                                <th className="py-2.5 px-3 font-semibold text-center">การวัดความก้าวหน้า</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4FA]">
                              {(w.quantities || []).map((q, qIdx) => (
                                <tr key={qIdx} className="hover:bg-[#FBFDFF]">
                                  <td className="py-2 px-3 text-[#0D255B] font-medium">{q.name}</td>
                                  <td className="py-2 px-3 text-right text-[#0D255B] font-semibold">
                                    {q.qty.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-3 text-[#596780]">{q.unit}</td>
                                  <td className="py-2 px-3 text-center">
                                    {q.primary ? (
                                      <span className="inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E9F2FF] text-[#075DD8]">
                                        รายการหลัก
                                      </span>
                                    ) : (
                                      <span className="text-[#94A3B8]">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Plan Table */}
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-[#0D255B] mb-2">แผนงานรายกิจกรรม</h4>
                        <div className="overflow-x-auto border border-[#E4EAF4] rounded-xl review-plan-table">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#F8FAFD] text-[#596780] border-b border-[#E4EAF4]">
                              <tr>
                                <th className="py-2.5 px-3 font-semibold">รหัส</th>
                                <th className="py-2.5 px-3 font-semibold">กิจกรรม</th>
                                <th className="py-2.5 px-3 font-semibold">ชนิดงาน</th>
                                <th className="py-2.5 px-3 font-semibold">งานก่อนหน้า</th>
                                <th className="py-2.5 px-3 font-semibold">เริ่มตามแผน</th>
                                <th className="py-2.5 px-3 font-semibold">สิ้นสุดตามแผน</th>
                                <th className="py-2.5 px-3 font-semibold text-right">ระยะเวลา</th>
                                <th className="py-2.5 px-3 font-semibold">ผู้รับผิดชอบ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4FA]">
                              {(w.plan || []).map((r, rIdx) => {
                                const tmpl = currentTemplate.find((t) => t.code === r.code);
                                const isMilestone = tmpl?.type === "Milestone" || tmpl?.type === "Hold Point";
                                return (
                                  <tr key={rIdx} className="hover:bg-[#FBFDFF]">
                                    <td className="py-2 px-3 font-mono font-medium text-[#075DD8]">
                                      {r.code}
                                    </td>
                                    <td className="py-2 px-3 text-[#0D255B] font-medium">
                                      {r.title}
                                      {isMilestone && (
                                        <span className="ml-1.5 inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">
                                          จุดอนุมัติ
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-[#596780]">
                                      {tmpl?.type || r.type || "Task"}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-[#596780]">
                                      {tmpl?.predecessor || r.predecessor || "—"}
                                    </td>
                                    <td className="py-2 px-3 text-[#0D255B]">
                                      {formatThaiDateStr(r.start)}
                                    </td>
                                    <td className="py-2 px-3 text-[#0D255B]">
                                      {formatThaiDateStr(r.end)}
                                    </td>
                                    <td className="py-2 px-3 text-right text-[#0D255B]">
                                      {r.duration} วัน
                                    </td>
                                    <td className="py-2 px-3 text-[#596780]">
                                      {r.responsible || "ยังไม่ระบุ"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Site Logistics */}
                <div className="mt-4 border border-[#E4EAF4] rounded-xl p-4 bg-[#FBFDFF]">
                  <h4 className="text-xs font-bold text-[#0D255B] mb-3">การเข้าทำงานและจุดลงกองวัสดุ (Site Logistics)</h4>
                  <dl className="review-data mb-0">
                    <div>
                      <dt>จุดขนถ่าย / ลงกอง</dt>
                      <dd>{form.stagingArea || "ยังไม่ระบุ"}</dd>
                    </div>
                    <div>
                      <dt>เส้นทางเข้า–ออกรถขนส่ง</dt>
                      <dd>{form.accessRoute || "ยังไม่ระบุ"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt>เงื่อนไขพื้นที่ก่อนติดตั้ง</dt>
                      <dd>{form.readiness || "ยังไม่ระบุ"}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* Section 3: Personnel & Teams */}
              <section className="review-section" id="review-team">
                <div className="review-section-head">
                  <h3>
                    <span>3</span>
                    ทีมและผู้รับผิดชอบ
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="px-3 py-1.5 rounded-lg border border-[#D0DDEC] bg-white text-xs font-semibold text-[#075DD8] hover:bg-[#F5F8FD] flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไขขั้นตอนที่ 3</span>
                  </button>
                </div>

                {/* 6 Key Roles Table */}
                <div className="overflow-x-auto border border-[#E4EAF4] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFD] text-[#596780] border-b border-[#E4EAF4]">
                      <tr>
                        <th className="py-2.5 px-3.5 font-semibold">บทบาท</th>
                        <th className="py-2.5 px-3.5 font-semibold">ผู้รับผิดชอบ</th>
                        <th className="py-2.5 px-3.5 font-semibold">บัญชีผู้ใช้งานในระบบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4FA]">
                      {teamRolesDef.map(([id, label]) => {
                        const userId = form.personnel[id as keyof typeof form.personnel];
                        const user = initialUsers.find((u) => u.id === userId);
                        return (
                          <tr key={id} className="hover:bg-[#FBFDFF]">
                            <td className="py-2.5 px-3.5 font-medium text-[#596780]">{label}</td>
                            <td className="py-2.5 px-3.5">
                              {user ? (
                                <strong className="text-[#0D255B] font-bold">{user.name}</strong>
                              ) : (
                                <span className="text-[#B45309] font-medium">ยังไม่ได้เลือกผู้ใช้งาน</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#596780]">
                              {user ? (
                                <span>
                                  {roleNameMap[user.role] || user.role} · {user.email?.split("@")[0] || user.id}
                                </span>
                              ) : (
                                <span className="text-[#94A3B8]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Crews Table */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-[#0D255B] mb-2">ทีมช่างประจำแต่ละชุดงาน</h4>
                  <div className="overflow-x-auto border border-[#E4EAF4] rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFD] text-[#596780] border-b border-[#E4EAF4]">
                        <tr>
                          <th className="py-2.5 px-3.5 font-semibold">ชุดงาน / พื้นที่</th>
                          <th className="py-2.5 px-3.5 font-semibold">ทีมช่างติดตั้ง</th>
                          <th className="py-2.5 px-3.5 font-semibold">ประเภททีม</th>
                          <th className="py-2.5 px-3.5 font-semibold">หัวหน้าทีม / ข้อมูลติดต่อ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F4FA]">
                        {form.packages.map((w, idx) => {
                          const crewUser = initialUsers.find((u) => u.id === w.crewUserId);
                          return (
                            <tr key={idx} className="hover:bg-[#FBFDFF]">
                              <td className="py-2.5 px-3.5">
                                <strong className="text-[#0D255B] block font-bold">{w.name}</strong>
                                <small className="text-[#596780]">{w.zone || "พื้นที่หลัก"}</small>
                              </td>
                              <td className="py-2.5 px-3.5">
                                {w.crew ? (
                                  <strong className="text-[#0D255B] font-bold">{w.crew}</strong>
                                ) : (
                                  <span className="text-[#B45309] font-medium">ยังไม่ได้ระบุ</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#596780]">
                                {w.crewUserId ? (
                                  <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#E9F2FF] text-[#075DD8]">
                                      ผู้ใช้งานในระบบ
                                    </span>
                                    {crewUser && (
                                      <small className="block text-[10px] text-[#738297] mt-0.5">
                                        {formatUserOptionLabel(crewUser)}
                                      </small>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[#596780] text-xs">ทีมช่างภายนอก</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#0D255B]">
                                {w.crewContact || "ยังไม่ระบุ"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Sidebar Card (Col 4) matching website-demo / image */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#E4EAF4] shadow-xs">
            {step === 0 && (
              <>
                <h2 className="text-base font-bold text-[#0D255B] mb-4">
                  เลือกหมวดหมู่งาน (1 หมวดหมู่เท่านั้น)
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      id: "RW",
                      title: "งานกำแพงกันดิน",
                      desc: "งานคันดิน ป้องกันดินสไลด์",
                    },
                    {
                      id: "RWF",
                      title: "งานกำแพงกันดิน เสารั้ว แผ่นรั้ว ทับหลัง",
                      desc: "ทำแพงกันดินพร้อมรั้วส่วนบน",
                    },
                    {
                      id: "F",
                      title: "งานเสารั้ว แผ่นรั้ว ทับหลัง",
                      desc: "เสารั้ว แผ่นผนัง ทับหลัง",
                    },
                    {
                      id: "PT",
                      title: "งานพื้นโพสเทนชั่น",
                      desc: "งานดึงลวดอัดแรง AP1-AP7",
                    },
                  ].map((item) => {
                    const isSelected = form.type === item.id;
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3.5 p-4 rounded-xl cursor-pointer transition-all min-h-[72px] ${
                          isSelected
                            ? "border-2 border-[#1673FF] bg-white shadow-2xs"
                            : "border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? "border-2 border-[#1673FF] bg-white"
                              : "border border-[#CBD5E1] bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#1673FF]" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="workType"
                          value={item.id}
                          checked={isSelected}
                          onChange={() =>
                            handleTypeChange(item.id as "F" | "RW" | "RWF" | "PT")
                          }
                          className="sr-only"
                        />
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-bold text-[#0D255B] leading-snug">
                            {item.title}
                          </div>
                          <div className="text-[11.5px] text-[#596780] mt-0.5 leading-tight">
                            {item.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#0D255B]">
                    สรุปขั้นตอนที่ 2 · พื้นที่ ชุดงาน และแผนงาน
                  </h2>
                  <p className="text-xs text-[#596780] mt-0.5">
                    ตรวจข้อมูลก่อนเข้าสู่ขั้นตอนทีมและผู้รับผิดชอบ
                  </p>
                </div>

                {/* Stat Lines */}
                <div className="divide-y divide-[#F0F4FA] text-xs">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#596780]">หมวดหมู่งาน</span>
                    <strong className="text-[#0D255B] font-semibold">{workTypeNames[form.type]}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#596780]">จำนวนชุดงาน</span>
                    <strong className="text-[#0D255B] font-semibold">{form.packages.length} ชุดงาน</strong>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#596780]">รายการปริมาณงาน</span>
                    <strong className="text-[#0D255B] font-semibold">{totalQuantitiesCount} รายการ</strong>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#596780]">น้ำหนักรวม</span>
                    <strong className={`font-bold ${Math.abs(totalWeight - 100) < 0.01 ? "text-[#0D255B]" : "text-[#B72839]"}`}>
                      {totalWeight}%
                    </strong>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-[#596780]">ช่วงแผนดำเนินงาน</span>
                    <div className="text-right">
                      <strong className="text-[#0D255B] font-semibold block">{planDateRangeText}</strong>
                      <span className="text-[11px] text-[#596780] font-normal">{planTotalDays} วันปฏิทิน</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-[#596780]">กิจกรรม / จุดอนุมัติ</span>
                    <div className="text-right">
                      <strong className="text-[#0D255B] font-semibold block">{planTotalActivities} รายการ</strong>
                      <span className="text-[11px] text-[#596780] font-normal">{planApprovalPoints} จุดอนุมัติ</span>
                    </div>
                  </div>
                </div>

                {/* ความพร้อมของพื้นที่ */}
                <div className="pt-2 border-t border-[#F0F4FA] space-y-2">
                  <h3 className="text-xs font-bold text-[#0D255B]">ความพร้อมของพื้นที่</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                      พื้นที่พร้อม {readyCount}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                      พร้อมบางส่วน {partialCount}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                      ยังไม่พร้อม {pendingCount}
                    </span>
                  </div>
                </div>

                {/* ปริมาณงานรวมตามรายการและหน่วย */}
                <div className="pt-2 border-t border-[#F0F4FA] space-y-1.5">
                  <h3 className="text-xs font-bold text-[#0D255B]">ปริมาณงานรวมตามรายการและหน่วย</h3>
                  {quantitySummaryList.map((q, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1">
                      <span className="text-[#596780]">{q.label}</span>
                      <strong className="text-[#0D255B] font-semibold">{q.qty} {q.unit}</strong>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#738297] pt-0.5">
                    รวมเฉพาะรายการและหน่วยเดียวกัน โดยไม่รวมเมตรกับตารางเมตร
                  </p>
                </div>

                {/* รายละเอียดแต่ละชุดงาน */}
                <div className="pt-2 border-t border-[#F0F4FA] space-y-3">
                  <h3 className="text-xs font-bold text-[#0D255B]">รายละเอียดแต่ละชุดงาน</h3>
                  {form.packages.map((pkg, idx) => (
                    <details
                      key={idx}
                      open={idx === 0}
                      className="border border-[#E4EAF4] rounded-xl overflow-hidden group bg-white shadow-2xs"
                    >
                      <summary className="p-3 cursor-pointer select-none bg-[#F8FAFD] hover:bg-[#F0F5FD] flex items-center justify-between text-xs font-bold text-[#075DD8]">
                        <div>
                          <span>▼ {idx + 1}. {pkg.name}</span>
                          <span className="block text-[11px] font-normal text-[#596780] mt-0.5">
                            {pkg.zone || "พื้นที่หลัก"} · น้ำหนัก {pkg.weight}%
                          </span>
                        </div>
                      </summary>
                      <div className="p-3 text-xs space-y-2 border-t border-[#E4EAF4]">
                        <div className="grid grid-cols-2 gap-1 py-1 border-b border-[#F0F4FA]">
                          <span className="text-[#596780]">ขอบเขตงาน</span>
                          <span className="text-[#0D255B] text-right">{pkg.scope || "ยังไม่ระบุ"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 py-1 border-b border-[#F0F4FA]">
                          <span className="text-[#596780]">ความพร้อม</span>
                          <span className="text-[#0D255B] text-right">{readinessLabels[pkg.siteStatus] || "พื้นที่พร้อม"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 py-1 border-b border-[#F0F4FA]">
                          <span className="text-[#596780]">รายละเอียดความพร้อม</span>
                          <span className="text-[#0D255B] text-right">{pkg.readinessDetail || "ยังไม่ระบุ"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 py-1 border-b border-[#F0F4FA]">
                          <span className="text-[#596780]">วันที่คาดว่าพร้อม</span>
                          <span className="text-[#0D255B] text-right">{pkg.readyDate ? formatThaiDateStr(pkg.readyDate) : "ยังไม่ระบุ"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 py-1 border-b border-[#F0F4FA]">
                          <span className="text-[#596780]">ข้อจำกัด / เงื่อนไข</span>
                          <span className="text-[#0D255B] text-right">{pkg.constraints || "ไม่ได้ระบุข้อจำกัด"}</span>
                        </div>

                        {/* รายการปริมาณงาน */}
                        <div className="pt-2">
                          <h4 className="font-bold text-[11px] text-[#0D255B] mb-1">รายการปริมาณงาน</h4>
                          <div className="space-y-1.5">
                            {pkg.quantities?.map((q, qIdx) => (
                              <div key={qIdx} className="bg-[#F8FAFD] p-2 rounded-lg text-xs">
                                <div className="flex justify-between items-center font-medium">
                                  <span className="text-[#0D255B]">{q.name}</span>
                                  <strong className="text-[#0D255B]">{q.qty} {q.unit}</strong>
                                </div>
                                {q.primary && (
                                  <span className="text-[10px] text-[#075DD8] mt-0.5 block">
                                    รายการหลักสำหรับวัดความก้าวหน้า
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#0D255B]">
                    สรุปสถานะทีมและความพร้อม
                  </h2>
                  <p className="text-xs text-[#596780] mt-0.5">
                    ตรวจผู้เกี่ยวข้องและทีมช่างก่อนเข้าสู่ขั้นตอนตรวจทาน
                  </p>
                </div>

                {/* 3 Stat lines */}
                <div className="space-y-1 divide-y divide-[#F0F4FA] text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">บุคลากรหลัก</span>
                    <strong className="text-[#0D255B] font-bold">
                      {assignedPersonnelCount} / 6 บทบาท
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">ผู้ใช้งานที่ได้รับมอบหมาย</span>
                    <strong className="text-[#0D255B] font-bold">
                      {uniqueUsersCount} คน
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">ทีมช่างครบตามชุดงาน</span>
                    <strong className="text-[#0D255B] font-bold">
                      {crewCompleteCount} / {form.packages.length} ชุดงาน
                    </strong>
                  </div>
                </div>

                {/* ผู้รับผิดชอบทั้ง 6 บทบาท */}
                <div className="pt-2 border-t border-[#F0F4FA] space-y-2.5">
                  <h3 className="text-xs font-bold text-[#0D255B]">ผู้รับผิดชอบทั้ง 6 บทบาท</h3>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    {teamRolesDef.map(([roleId, roleLabel]) => {
                      const userId = form.personnel[roleId as keyof typeof form.personnel];
                      const userObj = initialUsers.find((u) => u.id === userId);

                      return (
                        <div key={roleId} className="text-xs">
                          <span className="text-[11px] text-[#596780] font-medium block leading-tight">
                            {roleLabel}
                          </span>
                          {userObj ? (
                            <div className="mt-0.5">
                              <strong className="text-[#0D255B] font-bold block leading-snug break-words">
                                {userObj.name}
                              </strong>
                              <small className="text-[#738297] text-[10.5px] block leading-tight break-words">
                                {roleNameMap[userObj.role] || userObj.role} · {userObj.email?.split("@")[0] || userObj.id}
                              </small>
                            </div>
                          ) : (
                            <span className="text-[#B45309] text-[11px] font-medium block mt-0.5 leading-tight">
                              ยังไม่ได้เลือกผู้ใช้งาน
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {assignedPersonnelCount > uniqueUsersCount && (
                    <p className="text-[11px] text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] p-2.5 rounded-lg">
                      มีผู้ใช้งานรับผิดชอบมากกว่า 1 บทบาท กรุณาตรวจความเหมาะสม
                    </p>
                  )}
                </div>

                {/* ทีมช่างและความพร้อมรายชุดงาน */}
                <div className="pt-2 border-t border-[#F0F4FA] space-y-3">
                  <h3 className="text-xs font-bold text-[#0D255B]">ทีมช่างและความพร้อมรายชุดงาน</h3>
                  {form.packages.map((w, i) => (
                    <div key={i} className="border border-[#E4EAF4] rounded-xl p-3 bg-white space-y-2 text-xs shadow-2xs">
                      <div>
                        <strong className="text-[#0D255B] block font-bold">{i + 1}. {w.name}</strong>
                        <small className="text-[#596780] block text-[11px] mt-0.5">
                          {w.zone || "พื้นที่หลัก"} · น้ำหนัก {w.weight}%
                        </small>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs border-t border-[#F0F4FA]">
                        <div className="flex justify-between items-start py-0.5">
                          <span className="text-[#596780]">ทีมช่างติดตั้ง</span>
                          <div className="text-right">
                            {w.crew ? (
                              <span className="text-[#0D255B] font-bold">{w.crew}</span>
                            ) : (
                              <span className="text-[#B45309] font-medium">ยังไม่ได้ระบุ</span>
                            )}
                            <small className="text-[#738297] text-[10px] block">
                              {w.crewUserId ? `ผู้ใช้งานในระบบ · ${w.crewUserId}` : "ทีมช่างภายนอก / ระบุชื่อเอง"}
                            </small>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-[#596780]">หัวหน้าทีม / ติดต่อ</span>
                          <span className="text-[#0D255B] text-right font-medium">{w.crewContact || "ยังไม่ระบุ"}</span>
                        </div>

                        <div className="flex justify-between items-start py-0.5">
                          <span className="text-[#596780]">ความพร้อมพื้นที่</span>
                          <div className="text-right text-[#0D255B]">
                            <span className="font-medium">{readinessLabels[w.siteStatus] || "พื้นที่พร้อม"}</span>
                            {w.readinessDetail && (
                              <span className="block text-[10.5px] text-[#596780]">{w.readinessDetail}</span>
                            )}
                            {w.readyDate && (
                              <span className="block text-[10.5px] text-[#075DD8]">คาดว่าพร้อม {formatThaiDateStr(w.readyDate)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-[#596780]">ข้อจำกัด</span>
                          <span className="text-[#0D255B] text-right">{w.constraints || "ไม่ได้ระบุข้อจำกัด"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Notice Box */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    teamIssuesList.length > 0
                      ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                      : "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                  }`}
                >
                  <strong className="font-bold block">
                    {teamIssuesList.length > 0 ? "รายการที่ต้องเติมก่อนถัดไป" : "ข้อมูลทีมครบ พร้อมไปขั้นตอนถัดไป"}
                  </strong>
                  {teamIssuesList.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {teamIssuesList.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] block">เลือกบุคลากรหลักครบและระบุทีมช่างทุกชุดงานแล้ว</span>
                  )}
                </div>

                <p className="text-[11px] text-[#738297]">
                  ข้อมูลติดต่อที่ยังไม่ระบุสามารถเพิ่มเติมได้ ความพร้อมพื้นที่แสดงจากขั้นตอนที่ 2
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#0D255B]">
                    ความครบถ้วนก่อนเปิดงาน
                  </h2>
                  <p className="text-xs text-[#596780] mt-0.5">
                    ตรวจความพร้อมทุกด้านก่อนกดยืนยันสร้างโครงการ
                  </p>
                </div>

                {/* Stat lines */}
                <div className="space-y-1 divide-y divide-[#F0F4FA] text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">หมวดหมู่งาน</span>
                    <strong className="text-[#0D255B] font-bold">
                      {workTypeNames[form.type]}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">จำนวนชุดงาน</span>
                    <strong className="text-[#0D255B] font-bold">
                      {form.packages.length} ชุดงาน
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">น้ำหนักรวม</span>
                    <strong className="text-[#075DD8] font-bold">
                      {form.packages.reduce((n, w) => n + Number(w.weight || 0), 0)}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">บุคลากรหลัก</span>
                    <strong className="text-[#0D255B] font-bold">
                      {assignedPersonnelCount} / 6 บทบาท
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">แผนงานและจุดอนุมัติ</span>
                    <strong className="text-[#0D255B] font-bold">
                      {planTotalActivities} กิจกรรม ({planApprovalPoints} จุดอนุมัติ)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#596780]">ช่วงสัญญา</span>
                    <strong className="text-[#0D255B] font-medium text-right text-[11.5px]">
                      {formatThaiDateStr(form.start)} – {formatThaiDateStr(form.end)}
                    </strong>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="pt-2 border-t border-[#F0F4FA] space-y-2">
                  <h3 className="text-xs font-bold text-[#0D255B]">รายการตรวจสอบความพร้อม</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[#147747]">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>ข้อมูลทั่วไปและสัญญาครบถ้วน</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#147747]">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>WBS และน้ำหนักรวม 100%</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#147747]">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>แผนงานดำเนินโครงการและจุดอนุมัติครบ</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#147747]">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>บุคลากรหลัก 6 บทบาท และทีมช่างครบถ้วน</span>
                    </div>
                  </div>
                </div>

                {/* Ready notice box */}
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 text-xs text-[#065F46] space-y-1">
                  <strong className="font-bold block">ตรวจครบทั้ง 3 ขั้นตอน</strong>
                  <p className="text-[11px] leading-relaxed">
                    กด &ldquo;สร้างโครงการ&rdquo; เพื่อเปิดหน้าต่างยืนยัน โครงการเริ่มในสถานะร่างสำหรับส่งเปิดโครงการตามขั้นตอนอนุมัติ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notice Box below Category Card (matching image) */}
          {step === 0 && (
            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC] text-[#526680] text-xs leading-relaxed">
              <strong className="block text-[#0D255B] font-bold mb-0.5">
                1 โครงการ 1 หมวดหมู่เท่านั้น
              </strong>
              <span>
                เลือกประเภทงานเพื่อสร้าง Master Template และงานตรวจรับตามหมวดหมู่
              </span>
            </div>
          )}

          {/* Stepper Navigation Buttons (matching image) */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-[1fr_1.35fr] gap-2.5">
              <button
                type="button"
                disabled={step === 0 || busy}
                onClick={handleBack}
                className="px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-[13px] font-semibold text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                <span>← ย้อนกลับ</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleNext}
                className="px-5 py-3 rounded-xl btn-gradient-pcc text-white text-xs sm:text-[13.5px] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(90deg, #0867e8, #12a77c)",
                  color: "#ffffff",
                }}
              >
                <span>{step === 3 ? "สร้างโครงการ" : "ถัดไป"}</span>
                {step === 3 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="text-right pt-1">
              <Link
                href="/projects"
                className="text-xs text-[#64748B] hover:text-[#0D255B] hover:underline"
              >
                กลับรายการโครงการ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Work Package Edit Modal */}
      {editingPackageIndex !== null && packageDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#DFE7F2] overflow-visible my-auto">
            {/* Modal Head */}
            <div className="flex items-center justify-between p-5 border-b border-[#E4EAF4] bg-[#F8FAFD] rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-[#0D255B]">
                  รายละเอียด / แก้ไขชุดงาน
                </h3>
                <span className="text-xs text-[#596780]">
                  ชุดงาน {editingPackageIndex + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPackageIndex(null);
                  setPackageDraft(null);
                }}
                className="p-1.5 text-[#596780] hover:text-[#0D255B] hover:bg-[#EDF2F7] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* 4-Field Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ชื่อชุดงาน *
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={packageDraft.name}
                    className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-[#F5F7FB] text-[#596780] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    โซน / พื้นที่ *
                  </label>
                  <input
                    type="text"
                    required
                    value={packageDraft.zone}
                    onChange={(e) =>
                      setPackageDraft({ ...packageDraft, zone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ขอบเขตแนวงาน
                  </label>
                  <input
                    type="text"
                    value={packageDraft.scope || ""}
                    onChange={(e) =>
                      setPackageDraft({ ...packageDraft, scope: e.target.value })
                    }
                    placeholder="เช่น แนวรั้วด้านทิศเหนือและทิศใต้"
                    className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    น้ำหนัก (%) *
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={packageDraft.weight}
                    className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-[#F5F7FB] text-[#596780] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* รายการปริมาณงาน */}
              <div className="space-y-3 pt-3 border-t border-[#E4EAF4]">
                <div>
                  <h4 className="text-sm font-bold text-[#0D255B]">รายการปริมาณงาน</h4>
                  <p className="text-xs text-[#596780] mt-0.5">
                    งานกำแพงและรั้วระบุเป็นแนวของแต่ละด้าน เลือกเมตรสำหรับความยาว หรือตร.ม.สำหรับพื้นที่ และเลือกรายการหลัก 1 รายการเพื่อวัดความก้าวหน้า
                  </p>
                </div>

                <div className="border border-[#E4EAF4] rounded-xl bg-white overflow-visible">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFD] border-b border-[#E4EAF4] text-[#596780] font-semibold">
                        <th className="py-2.5 px-3 text-center w-12">วัดความก้าวหน้า</th>
                        <th className="py-2.5 px-3 min-w-[170px]">รายการงาน</th>
                        <th className="py-2.5 px-3 min-w-[150px]">ชื่อ / รายละเอียด</th>
                        <th className="py-2.5 px-3 w-24">ปริมาณ</th>
                        <th className="py-2.5 px-3 min-w-[110px]">หน่วย</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4FA]">
                      {packageDraft.quantities?.map((q, qI) => {
                        const catalog = packageCatalog[form.type] || packageCatalog["F"];
                        const units = catalog.find((c) => c[0] === q.kind)?.[2] || ["เมตร", "ตร.ม."];
                        return (
                          <tr key={q.id || qI} className="hover:bg-[#F8FAFD]">
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="radio"
                                name="primary-quantity"
                                checked={q.primary}
                                onChange={() => {
                                  const updated = packageDraft.quantities.map((item, idx) => ({
                                    ...item,
                                    primary: idx === qI,
                                  }));
                                  setPackageDraft({
                                    ...packageDraft,
                                    quantities: updated,
                                    target: q.qty,
                                    unit: q.unit,
                                  });
                                }}
                                className="w-4 h-4 text-[#075DD8] focus:ring-[#075DD8]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <FlowbiteDropdown
                                id={`dropdown-qty-kind-${qI}`}
                                trigger={dropdownTriggerMode}
                                value={q.kind}
                                onChange={(kindVal) => {
                                  const found = catalog.find((c) => c[0] === kindVal);
                                  const updated = [...packageDraft.quantities];
                                  updated[qI] = {
                                    ...q,
                                    kind: kindVal,
                                    name: found ? found[1] : q.name,
                                    unit: found ? found[2][0] : q.unit,
                                  };
                                  setPackageDraft({ ...packageDraft, quantities: updated });
                                }}
                                options={catalog.map((c) => ({
                                  value: c[0],
                                  label: c[1],
                                }))}
                                buttonClassName="inline-flex items-center justify-between w-full min-h-[36px] px-3 py-1.5 text-xs font-medium border rounded-lg bg-white text-[#0D255B] shadow-xs transition-all cursor-pointer box-border border-[#DFE7F2] hover:border-[#075DD8] hover:bg-[#FBFDFF] focus:border-[#075DD8] focus:ring-2 focus:ring-[#075DD8]/15"
                                menuClassName="w-60 min-w-[220px]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={q.name}
                                onChange={(e) => {
                                  const updated = [...packageDraft.quantities];
                                  updated[qI] = { ...q, name: e.target.value };
                                  setPackageDraft({ ...packageDraft, quantities: updated });
                                }}
                                className="w-full min-h-[36px] px-3 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0.001"
                                step="any"
                                value={q.qty}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const updated = [...packageDraft.quantities];
                                  updated[qI] = { ...q, qty: val };
                                  setPackageDraft({
                                    ...packageDraft,
                                    quantities: updated,
                                    target: q.primary ? val : packageDraft.target,
                                  });
                                }}
                                className="w-full min-h-[36px] px-3 py-1.5 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <FlowbiteDropdown
                                id={`dropdown-qty-unit-${qI}`}
                                trigger={dropdownTriggerMode}
                                value={q.unit}
                                onChange={(unitVal) => {
                                  const updated = [...packageDraft.quantities];
                                  updated[qI] = { ...q, unit: unitVal };
                                  setPackageDraft({
                                    ...packageDraft,
                                    quantities: updated,
                                    unit: q.primary ? unitVal : packageDraft.unit,
                                  });
                                }}
                                options={units.map((u) => ({
                                  value: u,
                                  label: u,
                                }))}
                                buttonClassName="inline-flex items-center justify-between w-full min-h-[36px] px-2.5 py-1.5 text-xs font-medium border rounded-lg bg-white text-[#0D255B] shadow-xs transition-all cursor-pointer box-border border-[#DFE7F2] hover:border-[#075DD8] hover:bg-[#FBFDFF] focus:border-[#075DD8] focus:ring-2 focus:ring-[#075DD8]/15"
                                menuClassName="w-28 min-w-[110px]"
                              />
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              {packageDraft.quantities.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = packageDraft.quantities.filter((_, idx) => idx !== qI);
                                    if (q.primary && filtered.length > 0) {
                                      filtered[0].primary = true;
                                    }
                                    setPackageDraft({ ...packageDraft, quantities: filtered });
                                  }}
                                  className="text-[#B72839] hover:bg-[#FFEDF0] p-1 rounded-md"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const catalog = packageCatalog[form.type] || packageCatalog["F"];
                    const first = catalog[0];
                    setPackageDraft({
                      ...packageDraft,
                      quantities: [
                        ...packageDraft.quantities,
                        {
                          id: `q-${Date.now()}`,
                          kind: first[0],
                          name: first[1],
                          qty: 10,
                          unit: first[2][0],
                          primary: false,
                        },
                      ],
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#075DD8] bg-[#F0F5FD] hover:bg-[#E0EDFD] rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มรายการปริมาณงาน</span>
                </button>
              </div>

              {/* ความพร้อมและข้อจำกัดของชุดงาน */}
              <div className="space-y-4 pt-3 border-t border-[#E4EAF4]">
                <h4 className="text-sm font-bold text-[#0D255B]">ความพร้อมและข้อจำกัดของชุดงาน</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      ความพร้อมพื้นที่ *
                    </label>
                    <FlowbiteDropdown
                      id="dropdownSiteStatus"
                      trigger={dropdownTriggerMode}
                      value={packageDraft.siteStatus}
                      onChange={(val) =>
                        setPackageDraft({ ...packageDraft, siteStatus: val })
                      }
                      options={[
                        { value: "ready", label: "พื้นที่พร้อม" },
                        { value: "partial", label: "พร้อมบางส่วน" },
                        { value: "pending", label: "ยังไม่พร้อม" },
                      ]}
                      placeholder="เลือกความพร้อมพื้นที่"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      วันที่คาดว่าพื้นที่พร้อม
                    </label>
                    <CallyDatePicker
                      value={packageDraft.readyDate || ""}
                      onChange={(val) =>
                        setPackageDraft({ ...packageDraft, readyDate: val })
                      }
                      size="sm"
                      placeholder="ระบุวันที่คาดว่าพร้อม"
                      align="left"
                      expandContainer={true}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      รายละเอียดความพร้อม / งานที่ยังค้าง
                    </label>
                    <textarea
                      rows={2}
                      value={packageDraft.readinessDetail || ""}
                      onChange={(e) =>
                        setPackageDraft({ ...packageDraft, readinessDetail: e.target.value })
                      }
                      placeholder="ระบุงานที่ยังค้าง เช่น รอเทลานคอนกรีต..."
                      className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                      ข้อจำกัด / เงื่อนไขก่อนเข้าทำงาน
                    </label>
                    <textarea
                      rows={2}
                      value={packageDraft.constraints || ""}
                      onChange={(e) =>
                        setPackageDraft({ ...packageDraft, constraints: e.target.value })
                      }
                      placeholder="เช่น รอส่งมอบพื้นที่ จำกัดเวลารถเข้า หรือรออนุมัติแบบ"
                      className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E4EAF4] bg-[#F8FAFD] rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setEditingPackageIndex(null);
                  setPackageDraft(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#596780] hover:bg-[#EDF2F7] rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSavePackageModal}
                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all btn-gradient-pcc cursor-pointer flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(90deg, #0867e8, #12a77c)",
                  color: "#ffffff",
                }}
              >
                <Check className="w-4 h-4" />
                <span>บันทึกชุดงาน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Activity Edit Modal */}
      {editingPlanItem !== null && planDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-[#DFE7F2] overflow-visible my-auto transition-all duration-200">
            {/* Modal Head */}
            <div className="flex items-center justify-between p-5 border-b border-[#E4EAF4] bg-[#F8FAFD] rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-[#0D255B]">
                  แก้ไขแผนงาน
                </h3>
                <span className="text-xs text-[#596780]">
                  {form.packages[editingPlanItem.packageIndex]?.name} · {planDraft.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPlanItem(null);
                  setPlanDraft(null);
                }}
                className="p-1.5 text-[#596780] hover:text-[#0D255B] hover:bg-[#EDF2F7] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="text-xs text-[#596780]">
                {planDraft.type} · งานก่อนหน้า {planDraft.predecessor || "—"}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                  กิจกรรม *
                </label>
                <input
                  type="text"
                  required
                  value={planDraft.title}
                  onChange={(e) =>
                    setPlanDraft({ ...planDraft, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-start">
                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    เริ่มตามแผน *
                  </label>
                  <CallyDatePicker
                    value={planDraft.start}
                    onChange={(newStart) => {
                      const endVal = addPlanDays(newStart, Math.max(0, planDraft.duration - 1));
                      setPlanDraft({ ...planDraft, start: newStart, end: endVal });
                    }}
                    size="sm"
                    required
                    align="left"
                    expandContainer={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    สิ้นสุดตามแผน *
                  </label>
                  <CallyDatePicker
                    value={planDraft.end}
                    onChange={(newEnd) => {
                      const dur = planDays(planDraft.start, newEnd);
                      setPlanDraft({ ...planDraft, end: newEnd, duration: dur });
                    }}
                    size="sm"
                    required
                    align="right"
                    expandContainer={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ระยะเวลา (วัน) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planDraft.duration}
                    onChange={(e) => {
                      const dur = Number(e.target.value) || 1;
                      const newEnd = addPlanDays(planDraft.start, Math.max(0, dur - 1));
                      setPlanDraft({ ...planDraft, duration: dur, end: newEnd });
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D255B] mb-1">
                    ผู้รับผิดชอบ
                  </label>
                  <input
                    type="text"
                    value={planDraft.responsible || ""}
                    onChange={(e) =>
                      setPlanDraft({ ...planDraft, responsible: e.target.value })
                    }
                    placeholder="เช่น วิศวกรหน้างาน"
                    className="w-full px-3 py-2 text-xs border border-[#DFE7F2] rounded-lg bg-white text-[#0D255B]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E4EAF4] bg-[#F8FAFD] rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setEditingPlanItem(null);
                  setPlanDraft(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#596780] hover:bg-[#EDF2F7] rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSavePlanModal}
                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all btn-gradient-pcc cursor-pointer flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(90deg, #0867e8, #12a77c)",
                  color: "#ffffff",
                }}
              >
                <Check className="w-4 h-4" />
                <span>บันทึกแผนงาน</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all btn-gradient-pcc cursor-pointer flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(90deg, #0867e8, #12a77c)",
                  color: "#ffffff",
                }}
              >
                {busy ? (
                  <span>กำลังบันทึก...</span>
                ) : (
                  <>
                    <span>ยืนยันสร้างโครงการ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
