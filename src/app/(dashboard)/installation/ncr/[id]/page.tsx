import { getNcrData } from "@/app/actions/installation";
import { NcrRecordView } from "@/components/installation/NcrRecordView";

interface NcrPageProps {
  params: Promise<{ id: string }>;
}

export default async function NcrPage({ params }: NcrPageProps) {
  const { id } = await params;
  const dbNcr = await getNcrData(id);

  const ncr = dbNcr || {
    id: "mock-ncr",
    code: id || "NCR-260006",
    projectId: "pcc-26001",
    description: "ผิวและรอยต่อบริเวณ F08 ไม่ผ่านรายการตรวจ",
    severity: "MAJOR",
    location: "F08",
    referenceDoc: "IR-260023",
    assignedTo: "ทีมติดตั้ง / วิศวกรหน้างาน",
    dueDate: new Date("2026-09-14"),
    status: "OPEN",
    correctiveAction: "ดำเนินการตามวิธีที่วิศวกรอนุมัติ และขอตรวจซ้ำ",
    verificationNotes: "ยังไม่แนบ · ต้องระบุวันและผู้ดำเนินงาน",
    history: [
      { title: "พบข้อบกพร่อง", at: "12 ก.ย. 15:00 · QC โครงการ", done: true },
      { title: "มอบหมายแก้ไข", at: "ทีมติดตั้ง · กำหนด 14 ก.ย.", done: true },
      { title: "ส่งตรวจซ้ำ", at: "รอหลักฐานหลังแก้ไข", done: false },
      { title: "ปิด NCR", at: "ผู้มีอำนาจตรวจผ่านเท่านั้น", done: false },
    ],
  };

  return <NcrRecordView ncr={ncr as any} />;
}
