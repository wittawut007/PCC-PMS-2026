"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Package,
  Truck,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "ภาพรวมงานวันนี้",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "โครงการทั้งหมด",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "แผนงาน",
    href: "/planning",
    icon: ClipboardList,
  },
  {
    label: "วัสดุและคลัง",
    href: "/materials",
    icon: Package,
  },
  {
    label: "ขนส่ง",
    href: "/transport",
    icon: Truck,
  },
  {
    label: "QC และ NCR",
    href: "/qc",
    icon: CheckSquare,
  },
  {
    label: "รายงาน",
    href: "/reports",
    icon: BarChart3,
  },
];

const bottomItems = [
  {
    label: "ตั้งค่าระบบ",
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
    <aside className="w-60 bg-[#1E3A5F] flex flex-col h-full flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">
              PCC PMS
            </div>
            <div className="text-blue-300 text-xs">2026</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[#2D5A8E] text-white font-medium"
                  : "text-blue-200 hover:bg-blue-800/40 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 pt-2 border-t border-blue-800/50 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800/40 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-red-900/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="leading-none">ออกจากระบบ</span>
        </button>

        {/* User info */}
        <div className="mt-2 px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">
              {user.name}
            </div>
            <div className="text-blue-400 text-[11px] truncate">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
