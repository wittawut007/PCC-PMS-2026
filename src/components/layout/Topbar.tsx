"use client";

import { Bell } from "lucide-react";
import { userRoleLabel } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const roleLabel = user.role ? (userRoleLabel[user.role] ?? user.role) : "";

  // Dynamic breadcrumb matching SVG format
  const getBreadcrumb = () => {
    if (pathname.startsWith("/projects/new")) {
      return "PCC PMS / พื้นที่ทำงาน / สร้างโครงการใหม่";
    }
    if (pathname.startsWith("/projects/")) {
      return "PCC PMS / โครงการทั้งหมด / รายละเอียดโครงการ";
    }
    if (pathname.startsWith("/projects")) {
      return "PCC PMS / พื้นที่ทำงาน / โครงการทั้งหมด";
    }
    if (pathname.startsWith("/dashboard")) {
      return "PCC PMS / 2026";
    }
    return "PCC PMS / 2026";
  };

  const getRoleAbbr = () => {
    switch (user.role) {
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
        return user.name?.[0]?.toUpperCase() ?? "U";
    }
  };

  const getRoleFullTitle = () => {
    switch (user.role) {
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
        return roleLabel;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E4EAF4] flex items-center justify-between px-6 flex-shrink-0 z-20">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium text-[#4F668D]">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 text-[#7086A8] hover:text-[#0D255B] hover:bg-[#F5F8FC] rounded-lg transition-colors"
          title="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B72839] rounded-full border-2 border-white" />
        </button>

        <div className="h-6 w-px bg-[#E4EAF4]" />

        {/* User Profile Badge (Exact SVG Topbar layout) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EAF3FF] flex items-center justify-center flex-shrink-0 text-[#075DD8] font-bold text-xs">
            {getRoleAbbr()}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-[#0D255B] leading-tight">
              {user.name}
            </div>
            <div className="text-[10px] text-[#596780] leading-tight mt-0.5">
              {getRoleFullTitle()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
