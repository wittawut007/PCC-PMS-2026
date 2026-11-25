"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Home,
  Folder,
  FolderKanban,
  Plus,
  PlusCircle,
  Package,
  Box,
  Factory,
  Truck,
  ShieldCheck,
  Calendar,
  Bell,
  CheckSquare,
  Wallet,
  BarChart3,
  Check,
  ClipboardCheck,
  User,
  Users,
  Settings,
  FileText,
} from "lucide-react";

interface CrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ContentBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/projects/new") {
    return null;
  }

  const getBreadcrumbItems = (): CrumbItem[] => {
    // 1. Dashboard
    if (pathname === "/dashboard" || pathname === "/") {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ภาพรวมระบบ", icon: Home },
      ];
    }

    // 2. Projects
    if (pathname === "/projects/new") {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "โครงการทั้งหมด", href: "/projects" },
        { label: "สร้างโครงการ", icon: Plus },
      ];
    }
    if (pathname.startsWith("/projects/")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "โครงการทั้งหมด", href: "/projects" },
        { label: "รายละเอียดโครงการ", icon: Folder },
      ];
    }
    if (pathname === "/projects") {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "โครงการทั้งหมด", icon: Folder },
      ];
    }

    // 3. Materials
    if (pathname.startsWith("/materials/request")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "วัสดุและคลัง", href: "/materials" },
        { label: "สร้างคำขอเบิกวัสดุ", icon: Plus },
      ];
    }
    if (pathname.startsWith("/materials/dispatch")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "วัสดุและคลัง", href: "/materials" },
        { label: "บันทึกตัดจ่ายคลัง", icon: Box },
      ];
    }
    if (pathname.startsWith("/materials")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "วัสดุและคลัง", icon: Box },
      ];
    }

    // 4. Production
    if (pathname.startsWith("/production")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตามการผลิต", icon: Factory },
      ];
    }

    // 5. Transport
    if (pathname.startsWith("/transport/receiving")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ขนส่งและตรวจรับ", href: "/transport" },
        { label: "บันทึกตรวจรับสินค้า", icon: Truck },
      ];
    }
    if (pathname.startsWith("/transport")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ขนส่งและตรวจรับ", icon: Truck },
      ];
    }

    // 6. Installation & QC
    if (pathname.startsWith("/installation/daily-log")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตั้งและ QC", href: "/installation" },
        { label: "บันทึกผลงานประจำวัน", icon: FileText },
      ];
    }
    if (pathname.startsWith("/installation/inspection")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตั้งและ QC", href: "/installation" },
        { label: "ตรวจคำขอ QC (IR)", icon: ShieldCheck },
      ];
    }
    if (pathname.startsWith("/installation/ncr")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตั้งและ QC", href: "/installation" },
        { label: "บันทึกข้อบกพร่อง (NCR)", icon: ShieldCheck },
      ];
    }
    if (pathname.startsWith("/installation/workflow")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตั้งและ QC", href: "/installation" },
        { label: "Workflow ติดตามงาน", icon: ShieldCheck },
      ];
    }
    if (pathname.startsWith("/installation/gates")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตั้งและ QC", href: "/installation" },
        { label: "Quality Gate AP1–AP7", icon: ShieldCheck },
      ];
    }
    if (pathname.startsWith("/installation")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ติดตั้งและ QC", icon: ShieldCheck },
      ];
    }

    // 7. Planning
    if (pathname.startsWith("/planning")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "แผนงาน / ปฏิทิน", icon: Calendar },
      ];
    }

    // 8. Approvals
    if (pathname.startsWith("/approvals")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "งานรออนุมัติ", icon: Bell },
      ];
    }

    // 9. Costs & Budget
    if (pathname.startsWith("/costs") || pathname.startsWith("/budget")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "งบประมาณ / ต้นทุน", icon: Wallet },
      ];
    }

    // 10. Reports
    if (pathname.startsWith("/reports")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "รายงานสรุป", icon: BarChart3 },
      ];
    }

    // 11. Handover
    if (pathname.startsWith("/handover")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ส่งมอบโครงการ", icon: Check },
      ];
    }

    // 12. Owner Portal
    if (pathname.startsWith("/owner")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "พอร์ทัลเจ้าของ", icon: User },
      ];
    }

    // 13. Settings
    if (pathname.startsWith("/settings")) {
      return [
        { label: "PCC PMS", href: "/dashboard" },
        { label: "ตั้งค่าระบบและสิทธิ์", icon: Settings },
      ];
    }

    // Default Fallback
    return [
      { label: "PCC PMS", href: "/dashboard" },
      { label: pathname.replace(/^\//, ""), icon: FileText },
    ];
  };

  const items = getBreadcrumbItems();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs select-none">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const Icon = item.icon;

        return (
          <div key={idx} className="flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
            )}
            {isLast ? (
              <span className="flex items-center gap-1.5 font-semibold text-[#0D255B]">
                {Icon && <Icon className="w-3.5 h-3.5 text-[#075DD8] flex-shrink-0" />}
                <span>{item.label}</span>
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-[#7086A8] hover:text-[#0D255B] font-medium transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#7086A8] font-medium">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
