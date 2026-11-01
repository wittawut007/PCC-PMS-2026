import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getTripDetail } from "@/app/actions/transport";
import { TripDetailView } from "@/components/transport/TripDetailView";

export const metadata: Metadata = {
  title: "รายละเอียดเที่ยวรถ | PCC PMS 2026",
  description: "ตรวจสอบรายละเอียดเที่ยวขนส่ง กำหนดการ คนขับ และประวัติเหตุการณ์ขนส่ง",
};

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  let trip = await getTripDetail(id);

  if (!trip) {
    trip = await getTripDetail("TRN-260018");
  }

  if (!trip) {
    notFound();
  }

  return <TripDetailView trip={trip} />;
}
