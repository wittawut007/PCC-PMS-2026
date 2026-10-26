"use client";

import { Bell, Search } from "lucide-react";
import { userRoleLabel } from "@/lib/utils";

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const roleLabel = user.role ? (userRoleLabel[user.role] ?? user.role) : "";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="ค้นหาโครงการ..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5A8E]/20 focus:border-[#2D5A8E]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-800 leading-tight">
              {user.name}
            </div>
            <div className="text-xs text-gray-400">{roleLabel}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
