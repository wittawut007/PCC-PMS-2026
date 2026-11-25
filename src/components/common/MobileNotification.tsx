"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Bell,
  Truck,
  FileCheck,
  ShieldCheck,
  Wallet,
  Package,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: string;
  href: string;
  type: "info" | "success" | "warning" | "alert";
}

const INITIAL_NOTIFICATIONS: MobileNotificationItem[] = [
  {
    id: "notif-transport",
    title: "การขนส่งถึงหน้างานแล้ว (TR-042)",
    message: "รถเที่ยว TR-042 แผ่นคอนกรีตสำเร็จรูป 12 แผ่น ถึงหน้างานพร้อมตรวจรับ",
    time: "10 นาทีที่แล้ว",
    category: "งานขนส่ง",
    href: "/transport",
    type: "info",
  },
  {
    id: "notif-approval",
    title: "มีเอกสารคำขอเบิกวัสดุรออนุมัติ",
    message: "สมชาย PM ส่งคำขอเบิกวัสดุ #MR-26001 (โครงการ PCC-26001)",
    time: "15 นาทีที่แล้ว",
    category: "งานรออนุมัติ",
    href: "/approvals",
    type: "warning",
  },
  {
    id: "notif-qc",
    title: "ผลตรวจ QC ผ่านมาตรฐาน Quality Gate",
    message: "จุดตรวจฐานราก Zone A ผ่านเกณฑ์การตรวจสอบ พร้อมเริ่มขั้นตอนถัดไป",
    time: "30 นาทีที่แล้ว",
    category: "งาน QC หน้างาน",
    href: "/installation",
    type: "success",
  },
  {
    id: "notif-budget",
    title: "แจ้งเตือนการเบิกจ่ายงบประมาณ",
    message: "หมวดงานโครงสร้างมีการเบิกจ่ายถึง 85% ของกรอบงบประมาณโครงการ",
    time: "1 ชั่วโมงที่แล้ว",
    category: "งบประมาณและต้นทุน",
    href: "/costs",
    type: "alert",
  },
  {
    id: "notif-materials",
    title: "อัปเดตสต็อกวัสดุคลังกลาง",
    message: "รายการเหล็กข้ออ้อย DB20 นำเข้าคลังสินค้าเรียบร้อยแล้ว 20 ตัน",
    time: "2 ชั่วโมงที่แล้ว",
    category: "คลังวัสดุ",
    href: "/materials",
    type: "info",
  },
];

interface NotificationContextType {
  isOpen: boolean;
  toggleOpen: () => void;
  close: () => void;
  hasUnread: boolean;
  notifications: MobileNotificationItem[];
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  resetNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<MobileNotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.length;
  const hasUnread = unreadCount > 0;

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const resetNotifications = useCallback(() => {
    setNotifications(INITIAL_NOTIFICATIONS);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        isOpen,
        toggleOpen,
        close,
        hasUnread,
        notifications,
        removeNotification,
        clearAllNotifications,
        resetNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

/**
 * Mobile-style Stacked Notification Popup
 * Positioned next to the bottom-left bell, popping out with a pointing notch
 * Dismissible by clicking outside or clicking the bell
 * Removes clicked notifications from list
 */
export function MobileNotificationPopup({ isCollapsed }: { isCollapsed: boolean }) {
  const {
    isOpen,
    close,
    notifications,
    removeNotification,
    clearAllNotifications,
    resetNotifications,
    unreadCount,
  } = useNotification();

  const popupRef = useRef<HTMLDivElement>(null);

  // Click outside listener: closes popup when clicking anywhere outside or on empty space
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Inside popup card -> keep open
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }

      // Bell trigger button -> let the button toggle it
      if (target.closest("[data-bell-trigger]")) {
        return;
      }

      // Clicked outside on empty space or other page element -> close popup
      close();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, close]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "งานขนส่ง":
        return <Truck className="w-4 h-4 text-[#075DD8]" />;
      case "งานรออนุมัติ":
        return <FileCheck className="w-4 h-4 text-[#D97706]" />;
      case "งาน QC หน้างาน":
        return <ShieldCheck className="w-4 h-4 text-[#147747]" />;
      case "งบประมาณและต้นทุน":
        return <Wallet className="w-4 h-4 text-[#B72839]" />;
      case "คลังวัสดุ":
        return <Package className="w-4 h-4 text-[#075DD8]" />;
      default:
        return <Info className="w-4 h-4 text-[#075DD8]" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "งานขนส่ง":
        return "bg-[#EAF3FF] text-[#075DD8] border-[#CFE4FC]";
      case "งานรออนุมัติ":
        return "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]";
      case "งาน QC หน้างาน":
        return "bg-[#EAF8F1] text-[#147747] border-[#C2EEDB]";
      case "งบประมาณและต้นทุน":
        return "bg-[#FDF2F3] text-[#B72839] border-[#FCE1E4]";
      case "คลังวัสดุ":
        return "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      ref={popupRef}
      className={cn(
        "fixed bottom-3.5 z-[9999] w-[390px] max-w-[calc(100vw-90px)] pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-left select-text",
        isCollapsed ? "left-[80px]" : "left-[248px]",
        isOpen
          ? "opacity-100 scale-100 translate-x-0 translate-y-0"
          : "opacity-0 scale-75 -translate-x-4 translate-y-2 pointer-events-none"
      )}
      role="region"
      aria-label="การแจ้งเตือนทั้งหมด"
      aria-hidden={!isOpen}
    >
      {/* Container Card */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_48px_rgba(13,37,91,0.22),0_6px_16px_rgba(13,37,91,0.08)] border border-slate-200/90 flex flex-col max-h-[540px]">
        {/* Pointer Notch pointing directly at the bell icon on the left */}
        <div
          className="absolute -left-2 bottom-3.5 w-4 h-4 bg-white/95 border-l border-b border-slate-200/90 rotate-45 rounded-bl-[2px] shadow-[-3px_3px_5px_rgba(0,0,0,0.04)]"
          aria-hidden="true"
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#075DD8] flex items-center justify-center text-white shadow-xs">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0D255B]">
                  การแจ้งเตือนทั้งหมด
                </span>
                {unreadCount > 0 ? (
                  <span className="text-[10px] font-bold bg-[#B72839] text-white px-1.5 py-0.2 rounded-full">
                    {unreadCount} รายการ
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-[#147747] text-white px-1.5 py-0.2 rounded-full">
                    ครบถ้วน
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#7086A8] leading-none mt-0.5">
                {unreadCount > 0
                  ? "คลิกรายการเพื่อเปิดดูข้อมูลและนำออกจากรายการ"
                  : "ไม่มีรายการแจ้งเตือนค้างอยู่"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="text-[11px] text-[#075DD8] hover:text-[#0D255B] font-medium px-2 py-1 rounded-md hover:bg-[#EAF2FF] transition-colors cursor-pointer"
                title="ล้างรายการแจ้งเตือนทั้งหมด"
              >
                ล้างทั้งหมด
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="text-gray-400 hover:text-[#0D255B] hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer"
              title="ปิดหน้าต่างการแจ้งเตือน"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stacked Notifications List / Empty State */}
        <div className="flex-1 overflow-y-auto pt-3 pb-1 space-y-2.5 pr-1 relative z-10 overscroll-contain">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-[#EAF8F1] text-[#147747] flex items-center justify-center mb-2 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-[13px] font-bold text-[#0D255B]">
                ไม่มีการแจ้งเตือนค้างอยู่
              </div>
              <p className="text-[11px] text-[#596780] mt-1 max-w-[240px] leading-relaxed">
                คุณได้เปิดดูรายการข้อมูลทั้งหมดเรียบร้อยแล้ว
              </p>
              <button
                type="button"
                onClick={resetNotifications}
                className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-[#075DD8] hover:text-[#0D255B] bg-[#EAF3FF] hover:bg-[#DCE9FD] px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>โหลดรายการตัวอย่างใหม่</span>
              </button>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="group relative block p-3 rounded-xl border border-[#CFE4FC] hover:border-[#075DD8]/60 bg-[#F9FBFE] hover:bg-[#F0F5FD] shadow-xs transition-all text-left"
              >
                {/* Top row: Category tag + Time + Dismiss single */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                        getCategoryBadgeClass(item.category)
                      )}
                    >
                      {item.category}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#075DD8]" />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <span>{item.time}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeNotification(item.id);
                      }}
                      className="text-gray-300 hover:text-gray-600 hover:bg-white/80 p-0.5 rounded transition-colors"
                      title="นำรายการนี้ออก"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Clickable Content area */}
                <Link
                  href={item.href}
                  onClick={() => {
                    removeNotification(item.id);
                    close();
                  }}
                  className="block group/link cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1 rounded-md bg-white border border-slate-100 shadow-2xs flex-shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold text-[#0D255B] group-hover/link:text-[#075DD8] transition-colors leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11.5px] text-[#596780] leading-snug mt-1 line-clamp-2">
                        {item.message}
                      </div>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px]">
                    <span className="text-[#075DD8] font-semibold group-hover/link:underline flex items-center gap-1">
                      <span>เปิดดูข้อมูลและนำออก</span>
                      <ExternalLink className="w-3 h-3 opacity-70 group-hover/link:opacity-100" />
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[#075DD8] group-hover/link:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] relative z-10 flex-shrink-0 text-[#8C9BAE]">
          <span>คลิกที่ว่างบนหน้าจอเพื่อปิด</span>
          <span>กดกระดิ่งอีกครั้งเพื่อปิด</span>
        </div>
      </div>
    </div>
  );
}
