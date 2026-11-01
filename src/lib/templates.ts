import rawTemplates from "./templates.json";

export interface TemplateItem {
  code: string;
  title: string;
  type: "Task" | "Milestone" | "Hold Point" | "Summary";
  duration?: number;
  predecessor?: string;
  phase?: string;
  strict?: boolean;
  responsible?: string;
  criteria?: string;
}

export interface PlanTaskItem extends TemplateItem {
  id?: string;
  projectId?: string;
  packageId?: string;
  start: string;
  end: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  responsible: string;
  index?: number;
}

export const WORK_TYPE_TEMPLATES: Record<string, TemplateItem[]> = rawTemplates as Record<string, TemplateItem[]>;

export const addPlanDays = (dateStr: string, n: number): string => {
  const d = new Date(dateStr + "T00:00:00Z");
  return new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
};

export const planDays = (start: string, end: string): number => {
  const s = new Date(start + "T00:00:00Z").getTime();
  const e = new Date(end + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
};

export const approvalDuration = (t: TemplateItem): number | null => {
  if (["Milestone", "Hold Point"].includes(t.type)) {
    return t.duration ?? 1;
  }
  return null;
};

export const taskPlanDuration = (t: { type: string; duration?: number; start?: string; end?: string }): number => {
  if (["Milestone", "Hold Point"].includes(t.type)) {
    return t.duration ?? 1;
  }
  if (t.start && t.end) {
    return planDays(t.start, t.end);
  }
  return t.duration ?? 1;
};

export function getTemplateForWorkType(workType: string): TemplateItem[] {
  const key = workType.toUpperCase();
  return WORK_TYPE_TEMPLATES[key] || WORK_TYPE_TEMPLATES["F"] || [];
}

/**
 * Generate sequential default schedule for template items from a starting date
 */
export function defaultPlan(template: TemplateItem[], startDate: string): {
  code: string;
  title: string;
  type: string;
  responsible: string;
  duration: number;
  start: string;
  end: string;
  predecessor: string;
  isGate: boolean;
  gateCode?: string;
}[] {
  let next = startDate;
  const dates: Record<string, { start: string; end: string }> = {};

  return template
    .filter((t) => t.type !== "Summary")
    .map((t) => {
      const predCode = t.predecessor?.split(" ")[0] || "";
      const prev = dates[predCode];

      let start = next;
      if (prev) {
        start = addPlanDays(prev.end, 1);
      }

      const duration = approvalDuration(t) ?? t.duration ?? 1;
      const end = addPlanDays(start, Math.max(0, duration - 1));

      dates[t.code] = { start, end };
      next = duration === 0 ? end : addPlanDays(end, 1);

      const isGate = ["Milestone", "Hold Point"].includes(t.type) || t.code.includes("-AP");
      const gateMatch = t.code.match(/AP(\d+)/);

      return {
        code: t.code,
        title: t.title,
        type: t.type,
        responsible: t.responsible || "วิศวกรโครงการ",
        duration,
        start,
        end,
        predecessor: t.predecessor || "",
        isGate,
        gateCode: gateMatch ? `AP${gateMatch[1]}` : undefined,
      };
    });
}
