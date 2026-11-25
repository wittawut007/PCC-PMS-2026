import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ContractRow = Prisma.ContractGetPayload<{ include: { project: { select: { code: true; name: true } }; billingPeriods: { include: { payments: true } } } }>;
type BudgetRow = Prisma.BudgetItemGetPayload<{ include: { project: { select: { code: true; workType: true } }; workPackage: { select: { projectId: true } } } }>;
const issuedStatuses = new Set(["INVOICED", "PARTIALLY_PAID", "PAID", "DISPUTED"]);
const iso = (date: Date | null) => date?.toISOString() ?? null;
const day = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
// The existing budget entry form and BudgetCostView store BudgetItem amounts in millions of THB.
// Contract, BillingPeriod and Payment amounts are stored in their contract currency's base unit.
export function financeMinorUnits(value: Prisma.Decimal | number | string, multiplier = 1) {
  const result = new Prisma.Decimal(value).mul(multiplier).mul(100).toDecimalPlaces(0).toNumber();
  if (!Number.isSafeInteger(result)) throw new Error("จำนวนเงินเกินขอบเขตที่คำนวณได้อย่างแม่นยำ");
  return result;
}
const money = (minor: number) => minor / 100;
const sum = (values: number[]) => {
  const result = values.reduce((n, v) => n + v, 0);
  if (!Number.isSafeInteger(result)) throw new Error("ยอดรวมเกินขอบเขตที่คำนวณได้อย่างแม่นยำ");
  return result;
};

// Older demo data attached one unassigned budget of each work type to the fence project.
// Recognize only those explicit category titles; generic project expenses remain in scope.
const legacyBudgetWorkTypes: Record<string, string> = {
  "งานกำแพงกันดิน (L-Wall)": "RW",
  "งานกำแพงกันดินพร้อมเสารั้ว (L-Wall+F)": "RWF",
  "งานเสารั้ว (F)": "F",
  "งานพื้นโพสเทนชั่น (PT)": "PT",
};
export function budgetBelongsToProject(budget: Pick<BudgetRow, "projectId" | "packageId" | "packageTitle" | "project" | "workPackage">) {
  if (budget.packageId) return budget.workPackage?.projectId === budget.projectId;
  const workType = legacyBudgetWorkTypes[budget.packageTitle.trim()];
  return !workType || workType === budget.project.workType;
}

export function buildProjectFinance(contractsRaw: ContractRow[], budgetsRaw: BudgetRow[], now = new Date(), projectId?: string) {
  contractsRaw = contractsRaw.filter(c => !projectId || c.projectId === projectId);
  budgetsRaw = budgetsRaw.filter(b => (!projectId || b.projectId === projectId) && budgetBelongsToProject(b));
  const asOf = day(now);
  const contracts = contractsRaw.map(c => ({
    id: c.id, projectId: c.projectId, projectCode: c.project.code, projectName: c.project.name,
    number: c.contractNo, revision: c.revision, currency: c.currency, signedDate: iso(c.signedDate), notes: c.notes,
    base: Number(c.baseValue), variation: Number(c.variationTotal), total: money(sum([financeMinorUnits(c.baseValue), financeMinorUnits(c.variationTotal)])),
  }));
  const periods = contractsRaw.flatMap(c => c.billingPeriods.map(p => {
    const net = financeMinorUnits(p.netAmount);
    const received = sum(p.payments.map(payment => financeMinorUnits(payment.amount)));
    const balance = Math.max(0, net - received);
    const isIssued = issuedStatuses.has(p.status);
    return {
      id: p.id, projectId: c.projectId, projectCode: c.project.code, contractId: c.id, contractNo: c.contractNo, currency: c.currency, periodNo: p.periodNo, status: p.status, isIssued,
      base: Number(p.baseAmount), adjustments: Number(p.adjustments), retention: Number(p.retention), advance: Number(p.advance), net: money(net), received: money(received), balance: money(balance), excess: money(Math.max(0, received - net)),
      dueDate: iso(p.dueDate), submittedAt: iso(p.submittedAt), approvedAt: iso(p.approvedAt), overdue: isIssued && balance > 0 && !!p.dueDate && day(p.dueDate) < asOf,
      payments: p.payments.map(payment => ({ id: payment.id, amount: Number(payment.amount), date: iso(payment.paidAt), reference: payment.reference, notes: payment.notes })).sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")),
    };
  })).sort((a, b) => a.projectCode.localeCompare(b.projectCode) || a.contractNo.localeCompare(b.contractNo) || a.periodNo - b.periodNo);
  const budgets = budgetsRaw.map(b => {
    const budget = financeMinorUnits(b.budgetAmount, 1_000_000);
    const actual = financeMinorUnits(b.actualCost, 1_000_000);
    const paid = financeMinorUnits(b.paidAmount, 1_000_000);
    const forecast = financeMinorUnits(b.forecastTotal, 1_000_000);
    return { id: b.id, projectId: b.projectId, projectCode: b.project.code, title: b.packageTitle, notes: b.notes, budget: money(budget), actual: money(actual), committed: money(financeMinorUnits(b.committedCost, 1_000_000)), forecast: money(forecast), paid: money(paid), remaining: money(budget - actual), forecastVariance: money(budget - forecast), actualUnpaid: money(Math.max(0, actual - paid)), paidBeyondActual: money(Math.max(0, paid - actual)) };
  });
  const thbPeriods = periods.filter(p => p.currency === "THB");
  const total = <T,>(rows: T[], value: (row: T) => number) => money(sum(rows.map(row => financeMinorUnits(value(row)))));
  const budget = total(budgets, b => b.budget), actual = total(budgets, b => b.actual), paidCost = total(budgets, b => b.paid);
  const received = total(thbPeriods, p => p.received);
  const summary = {
    contract: total(contracts.filter(c => c.currency === "THB"), c => c.total), budget, actual, remainingBudget: money(financeMinorUnits(budget) - financeMinorUnits(actual)),
    committed: total(budgets, b => b.committed), forecast: total(budgets, b => b.forecast), paidCost, actualUnpaid: total(budgets, b => b.actualUnpaid), paidBeyondActual: total(budgets, b => b.paidBeyondActual),
    plannedBilling: total(thbPeriods, p => p.net), billed: total(thbPeriods.filter(p => p.isIssued), p => p.net), notInvoiced: total(thbPeriods.filter(p => !p.isIssued), p => p.net),
    received, receivable: total(thbPeriods.filter(p => p.isIssued), p => p.balance), overdue: total(thbPeriods.filter(p => p.overdue), p => p.balance), excessReceived: total(thbPeriods, p => p.excess),
    cashBalance: money(financeMinorUnits(received) - financeMinorUnits(paidCost)),
  };
  return { asOf, contracts, budgets, periods, summary, foreignCurrencies: [...new Set(contracts.filter(c => c.currency !== "THB").map(c => c.currency))] };
}

export async function getProjectFinance(projectId?: string) {
  const where = projectId ? { projectId } : {};
  const [contracts, budgets] = await Promise.all([
    prisma.contract.findMany({ where, include: { project: { select: { code: true, name: true } }, billingPeriods: { include: { payments: true } } }, orderBy: { contractNo: "asc" } }),
    prisma.budgetItem.findMany({ where, include: { project: { select: { code: true, workType: true } }, workPackage: { select: { projectId: true } } }, orderBy: { createdAt: "asc" } }),
  ]);
  return buildProjectFinance(contracts, budgets, new Date(), projectId);
}
export type ProjectFinanceData = ReturnType<typeof buildProjectFinance>;
