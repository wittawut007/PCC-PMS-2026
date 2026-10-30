"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FolderKanban,
  PlusCircle,
  Package,
  Factory,
  Truck,
  ShieldCheck,
  Calendar,
  Wallet,
  BarChart3,
  Users,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "หน้าหลัก",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "โครงการทั้งหมด",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "สร้างโครงการ",
    href: "/projects/new",
    icon: PlusCircle,
  },
  {
    label: "วัสดุและเอกสารคลัง",
    href: "/materials",
    icon: Package,
  },
  {
    label: "ติดตามการผลิต",
    href: "/production",
    icon: Factory,
  },
  {
    label: "ขนส่งและตรวจรับ",
    href: "/transport",
    icon: Truck,
  },
  {
    label: "ติดตั้งและ QC",
    href: "/installation",
    icon: ShieldCheck,
  },
  {
    label: "แผนงาน",
    href: "/planning",
    icon: Calendar,
  },
  {
    label: "งบประมาณ / ต้นทุน",
    href: "/costs",
    icon: Wallet,
  },
  {
    label: "รายงานสรุป",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "พอร์ทัลเจ้าของ",
    href: "/owner",
    icon: Users,
  },
  {
    label: "ตั้งค่า",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] bg-white border-r border-[#E4EAF4] flex flex-col h-full flex-shrink-0 z-30 select-none">
      {/* Brand Header — Exact SVG 01 / 02 Style */}
      <div className="px-5 py-4 border-b border-[#E4EAF4]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <svg
              viewBox="20 10 50 55"
              className="w-9 h-9"
              fill="none"
              stroke="#1673FF"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M29 47V32l22-14" />
              <path d="M40 55V38l17-11" />
              <path d="M51 58V46l11-7" />
            </svg>
          </div>
          <div>
            <div className="text-[#0D255B] font-extrabold text-2xl tracking-tight leading-none">
              PCC
            </div>
            <div className="text-[#0D255B] font-semibold text-[8.5px] tracking-wider mt-0.5 leading-none">
              PROJECT MANAGEMENT
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Section Label */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold text-[#596780] tracking-wider uppercase">
          WORKSPACE
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#EAF3FF] text-[#075DD8] font-semibold shadow-xs"
                  : "text-[#263B60] hover:bg-[#F5F8FD] hover:text-[#0D255B]"
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                  isActive ? "text-[#075DD8]" : "text-[#7086A8]"
                )}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area */}
      <div className="p-3 border-t border-[#E4EAF4] space-y-2">
        {/* Support Box (SVG: ศูนย์ช่วยเหลือ) */}
        <div className="bg-[#F3F7FC] rounded-xl p-3 border border-[#E9EFF7]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#075DD8]" />
            <span className="text-xs font-semibold text-[#0D255B]">
              ศูนย์ช่วยเหลือ
            </span>
          </div>
          <p className="text-[11px] text-[#596780] mt-1 leading-normal">
            คู่มือและการติดต่อทีมงาน
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#EAF3FF] text-[#075DD8] font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user.role === "PM"
                ? "PM"
                : user.role === "SYSTEM_ADMIN"
                ? "AD"
                : user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#0D255B] truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-[#596780] truncate">
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="ออกจากระบบ"
            className="p-1.5 text-[#7086A8] hover:text-[#B72839] hover:bg-[#FFF0F1] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
