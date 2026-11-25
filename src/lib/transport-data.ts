import { prisma } from "@/lib/prisma";
import type { TripStatus } from "@prisma/client";
import type { TripDetailData } from "@/app/(dashboard)/transport/TransportClientView";

export async function getTransportTrips(projectId?: string, status?: TripStatus): Promise<TripDetailData[]> {
  const tripsRaw = await prisma.transportTrip.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      project: {
        select: { id: true, code: true, name: true },
      },
      workPackage: {
        select: { id: true, name: true, code: true },
      },
      receiving: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  // Map to TripDetailData
  return tripsRaw.map((t) => {
    let tripStatus: TripDetailData["status"] =
      "SCHEDULED";
    if (t.status === "CANCELLED") tripStatus = "CANCELLED";
    else if (t.status === "COMPLETED") tripStatus = "DELIVERED";
    else if (t.status === "ARRIVED") tripStatus = "ARRIVED";
    else if (t.status === "IN_TRANSIT") tripStatus = "DEPARTED";
    else if (t.status === "LOADING") tripStatus = "READY";
    else tripStatus = "SCHEDULED";

    return {
      id: t.id,
      tripNo: t.tripNo,
      projectId: t.projectId || "",
      projectCode: t.project?.code || "PCC",
      projectName: t.project?.name || "โครงการ PCC",
      packageId: t.packageId,
      packageName: t.workPackage?.name,
      requestId: t.requestId,
      plateNo: t.plateNo || "—",
      vehicleType: "—",
      driverName: t.driverName || "—",
      driverPhone: t.driverPhone || "",
      origin: t.origin || "คลังสินค้า PCC",
      destination: t.destination || "หน้างานโครงการ",
      cargoDescription: t.cargoDescription || "ยังไม่ระบุสินค้า",
      cargoQty: Number(t.cargoQty ?? 0),
      unit: t.unit || "แผ่น",
      weightKg: undefined,
      distanceKm: undefined,
      status: tripStatus,
      scheduledAt: t.scheduledAt?.toISOString() || null,
      departedAt: t.departedAt?.toISOString() || null,
      arrivedAt: t.arrivedAt?.toISOString() || null,
      deliveredAt: t.deliveredAt?.toISOString() || null,
      receiving: t.receiving
        ? {
            id: t.receiving.id,
            goodQty: Number(t.receiving.goodQty || 0),
            badQty: Number(t.receiving.badQty || 0),
            missingQty: Number(t.receiving.missingQty || 0),
            deliveredQty: Number(t.receiving.deliveredQty || 0),
            receivedAt: t.receiving.receivedAt?.toISOString(),
            status: t.receiving.status,
            damageNotes: t.receiving.damageNotes,
            notes: t.receiving.notes,
          }
        : null,
    };
  });

}
