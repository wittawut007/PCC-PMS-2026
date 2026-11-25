export const projectPhotoCategories = [
  { id: "installation", documentCategory: "installation", name: "ภาพติดตั้งหน้างาน", color: "#1675ff" },
  { id: "transport", documentCategory: "transport", name: "ภาพขนส่งและตรวจรับ", color: "#009b6d" },
  { id: "qc", documentCategory: "qc", name: "ภาพตรวจ QC", color: "#df850d" },
  { id: "progress", documentCategory: "reports", name: "ภาพความคืบหน้าโครงการ", color: "#7745df" },
  { id: "site", documentCategory: "general", name: "ภาพประชุม / เอกสารหน้างาน", color: "#91a2bd" },
];
export function projectPhotoCategory(documentCategory: string) {
  if (documentCategory === "ncr") return "qc";
  return projectPhotoCategories.find(c => c.documentCategory === documentCategory)?.id || "site";
}
