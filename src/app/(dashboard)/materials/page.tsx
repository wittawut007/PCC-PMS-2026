import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MaterialsClientView, MaterialRowData } from "./MaterialsClientView";

export const metadata: Metadata = {
  title: "วัสดุและคลัง | PCC PMS 2026",
  description:
    "ระบบบริหารจัดการวัสดุ เชื่อมข้อมูล BOM คลัง ผลิต ขนส่ง และตรวจรับ",
};

interface MaterialsPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId } = await searchParams;

  // 1. Fetch all projects
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      workType: true,
      status: true,
    },
    orderBy: { code: "asc" },
  });

  const selectedProjectId = projectId || "";

  // 2. Fetch drawings with BOM items
  const drawings = await prisma.drawing.findMany({
    where: selectedProjectId ? { projectId: selectedProjectId } : undefined,
    include: {
      bomItems: true,
      workPackage: true,
      project: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  // 3. Fetch material requests with items
  const requests = await prisma.materialRequest.findMany({
    where: selectedProjectId ? { projectId: selectedProjectId } : undefined,
    include: {
      items: true,
      workPackage: true,
      productionOrders: true,
      trips: {
        include: {
          receiving: true,
        },
      },
      project: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  const unapprovedDrawingsCount = drawings.filter(
    (d) => d.status !== "APPROVED"
  ).length;

  // 4. Construct material rows
  const materialRows: MaterialRowData[] = [];
  const processedRequestIds = new Set<string>();

  // Process BOM items from approved drawings
  for (const d of drawings) {
    const isApproved = d.status === "APPROVED";

    for (const b of d.bomItems) {
      const required = Number(b.quantity) + Number(b.additionalQty || 0);

      // Find linked requests
      const linkedRequests = requests.filter(
        (r) =>
          r.drawingId === d.id ||
          r.items.some(
            (i) => i.bomItemId === b.id || i.itemCode === b.itemCode
          )
      );

      linkedRequests.forEach((r) => processedRequestIds.add(r.id));

      const summaries = linkedRequests.map((r) => {
        const matchingItem = r.items.find(
          (i) => i.bomItemId === b.id || i.itemCode === b.itemCode
        );
        const reqQty = matchingItem ? Number(matchingItem.quantity) : 0;
        const allocated = matchingItem ? Number(matchingItem.allocated) : 0;
        const verified = Boolean(r.externalRef || r.confirmedAt);
        const shortage = verified ? Math.max(0, reqQty - allocated) : 0;

        // Trips and receipts
        let assigned = 0;
        let shipped = 0;
        let received = 0;
        let damaged = 0;
        let missing = 0;

        for (const trip of r.trips) {
          const tripQty = Number(trip.cargoQty || 0);
          assigned += tripQty;
          if (["DEPARTED", "ARRIVED", "DELIVERED"].includes(trip.status)) {
            shipped += tripQty;
          }
          if (trip.receiving) {
            received += Number(trip.receiving.goodQty || 0);
            damaged += Number(trip.receiving.badQty || 0);
            missing += Number(trip.receiving.missingQty || 0);
          }
        }

        // Production orders
        const orders = r.productionOrders.map((po) => ({
          id: po.orderNo,
          qty: Number(po.quantity),
          readyDate: po.readyDate?.toLocaleDateString("th-TH") || undefined,
          factory: po.factory || "ฝ่ายผลิต / โรงงานพรีคาสท์ PCC",
          status: po.status.toLowerCase(),
          priority: po.priority,
        }));

        const ordered = orders.reduce((sum, o) => sum + o.qty, 0);
        const toOrder = verified ? Math.max(0, shortage - ordered) : 0;

        return {
          requestId: r.requestNo,
          packageId: r.packageId,
          packageName: r.workPackage?.name,
          requiredDate: r.neededBy?.toLocaleDateString("th-TH") || undefined,
          createdBy: "วิศวกรสนาม",
          status: r.status.toLowerCase(),
          qty: reqQty,
          unit: matchingItem?.unit || b.unit,
          allocated,
          shortage,
          toOrder,
          assigned,
          shipped,
          received,
          damaged,
          missing,
          warehouseName: r.warehouseName || undefined,
          storageLocation: r.storageLocation || undefined,
          externalRef: r.externalRef || undefined,
          warehouseNote: r.warehouseNotes || undefined,
          orders,
        };
      });

      const requestedTotal = summaries.reduce((sum, s) => sum + s.qty, 0);
      const allocatedTotal = summaries.reduce((sum, s) => sum + s.allocated, 0);
      const checkedTotal = summaries.reduce(
        (sum, s) => (s.allocated > 0 ? sum + s.qty : sum),
        0
      );
      const pendingTotal = isApproved
        ? Math.max(0, required - checkedTotal)
        : requestedTotal - checkedTotal;
      const toOrderTotal = summaries.reduce((sum, s) => sum + s.toOrder, 0);
      const shippedTotal = summaries.reduce((sum, s) => sum + s.shipped, 0);
      const assignedTotal = summaries.reduce((sum, s) => sum + s.assigned, 0);
      const receivedTotal = summaries.reduce((sum, s) => sum + s.received, 0);
      const damagedTotal = summaries.reduce((sum, s) => sum + s.damaged, 0);
      const missingTotal = summaries.reduce((sum, s) => sum + s.missing, 0);

      const allOrders = summaries.flatMap((s) => s.orders);
      const orderedTotal = allOrders.reduce((sum, o) => sum + o.qty, 0);
      const producingTotal = allOrders
        .filter((o) => o.status === "producing")
        .reduce((sum, o) => sum + o.qty, 0);
      const factoryReadyTotal = allOrders
        .filter((o) => o.status === "ready")
        .reduce((sum, o) => sum + o.qty, 0);

      const coverage = required > 0 ? (allocatedTotal / required) * 100 : 0;

      const flags: string[] = [];
      if (isApproved && required > 0 && allocatedTotal >= required) {
        flags.push("stocked");
      }
      if (pendingTotal > 0 || !isApproved) {
        flags.push("pending");
      }
      if (shippedTotal > 0) {
        flags.push("shipped");
      }
      if (toOrderTotal > 0) {
        flags.push("shortage");
      }
      if (orderedTotal > 0) {
        flags.push("ordered");
      }
      if (damagedTotal + missingTotal > 0 || (requestedTotal > required && isApproved)) {
        flags.push("issue");
      }

      materialRows.push({
        key: `${d.id}::${b.id}`,
        projectId: d.projectId,
        projectCode: d.project.code,
        projectName: d.project.name,
        drawingId: d.code,
        drawingRev: d.revision,
        drawingApproved: isApproved,
        itemCode: b.itemCode,
        itemName: b.name,
        spec: b.spec || "",
        unit: b.unit,
        required,
        requiredDate: b.requiredDate?.toISOString() || null,
        requested: requestedTotal,
        unrequested: isApproved ? Math.max(0, required - requestedTotal) : 0,
        allocated: allocatedTotal,
        checked: checkedTotal,
        pending: pendingTotal,
        toOrder: toOrderTotal,
        shipped: shippedTotal,
        assigned: assignedTotal,
        received: receivedTotal,
        damaged: damagedTotal,
        missing: missingTotal,
        ordered: orderedTotal,
        producing: producingTotal,
        factoryReady: factoryReadyTotal,
        coverage,
        flags,
        summaries,
      });
    }
  }

  // Handle any requests not matched with BOM items
  for (const r of requests.filter((r) => !processedRequestIds.has(r.id))) {
    for (const item of r.items) {
      const reqQty = Number(item.quantity);
      const allocated = Number(item.allocated);
      const shortage = Math.max(0, reqQty - allocated);

      materialRows.push({
        key: `unlinked::${r.id}::${item.id}`,
        projectId: r.projectId,
        projectCode: r.project.code,
        projectName: r.project.name,
        drawingId: r.drawingRev || "BOM-UNLINKED",
        drawingRev: "—",
        drawingApproved: false,
        itemCode: item.itemCode,
        itemName: item.description,
        spec: item.notes || "",
        unit: item.unit,
        required: 0,
        requiredDate: r.neededBy?.toISOString() || null,
        requested: reqQty,
        unrequested: 0,
        allocated,
        checked: allocated > 0 ? reqQty : 0,
        pending: allocated === 0 ? reqQty : 0,
        toOrder: shortage,
        shipped: 0,
        assigned: 0,
        received: 0,
        damaged: 0,
        missing: 0,
        ordered: 0,
        producing: 0,
        factoryReady: 0,
        coverage: 0,
        flags: ["pending"],
        summaries: [
          {
            requestId: r.requestNo,
            packageId: r.packageId,
            packageName: r.workPackage?.name,
            requiredDate: r.neededBy?.toLocaleDateString("th-TH") || undefined,
            status: r.status.toLowerCase(),
            qty: reqQty,
            unit: item.unit,
            allocated,
            shortage,
            toOrder: shortage,
            assigned: 0,
            shipped: 0,
            received: 0,
            damaged: 0,
            missing: 0,
            orders: [],
          },
        ],
      });
    }
  }

  return (
    <MaterialsClientView
      allProjects={allProjects}
      selectedProjectId={selectedProjectId}
      materialRows={materialRows}
      unapprovedDrawingsCount={unapprovedDrawingsCount}
    />
  );
}
