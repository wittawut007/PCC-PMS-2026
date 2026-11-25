"use client";

import { usePathname } from "next/navigation";

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function Topbar({ user }: TopbarProps = {}) {
  const pathname = usePathname();

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

  return (
    <header className="h-16 bg-white border-b border-[#E4EAF4] flex items-center justify-between px-6 flex-shrink-0 z-20">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium text-[#4F668D]">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right: Clean minimal area */}
      <div className="flex items-center gap-3" />
    </header>
  );
}
