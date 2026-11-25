"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface FlowbiteDropdownProps {
  id: string;
  trigger?: "hover" | "click";
  options: (string | DropdownOption)[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: "form" | "brand" | "outline";
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  fullWidth?: boolean;
}

export function FlowbiteDropdown({
  id,
  trigger = "click",
  options,
  value,
  onChange,
  label,
  placeholder = "เลือกรายการ",
  helperText,
  error,
  disabled = false,
  required = false,
  variant = "form",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "left",
  fullWidth = true,
}: FlowbiteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Mouse event handlers for hover trigger
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    if (trigger === "hover") {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsOpen(true);
    }
  }, [disabled, trigger]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    if (trigger === "hover") {
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 180);
    }
  }, [disabled, trigger]);

  // Click handler for toggle button
  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  // Handle item selection
  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setIsOpen(false);
    },
    [onChange]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const buttonId = `${id}Button`;

  // Button classes: White button with rounded corners, matching user's design preference
  const getButtonClasses = () => {
    if (buttonClassName) return buttonClassName;

    return `inline-flex items-center justify-between min-h-[44px] px-4 py-2.5 text-xs sm:text-[13.5px] font-medium border rounded-xl bg-white text-[#0D255B] shadow-xs transition-all cursor-pointer box-border focus:outline-none flowbite-dropdown-button ${
      fullWidth ? "w-full" : "w-auto"
    } ${
      error
        ? "border-[#E11D48] ring-2 ring-[#E11D48]/15 bg-[#FFF9F9]"
        : isOpen
        ? "border-[#075DD8] ring-4 ring-[#075DD8]/15 bg-white"
        : "border-[#E2E8F0] hover:border-[#075DD8] hover:bg-[#FBFDFF] focus:border-[#075DD8] focus:ring-4 focus:ring-[#075DD8]/15"
    } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : "inline-block"} ${isOpen ? "z-40" : "z-auto"} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional Top Label */}
      {label && (
        <label
          htmlFor={buttonId}
          className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
            error ? "text-[#E11D48]" : "text-[#0D255B]"
          }`}
        >
          {label} {required && <span className="text-[#E11D48]">*</span>}
        </label>
      )}

      {/* Dropdown button following Flowbite markup: White button, rounded corners */}
      <button
        id={buttonId}
        data-dropdown-toggle={id}
        data-dropdown-trigger={trigger}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleButtonClick}
        className={getButtonClasses()}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          borderColor: isOpen ? "#075DD8" : "#E2E8F0",
        }}
      >
        <span
          className={`truncate ${
            !selectedOption ? "text-gray-400" : "text-[#0D255B] font-medium"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ms-2 -me-0.5 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-[#075DD8]" : "text-[#70839C]"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu container: Solid Opaque White, 16px Rounded-2xl, Soft Deep Shadow matching Image 1 */}
      <div
        id={id}
        data-dropdown-menu
        className={`z-[100] absolute ${align === "right" ? "right-0" : "left-0"} mt-2 ${
          fullWidth ? "w-full" : "w-52 min-w-[200px]"
        } bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden flowbite-dropdown-menu ${
          isOpen ? "block animate-in fade-in-50 zoom-in-95 duration-150" : "hidden"
        } ${menuClassName}`}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow:
            "0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)",
          border: "1px solid #E5E7EB",
          opacity: 1,
        }}
      >
        <ul
          className="p-2 text-sm text-[#374151] font-medium max-h-72 overflow-y-auto space-y-0.5"
          aria-labelledby={buttonId}
          style={{ backgroundColor: "#ffffff" }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value || "__empty__"}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`inline-flex items-center justify-between w-full px-3.5 py-2.5 text-xs sm:text-[13.5px] rounded-xl text-left transition-all flowbite-dropdown-item cursor-pointer ${
                    isSelected
                      ? "bg-[#F0F5FD] text-[#075DD8] font-bold"
                      : "text-[#374151] hover:bg-[#F8FAFC] hover:text-[#0D255B]"
                  }`}
                  style={{
                    borderRadius: "10px",
                  }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#075DD8] flex-shrink-0 ms-2" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Helper text or validation error */}
      {error ? (
        <p className="text-[11.5px] text-[#E11D48] font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11.5px] text-gray-500 mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}
