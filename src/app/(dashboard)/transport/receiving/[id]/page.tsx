import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getReceivingData } from "@/app/actions/transport";
import { ReceivingInspectionForm } from "@/components/transport/ReceivingInspectionForm";

export const metadata: Metadata = {
  title: "บันทึกตรวจรับวัสดุ | PCC PMS 2026",
  description: "บันทึกการตรวจนับ ตรวจสอบสภาพวัสดุ และผลตรวจรับดี/เสีย/ขาด หน้างาน",
};

interface ReceivingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceivingPage({ params }: ReceivingPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  let receivingData = await getReceivingData(id);

  if (!receivingData) {
    receivingData = await getReceivingData("TRN-260018");
  }

  if (!receivingData) {
    notFound();
  }

  return <ReceivingInspectionForm data={receivingData} />;
}
