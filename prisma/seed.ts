import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PCC PMS database...");

  // Create default users
  const users = [
    { id: "admin-001", name: "ผู้ดูแลระบบ", email: "admin@pcc.co.th", role: UserRole.SYSTEM_ADMIN, password: "PccAdmin2026!" },
    { id: "exec-001", name: "ผู้บริหาร", email: "exec@pcc.co.th", role: UserRole.EXECUTIVE, password: "PccDemo2026!" },
    { id: "pm-001", name: "สมชาย PM", email: "pm@pcc.co.th", role: UserRole.PM, password: "PccDemo2026!" },
    { id: "eng-001", name: "วิศวกรโครงการ", email: "engineer@pcc.co.th", role: UserRole.ENGINEER, password: "PccDemo2026!" },
    { id: "site-001", name: "วิศวกรหน้างาน", email: "site@pcc.co.th", role: UserRole.SITE_ENGINEER, password: "PccDemo2026!" },
    { id: "qc-001", name: "QC Inspector", email: "qc@pcc.co.th", role: UserRole.QC_INSPECTOR, password: "PccDemo2026!" },
    { id: "wh-001", name: "คลังสินค้า", email: "warehouse@pcc.co.th", role: UserRole.WAREHOUSE, password: "PccDemo2026!" },
    { id: "tr-001", name: "พนักงานขนส่ง", email: "transport@pcc.co.th", role: UserRole.TRANSPORT, password: "PccDemo2026!" },
    { id: "own-001", name: "เจ้าของโครงการ A", email: "owner@client.co.th", role: UserRole.OWNER, password: "PccDemo2026!" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        passwordHash: hash,
        isActive: true,
      },
    });
    console.log(`  ✅ User: ${u.email} (${u.role})`);
  }

  console.log("\n✨ Seed completed!");
  console.log("─────────────────────────────────────────");
  console.log("รหัสผ่านผู้ดูแลระบบ : PccAdmin2026!");
  console.log("รหัสผ่านผู้ใช้ทั่วไป : PccDemo2026!");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
