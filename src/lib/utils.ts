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
