"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn, getRoleAbbr, getRoleFullTitle } from "@/lib/utils";
import { useNotification, MobileNotificationPopup } from "@/components/common/MobileNotification";
import {
  Home,
  Folder,
  Plus,
  Calendar,
  Box,
  Truck,
  ShieldCheck,
  BarChart3,
  User,
  Check,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// Custom icon for "งบประมาณ / ต้นทุน" matching reference design
function MoneyIcon({ className, strokeWidth = 1.75 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Custom icon for "ตั้งค่า" matching reference design
function SunSettingsIcon({ className, strokeWidth = 1.75 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </svg>
  );
}

// 13 main menu items (Item 14 "ตั้งค่า" is positioned in the bottom section)
const navItems = [
  {
    label: "หน้าหลัก",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "โครงการทั้งหมด",
    href: "/projects",
    icon: Folder,
  },
  {
    label: "สร้างโครงการ",
    href: "/projects/new",
    icon: Plus,
  },
  {
    label: "แผนงาน / ปฏิทิน",
    href: "/planning",
    icon: Calendar,
  },
  {
    label: "วัสดุและคลัง",
    href: "/materials",
    icon: Box,
  },
  {
    label: "ติดตามการผลิต",
    href: "/production",
    icon: Box,
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
    label: "งบประมาณ / ต้นทุน",
    href: "/costs",
    icon: MoneyIcon,
  },
  {
    label: "รายงานสรุป",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "พอร์ทัลเจ้าของ",
    href: "/owner",
    icon: User,
  },
  {
    label: "ส่งมอบโครงการ",
    href: "/handover",
    icon: Check,
  },
  {
    label: "งานรออนุมัติ",
    href: "/approvals",
    icon: Bell,
  },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps = {}) {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith("/settings");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, toggleOpen, hasUnread } = useNotification();

  const handleBellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleOpen();
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pcc_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pcc_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full flex-shrink-0 z-30 select-none transition-all duration-300 ease-in-out border-r border-[#D5E4FD]/60 relative overflow-hidden",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}
      style={{
        backgroundImage: "url('/assets/sidebar-background.svg')",
        backgroundSize: "240px 100%",
        backgroundPosition: "left top",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#F6F8FC",
      }}
    >
      {/* Brand Header & Toggle — Large Logo matching attached design */}
      <div
        className={cn(
          "pt-5 pb-3 transition-all",
          isCollapsed
            ? "px-2 flex flex-col items-center gap-2.5"
            : "px-4 flex items-center justify-between"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-[46px] h-[46px] flex-shrink-0 flex items-center justify-center">
            <svg
              viewBox="20 10 50 55"
              className="w-[46px] h-[46px]"
              fill="none"
              stroke="#1673FF"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M29 47V32l22-14" />
              <path d="M40 55V38l17-11" />
              <path d="M51 58V46l11-7" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap">
              <div className="text-[#0D255B] font-extrabold text-[26px] tracking-tight leading-none">
                PCC
              </div>
              <div className="text-[#596780] font-bold text-[8.5px] tracking-[0.14em] mt-1.5 leading-none uppercase">
                PROJECT MANAGEMENT
              </div>
            </div>
          )}
        </Link>

        {/* Toggle Button */}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg text-[#7086A8] hover:text-[#075DD8] hover:bg-[#EAF3FF] active:bg-[#D8E8FD] transition-colors"
          title={isCollapsed ? "ขยายแถบเมนู (Expand)" : "ย่อแถบเมนู (Collapse)"}
          aria-label={isCollapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Section Label */}
      {!isCollapsed ? (
        <div className="px-4 pt-3 pb-1.5">
          <span className="text-[10px] font-bold text-[#596780] tracking-wider uppercase">
            WORKSPACE
          </span>
        </div>
      ) : (
        <div className="h-2" />
      )}

      {/* Navigation Links — Expanded Height & Increased Spacing */}
      <nav className={cn("flex-1 space-y-1.5 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : item.href === "/projects"
              ? pathname === "/projects" || (pathname.startsWith("/projects/") && !pathname.startsWith("/projects/new"))
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "group flex items-center rounded-xl text-[13px] font-semibold transition-all min-h-[44px]",
                isCollapsed
                  ? "justify-center py-2.5 px-2"
                  : "gap-3 px-3.5 py-2.5",
                isActive
                  ? "bg-white text-[#075DD8] font-bold shadow-xs border border-[#075DD8]"
                  : "text-[#0D255B] hover:bg-[#EAF3FF] hover:text-[#075DD8] active:bg-[#D8E8FD] border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-[19px] h-[19px] flex-shrink-0 transition-colors",
                  isActive
                    ? "text-[#075DD8]"
                    : "text-[#0D255B] group-hover:text-[#075DD8]"
                )}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area: Settings (Moved to bottom) & Account Section */}
      <div className={cn("pb-4 pt-2 bg-transparent", isCollapsed ? "px-2" : "px-3")}>
        {/* Settings Navigation Link (Expanded height matching all menu items) */}
        <Link
          href="/settings"
          title="ตั้งค่า"
          className={cn(
            "group flex items-center rounded-xl text-[13px] font-semibold transition-all min-h-[44px] mb-2.5",
            isCollapsed
              ? "justify-center py-2.5 px-2"
              : "gap-3 px-3.5 py-2.5",
            isSettingsActive
              ? "bg-white text-[#075DD8] font-bold shadow-xs border border-[#075DD8]"
              : "text-[#0D255B] hover:bg-[#EAF3FF] hover:text-[#075DD8] active:bg-[#D8E8FD] border border-transparent"
          )}
        >
          <SunSettingsIcon
            className={cn(
              "w-[19px] h-[19px] flex-shrink-0 transition-colors",
              isSettingsActive
                ? "text-[#075DD8]"
                : "text-[#0D255B] group-hover:text-[#075DD8]"
            )}
            strokeWidth={isSettingsActive ? 2 : 1.75}
          />
          {!isCollapsed && <span className="truncate">ตั้งค่า</span>}
        </Link>

        {/* Account Section */}
        {!isCollapsed ? (
          <>
            <div className="px-1 pb-1.5 pt-1 border-t border-[#DDE3EA]/60">
              <span className="text-[10px] font-bold text-[#596780] tracking-wider uppercase">
                ACCOUNT
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 px-1 py-1">
              {/* User Profile */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-[#EAF3FF] flex items-center justify-center flex-shrink-0 text-[#075DD8] font-bold text-xs">
                  {getRoleAbbr(user?.role, user?.name)}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-semibold text-[#0D255B] truncate leading-tight">
                    {user?.name || "ผู้ใช้งาน"}
                  </div>
                  <div className="text-[10px] text-[#596780] truncate leading-tight mt-0.5">
                    {getRoleFullTitle(user?.role)}
                  </div>
                </div>
              </div>

              {/* Quick Actions: Bell & Logout */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  data-bell-trigger="true"
                  onClick={handleBellClick}
                  className={cn(
                    "relative p-1.5 rounded-lg transition-all cursor-pointer",
                    isOpen
                      ? "bg-white text-[#075DD8] shadow-xs ring-1 ring-[#075DD8]/25"
                      : "text-[#0D255B] hover:text-[#075DD8] hover:bg-[#EAF3FF]"
                  )}
                  title={isOpen ? "คลิกเพื่อปิดการแจ้งเตือน" : "คลิกเพื่อเปิดการแจ้งเตือน"}
                  aria-label="การแจ้งเตือน"
                  aria-expanded={isOpen}
                >
                  <Bell className="w-4 h-4" />
                  {hasUnread && !isOpen && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#B72839] rounded-full border-2 border-[#EAF2FF]" />
                  )}
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="ออกจากระบบ"
                  aria-label="ออกจากระบบ"
                  className="p-1.5 text-[#0D255B] hover:text-[#B72839] hover:bg-[#FFEDEF] active:bg-[#FFD9DE] rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Collapsed Account View */
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#DDE3EA]/60">
            <div
              className="w-8 h-8 rounded-full bg-[#EAF3FF] flex items-center justify-center text-[#075DD8] font-bold text-xs cursor-default"
              title={`${user?.name || "ผู้ใช้งาน"} (${getRoleFullTitle(user?.role)})`}
            >
              {getRoleAbbr(user?.role, user?.name)}
            </div>

            <div className="flex items-center justify-center gap-0.5">
              <button
                type="button"
                data-bell-trigger="true"
                onClick={handleBellClick}
                className={cn(
                  "relative p-1.5 rounded-lg transition-all cursor-pointer",
                  isOpen
                    ? "bg-white text-[#075DD8] shadow-xs ring-1 ring-[#075DD8]/25"
                    : "text-[#0D255B] hover:text-[#075DD8] hover:bg-[#EAF3FF]"
                )}
                title={isOpen ? "คลิกเพื่อปิดการแจ้งเตือน" : "คลิกเพื่อเปิดการแจ้งเตือน"}
                aria-label="การแจ้งเตือน"
                aria-expanded={isOpen}
              >
                <Bell className="w-4 h-4" />
                {hasUnread && !isOpen && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#B72839] rounded-full border-2 border-[#EAF2FF]" />
                )}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
                className="p-1.5 text-[#0D255B] hover:text-[#B72839] hover:bg-[#FFEDEF] active:bg-[#FFD9DE] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-style Notification Popup anchored next to the bell */}
      <MobileNotificationPopup isCollapsed={isCollapsed} />
    </aside>
  );
}
