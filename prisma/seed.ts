import { PrismaClient, UserRole, WorkType, ProjectStatus, ProjectMemberRole, WorkPackageStatus } from "@prisma/client";
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
      update: {
        name: u.name,
        role: u.role,
        passwordHash: hash,
      },
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

  // Projects data matching demo & SVG 01 / 02
  const projects = [
    {
      id: "proj-001",
      code: "PCC-26001",
      name: "โครงการตัวอย่าง PCC (รั้ว)",
      workType: WorkType.F,
      status: ProjectStatus.ACTIVE,
      clientName: "บริษัทลูกค้าตัวอย่าง จำกัด",
      contractNo: "PO-2026-08892",
      siteAddress: "นิคมอุตสาหกรรมบางปะอิน จ.พระนครศรีอยุธยา",
      startDate: new Date("2026-10-01"),
      targetDate: new Date("2026-11-30"),
      notes: "แผนและทีมพร้อม · มีงานรอ QC",
      contract: {
        contractNo: "PO-2026-08892",
        baseValue: 4850000,
        signedDate: new Date("2026-09-15"),
      },
      packages: [
        { code: "WP-F-01", name: "ชุดงานเสารั้ว โซน A", zone: "โซน A", target: 120, unit: "ต้น", weight: 60, status: WorkPackageStatus.IN_PROGRESS },
        { code: "WP-F-02", name: "ชุดงานเสารั้ว โซน B", zone: "โซน B", target: 80, unit: "ต้น", weight: 40, status: WorkPackageStatus.PENDING },
      ],
      members: [
        { userId: "pm-001", role: ProjectMemberRole.PM },
        { userId: "eng-001", role: ProjectMemberRole.ENGINEER },
        { userId: "site-001", role: ProjectMemberRole.SITE_ENGINEER },
        { userId: "qc-001", role: ProjectMemberRole.QC_INSPECTOR },
      ]
    },
    {
      id: "proj-002",
      code: "PCC-26002",
      name: "กำแพงกันดิน ริมน้ำนนทบุรี (RW)",
      workType: WorkType.RW,
      status: ProjectStatus.ACTIVE,
      clientName: "บริษัท เจ้าพระยาพัฒนา จำกัด",
      contractNo: "PO-2026-09112",
      siteAddress: "ริมแม่น้ำเจ้าพระยา อ.เมือง จ.นนทบุรี",
      startDate: new Date("2026-09-01"),
      targetDate: new Date("2026-11-20"),
      notes: "งาน L-Wall หล่อสำเร็จ เข้าติดตั้งตามแผน",
      contract: {
        contractNo: "PO-2026-09112",
        baseValue: 6200000,
        signedDate: new Date("2026-08-20"),
      },
      packages: [
        { code: "WP-RW-01", name: "กำแพงกันดินแนวริมน้ำ", zone: "Zone River", target: 250, unit: "เมตร", weight: 100, status: WorkPackageStatus.IN_PROGRESS },
      ],
      members: [
        { userId: "pm-001", role: ProjectMemberRole.PM },
        { userId: "eng-001", role: ProjectMemberRole.ENGINEER },
        { userId: "site-001", role: ProjectMemberRole.SITE_ENGINEER },
      ]
    },
    {
      id: "proj-003",
      code: "PCC-26003",
      name: "กำแพงพร้อมรั้วคลังสินค้า (RWF)",
      workType: WorkType.RWF,
      status: ProjectStatus.ACTIVE,
      clientName: "บริษัท โลจิสติกส์ พลัส จำกัด",
      contractNo: "PO-2026-09405",
      siteAddress: "ถ.กาญจนาภิเษก อ.บางใหญ่ จ.นนทบุรี",
      startDate: new Date("2026-08-15"),
      targetDate: new Date("2026-12-15"),
      notes: "รอยืนยันพื้นที่และ Baseline ส่วนบน",
      contract: {
        contractNo: "PO-2026-09405",
        baseValue: 8500000,
        signedDate: new Date("2026-08-01"),
      },
      packages: [
        { code: "WP-RWF-01", name: "กำแพงกันดินเชื่อมเสารั้ว", zone: "Zone Warehouse", target: 380, unit: "เมตร", weight: 100, status: WorkPackageStatus.IN_PROGRESS },
      ],
      members: [
        { userId: "pm-001", role: ProjectMemberRole.PM },
        { userId: "eng-001", role: ProjectMemberRole.ENGINEER },
        { userId: "site-001", role: ProjectMemberRole.SITE_ENGINEER },
      ]
    },
    {
      id: "proj-004",
      code: "PCC-26004",
      name: "งานพื้นโพสเทนชั่น PCC Tower (PT)",
      workType: WorkType.PT,
      status: ProjectStatus.ACTIVE,
      clientName: "บริษัท สาทร ทาวเวอร์ ดีเวลลอปเมนท์ จำกัด",
      contractNo: "PO-2026-09820",
      siteAddress: "ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ",
      startDate: new Date("2026-09-15"),
      targetDate: new Date("2027-01-31"),
      notes: "ดึงลวดอัดแรง AP1–AP7 ชั้น 1-5",
      contract: {
        contractNo: "PO-2026-09820",
        baseValue: 12800000,
        signedDate: new Date("2026-09-01"),
      },
      packages: [
        { code: "WP-PT-01", name: "พื้นโพสเทนชั่น Tower A", zone: "Tower A", target: 4500, unit: "ตร.ม.", weight: 50, status: WorkPackageStatus.IN_PROGRESS },
        { code: "WP-PT-02", name: "พื้นโพสเทนชั่น Podium", zone: "Podium", target: 4500, unit: "ตร.ม.", weight: 50, status: WorkPackageStatus.PENDING },
      ],
      members: [
        { userId: "pm-001", role: ProjectMemberRole.PM },
        { userId: "eng-001", role: ProjectMemberRole.ENGINEER },
        { userId: "site-001", role: ProjectMemberRole.SITE_ENGINEER },
      ]
    },
  ];

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        workType: p.workType,
        status: p.status,
        clientName: p.clientName,
        contractNo: p.contractNo,
        siteAddress: p.siteAddress,
        startDate: p.startDate,
        targetDate: p.targetDate,
        notes: p.notes,
      },
      create: {
        id: p.id,
        code: p.code,
        name: p.name,
        workType: p.workType,
        status: p.status,
        clientName: p.clientName,
        contractNo: p.contractNo,
        siteAddress: p.siteAddress,
        startDate: p.startDate,
        targetDate: p.targetDate,
        notes: p.notes,
      },
    });

    // Contract
    await prisma.contract.upsert({
      where: { contractNo: p.contract.contractNo },
      update: {
        baseValue: p.contract.baseValue,
        signedDate: p.contract.signedDate,
      },
      create: {
        projectId: project.id,
        contractNo: p.contract.contractNo,
        baseValue: p.contract.baseValue,
        signedDate: p.contract.signedDate,
      },
    });

    // Packages
    for (const pkg of p.packages) {
      const existingPkg = await prisma.workPackage.findFirst({
        where: { projectId: project.id, code: pkg.code }
      });
      if (existingPkg) {
        await prisma.workPackage.update({
          where: { id: existingPkg.id },
          data: {
            name: pkg.name,
            zone: pkg.zone,
            target: pkg.target,
            unit: pkg.unit,
            weight: pkg.weight,
            status: pkg.status,
          }
        });
      } else {
        await prisma.workPackage.create({
          data: {
            projectId: project.id,
            code: pkg.code,
            name: pkg.name,
            zone: pkg.zone,
            target: pkg.target,
            unit: pkg.unit,
            weight: pkg.weight,
            status: pkg.status,
          }
        });
      }
    }

    // Members
    for (const m of p.members) {
      const existingMember = await prisma.projectMember.findFirst({
        where: { projectId: project.id, userId: m.userId, roleInProject: m.role }
      });
      if (!existingMember) {
        await prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: m.userId,
            roleInProject: m.role,
          }
        });
      }
    }

    console.log(`  🏗️ Project: ${project.code} — ${project.name} (${project.workType})`);
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