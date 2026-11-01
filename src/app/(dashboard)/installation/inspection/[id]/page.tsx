import { getQcInspectionData } from "@/app/actions/installation";
import { QcInspectionView } from "@/components/installation/QcInspectionView";

interface InspectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function InspectionPage({ params }: InspectionPageProps) {
  const { id } = await params;
  const dbInspection = await getQcInspectionData(id);

  const inspection = dbInspection || {
    id: "mock-ir-260023",
    inspectionNo: id || "IR-260023",
    projectId: "pcc-26001",
    packageId: "wp-f-01",
    scope: "F01–F10",
    drawingRef: "Drawing F-101 Rev.03",
    status: "RE_INSPECT",
    inspector: "QC โครงการ (นายสมชาย ตรวจสอบ)",
    inspectedAt: new Date("2026-09-12T15:00:00Z"),
    checklist: [
      { item: "แนวและระดับ", ref: "ผลวัดแนบ SUR-F-012", status: "passed", statusLabel: "ผ่าน" },
      { item: "ส่วนประกอบ / การยึด", ref: "Checklist F Rev.02", status: "passed", statusLabel: "ผ่าน" },
      { item: "ผิวและรอยต่อ F08", ref: "ภาพ defect-F08.jpg", status: "failed", statusLabel: "ไม่ผ่าน" },
      { item: "ความครบถ้วนเอกสาร", ref: "แบบ / วัสดุ / ผลวัด", status: "passed", statusLabel: "ครบ" },
    ],
    notes: "แก้ไขผิวและรอยต่อ F08 แนบหลักฐานก่อนตรวจซ้ำ",
    ncrCode: "NCR-260006",
    photos: ["survey-01.jpg", "qc-inspect-02.jpg"],
  };

  return <QcInspectionView inspection={inspection as any} />;
}
