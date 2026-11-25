"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import "./cally-calendar.css";

export interface CallyDatePickerProps {
  value: string; // ISO string format: YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  align?: "left" | "right";
  size?: "sm" | "md";
  popoverClassName?: string;
  expandContainer?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function CallyDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "เลือกวันที่ (วว/ดด/ปปปป)",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  align = "right",
  size = "md",
  popoverClassName = "",
  expandContainer = false,
  onOpenChange,
}: CallyDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLElement>(null);

  const toggleOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  // Dynamically import cally web component on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("cally");
    }
  }, []);

  // Listen to Cally calendar-date change event
  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (!calendarEl || !isOpen) return;

    const handleChange = (e: Event) => {
      const target = e.target as HTMLElement & { value?: string };
      if (target && target.value) {
        onChange(target.value);
        toggleOpen(false);
      }
    };

    calendarEl.addEventListener("change", handleChange);
    return () => {
      calendarEl.removeEventListener("change", handleChange);
    };
  }, [isOpen, onChange]);

  // Click outside listener to close popup
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        toggleOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Format YYYY-MM-DD to DD/MM/YYYY for display
  const formatDisplayDate = (isoStr: string) => {
    if (!isoStr) return "";
    const parts = isoStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return isoStr;
  };

  return (
    <div className="w-full">
      {/* Relative container for the input and its floating popover */}
      <div ref={containerRef} className="relative w-full">
        {/* Date Input Field */}
        <div
          onClick={() => !disabled && toggleOpen(!isOpen)}
          className={`flex items-center justify-between w-full border bg-white cursor-pointer transition-all select-none ${
            size === "sm"
              ? "min-h-[38px] px-3 py-1.5 text-xs rounded-lg"
              : "min-h-[44px] px-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl"
          } ${
            disabled
              ? "bg-[#F5F7FB] text-[#788AA1] border-[#E0E7F0] cursor-not-allowed"
              : isOpen
              ? "border-[#075DD8] ring-2 ring-[#075DD8]/15 shadow-xs"
              : "border-[#E0E7F0] text-[#0D255B] hover:border-[#075DD8]"
          } ${className}`}
        >
          <span className={value ? "text-[#0D255B] font-medium" : "text-[#94A3B8]"}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>

          <div className="flex items-center gap-1.5 text-[#596780]">
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="p-1 hover:text-[#0D255B] hover:bg-[#F1F5F9] rounded-md transition-colors"
                title="ล้างวันที่"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              className="p-1 text-[#075DD8] hover:bg-[#F0F5FD] rounded-md transition-colors"
              title="เปิดปฏิทินเลือกวันที่"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden native input for form compatibility */}
          <input
            type="hidden"
            id={id}
            name={name}
            value={value}
            required={required}
          />
        </div>

        {/* Cally Date Picker Popover */}
        {isOpen && (
          <div
            className={`absolute top-full mt-2 z-[100] animate-in fade-in zoom-in-95 duration-150 ${
              align === "left" ? "left-0" : "right-0"
            } ${popoverClassName}`}
          >
            <calendar-date
              ref={calendarRef}
              class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
              value={value || undefined}
              min={min || undefined}
              max={max || undefined}
            >
              <svg
                aria-label="Previous"
                className="fill-current size-4"
                slot="previous"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
              </svg>
              <svg
                aria-label="Next"
                className="fill-current size-4"
                slot="next"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
              </svg>
              <calendar-month></calendar-month>
            </calendar-date>
          </div>
        )}
      </div>

      {/* Flexible Area Spacer to naturally expand parent container height */}
      {expandContainer && isOpen && (
        <div
          className="h-[325px] w-full transition-all duration-200 pointer-events-none select-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
