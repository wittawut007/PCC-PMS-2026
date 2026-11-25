"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StepProgressBarProps {
  percent: number;
  totalSteps?: number;
  variant?: "blue" | "teal" | "green";
  height?: number;
  showLabel?: boolean;
  className?: string;
}

/**
 * StepProgressBar — Progress bar divided into distinct steps (segments)
 * matching the reference design in attached image 2.
 *
 * @param percent 0 to 100 percentage value
 * @param totalSteps Number of segments (default: 4 steps, 25% per step)
 * @param variant Color theme ("teal" matching reference #02BAA7, "blue" #075DD8, "green" #059465)
 * @param height Height of the step bar in pixels (default: 13px)
 * @param showLabel Whether to display the percentage label next to the bar (default: true)
 */
export function StepProgressBar({
  percent,
  totalSteps = 4,
  variant = "teal",
  height = 13,
  showLabel = true,
  className = "",
}: StepProgressBarProps) {
  const clampedPct = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));

  // Fill colors matching Image 2 ([2, 186, 167] -> #02BAA7) and system blue (#075DD8)
  const fillColor =
    variant === "blue"
      ? "bg-[#075DD8]"
      : variant === "teal"
      ? "bg-[#02BAA7]"
      : "bg-[#059465]";

  const textColor =
    variant === "blue"
      ? "text-[#0D255B]"
      : variant === "teal"
      ? "text-[#02BAA7]"
      : "text-[#059465]";

  const stepSize = 100 / totalSteps;

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      {/* Segmented Step Bar */}
      <div className="flex-1 flex items-center gap-2" style={{ height: `${height}px` }}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepMin = i * stepSize;
          const stepMax = (i + 1) * stepSize;
          let fillFraction = 0;

          if (clampedPct >= stepMax) {
            fillFraction = 1;
          } else if (clampedPct > stepMin) {
            fillFraction = (clampedPct - stepMin) / stepSize;
          }

          return (
            <div
              key={i}
              className="flex-1 h-full bg-[#E5ECF6] rounded-[4px] overflow-hidden relative shadow-2xs"
              title={`ขั้นตอนที่ ${i + 1}/${totalSteps} (${Math.round(stepMin)}% – ${Math.round(stepMax)}%)`}
            >
              <div
                className={cn("h-full rounded-[4px] transition-all duration-300", fillColor)}
                style={{ width: `${fillFraction * 100}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Percentage Label */}
      {showLabel && (
        <span
          className={cn(
            "font-extrabold text-[14px] tabular-nums flex-shrink-0 min-w-[42px] text-right leading-none",
            textColor
          )}
        >
          {clampedPct}%
        </span>
      )}
    </div>
  );
}
