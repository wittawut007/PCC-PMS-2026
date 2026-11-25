import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format Thai date */
export function formatThaiDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format currency in THB */
export function formatBaht(amount: number | string | null | undefined): string {
  if (amount == null) return "—";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(n);
}

/** Map project work type to Thai label */
export const workTypeLabel: Record<string, string> = {
  F: "งานเสารั้ว",
  RW: "งานกำแพงกันดิน",
  RWF: "งานกำแพงกันดิน + เสารั้ว",
  PT: "งานพื้นโพสเทนชั่น",
};

/** Map project status to Thai label */
export const projectStatusLabel: Record<string, string> = {
  DRAFT: "ร่าง",
  ACTIVE: "ดำเนินงาน",
  ON_HOLD: "พักงาน",
  COMPLETED: "เสร็จสิ้น",
  CLOSED: "ปิดโครงการ",
};

/** Map user role to Thai label */
export const userRoleLabel: Record<string, string> = {
  SYSTEM_ADMIN: "ผู้ดูแลระบบ",
  EXECUTIVE: "ผู้บริหาร",
  PM: "ผู้จัดการโครงการ",
  ENGINEER: "วิศวกรโครงการ",
  SITE_ENGINEER: "วิศวกรหน้างาน",
  QC_INSPECTOR: "QC",
  WAREHOUSE: "คลัง/จัดซื้อ",
  TRANSPORT: "ขนส่ง",
  OWNER: "เจ้าของโครงการ",
  STAFF: "พนักงาน",
};

/** Get abbreviated role badge string (e.g. PM, AD, EX, EN, SE, QC, WH, TR, OW) */
export function getRoleAbbr(role?: string | null, name?: string | null): string {
  switch (role) {
    case "PM":
      return "PM";
    case "SYSTEM_ADMIN":
      return "AD";
    case "EXECUTIVE":
      return "EX";
    case "ENGINEER":
      return "EN";
    case "SITE_ENGINEER":
      return "SE";
    case "QC_INSPECTOR":
      return "QC";
    case "WAREHOUSE":
      return "WH";
    case "TRANSPORT":
      return "TR";
    case "OWNER":
      return "OW";
    default:
      return name?.[0]?.toUpperCase() ?? "U";
  }
}

/** Get full descriptive role title (e.g. PM / Project Manager) */
export function getRoleFullTitle(role?: string | null): string {
  switch (role) {
    case "PM":
      return "PM / Project Manager";
    case "SYSTEM_ADMIN":
      return "Admin / ผู้ดูแลระบบ";
    case "EXECUTIVE":
      return "Executive / ผู้บริหาร";
    case "ENGINEER":
      return "Project Engineer / วิศวกรโครงการ";
    case "SITE_ENGINEER":
      return "Site Engineer / วิศวกรหน้างาน";
    case "QC_INSPECTOR":
      return "QC / Inspector";
    case "WAREHOUSE":
      return "Warehouse / คลังสินค้า";
    case "TRANSPORT":
      return "Transport / เจ้าหน้าที่ขนส่ง";
    case "OWNER":
      return "Owner / เจ้าของโครงการ";
    default:
      return role ? (userRoleLabel[role] ?? role) : "";
  }
}

