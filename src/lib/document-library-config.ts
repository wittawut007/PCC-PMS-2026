export const documentCategories = [
  { id: "drawings", name: "แบบก่อสร้างและ BOM" }, { id: "contracts", name: "สัญญาและการเงิน" },
  { id: "materials", name: "วัสดุและการผลิต" }, { id: "transport", name: "ขนส่งและตรวจรับ" },
  { id: "installation", name: "บันทึกการติดตั้ง" }, { id: "qc", name: "ตรวจคุณภาพและอนุมัติ" },
  { id: "ncr", name: "ข้อบกพร่อง NCR" }, { id: "reports", name: "รายงานโครงการ" }, { id: "general", name: "เอกสารทั่วไป" },
];
export interface DocumentFileTarget {
  type: "evidence" | "material-response" | "daily-photo" | "qc-photo" | "receiving-file";
  id: string;
  source: string;
  version?: string;
}
