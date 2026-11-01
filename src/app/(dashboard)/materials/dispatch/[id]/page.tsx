import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getMaterialRequestForDispatch } from "@/app/actions/materials";
import { WarehouseDispatchForm } from "@/components/materials/WarehouseDispatchForm";

export const metadata: Metadata = {
  title: "ส่งเอกสารและบันทึกผลจากคลัง | PCC PMS 2026",
  description: "ส่งออกเอกสารคำขอเบิกวัสดุ และบันทึกผลการยืนยันจัดสรรจากคลังภายนอก",
};

interface DispatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function DispatchPage({ params }: DispatchPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  let requestData = await getMaterialRequestForDispatch(id);

  // If not found by exact id, try REQ-260012 default
  if (!requestData) {
    requestData = await getMaterialRequestForDispatch("REQ-260012");
  }

  if (!requestData) {
    notFound();
  }

  return <WarehouseDispatchForm request={requestData} />;
}
