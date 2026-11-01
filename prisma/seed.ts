import { PrismaClient, UserRole, WorkType, ProjectStatus, ProjectMemberRole, WorkPackageStatus, TaskStatus, RecordStatus, ProductionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getTemplateForWorkType, defaultPlan } from "../src/lib/templates";

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

    // Packages and Tasks
    for (const pkg of p.packages) {
      const existingPkg = await prisma.workPackage.findFirst({
        where: { projectId: project.id, code: pkg.code }
      });
      let packageRecord;
      if (existingPkg) {
        packageRecord = await prisma.workPackage.update({
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
        packageRecord = await prisma.workPackage.create({
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

      // Generate WBS Tasks for Package from WorkType Template
      const template = getTemplateForWorkType(p.workType);
      const startDateStr = p.startDate.toISOString().slice(0, 10);
      const planItems = defaultPlan(template, startDateStr);

      for (let idx = 0; idx < planItems.length; idx++) {
        const item = planItems[idx];

        // Status logic for demo: first 35% done, next in_progress, rest pending
        let status: TaskStatus = TaskStatus.PENDING;
        if (p.status === ProjectStatus.ACTIVE) {
          if (idx < Math.floor(planItems.length * 0.35)) {
            status = TaskStatus.DONE;
          } else if (idx === Math.floor(planItems.length * 0.35)) {
            status = TaskStatus.IN_PROGRESS;
          }
        }

        const existingTask = await prisma.task.findFirst({
          where: { packageId: packageRecord.id, code: item.code }
        });

        if (existingTask) {
          await prisma.task.update({
            where: { id: existingTask.id },
            data: {
              name: item.title,
              stepIndex: idx + 1,
              status,
              plannedStart: new Date(item.start),
              plannedEnd: new Date(item.end),
              dependsOn: item.predecessor ? [item.predecessor] : [],
              isGate: item.isGate,
              gateCode: item.gateCode,
              notes: JSON.stringify({ type: item.type, responsible: item.responsible, duration: item.duration }),
            }
          });
        } else {
          await prisma.task.create({
            data: {
              projectId: project.id,
              packageId: packageRecord.id,
              code: item.code,
              name: item.title,
              stepIndex: idx + 1,
              status,
              plannedStart: new Date(item.start),
              plannedEnd: new Date(item.end),
              dependsOn: item.predecessor ? [item.predecessor] : [],
              isGate: item.isGate,
              gateCode: item.gateCode,
              notes: JSON.stringify({ type: item.type, responsible: item.responsible, duration: item.duration }),
            }
          });
        }
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

    // -------------------------------------------------------------------------
    // Seed Drawings, BOM Items, Material Requests & Production Orders (Module 2)
    // -------------------------------------------------------------------------
    if (project.code === "PCC-26001") {
      const pkgA = await prisma.workPackage.findFirst({
        where: { projectId: project.id, code: "WP-F-01" }
      });

      const drawing = await prisma.drawing.upsert({
        where: { id: "dwg-f-101" },
        update: {
          code: "Drawing F-101",
          title: "แบบติดตั้งงานเสารั้ว (F)",
          revision: "03",
          status: RecordStatus.APPROVED,
          packageId: pkgA?.id,
          approvedBy: "นายวิชาญ วิศวกรรม",
          approvedAt: new Date("2026-09-09T09:00:00Z"),
          notes: "ควบคุมประวัติ Rev.01–03",
        },
        create: {
          id: "dwg-f-101",
          projectId: project.id,
          packageId: pkgA?.id,
          code: "Drawing F-101",
          title: "แบบติดตั้งงานเสารั้ว (F)",
          revision: "03",
          status: RecordStatus.APPROVED,
          approvedBy: "นายวิชาญ วิศวกรรม",
          approvedAt: new Date("2026-09-09T09:00:00Z"),
          notes: "ควบคุมประวัติ Rev.01–03",
        }
      });

      const bomData = [
        { id: "bom-f-01", itemCode: "F-PANEL-01", name: "แผ่นรั้ว F-PANEL-01", quantity: 100, additionalQty: 0, unit: "แผ่น", spec: "Precast Concrete Panel 0.50x2.50m", category: "ชิ้นส่วนคอนกรีตสำเร็จรูป" },
        { id: "bom-f-02", itemCode: "F-POST-01", name: "เสารั้ว F-POST-01", quantity: 11, additionalQty: 0, unit: "ต้น", spec: "Precast Concrete Post 0.15x0.15x3.00m", category: "ชิ้นส่วนคอนกรีตสำเร็จรูป" },
        { id: "bom-f-03", itemCode: "F-BEAM-01", name: "คานทับหลัง F-BEAM-01", quantity: 10, additionalQty: 0, unit: "ชิ้น", spec: "Capping Beam 0.15x0.10x2.50m", category: "ชิ้นส่วนคอนกรีตสำเร็จรูป" },
        { id: "bom-f-04", itemCode: "JT-01", name: "วัสดุเก็บรอยต่อ JT-01", quantity: 10, additionalQty: 0, unit: "ชุด", spec: "Joint Mortar + Sealant", category: "วัสดุเก็บรอยต่อ" },
      ];

      for (const item of bomData) {
        await prisma.bomItem.upsert({
          where: { id: item.id },
          update: {
            itemCode: item.itemCode,
            name: item.name,
            quantity: item.quantity,
            additionalQty: item.additionalQty,
            unit: item.unit,
            spec: item.spec,
            category: item.category,
          },
          create: {
            id: item.id,
            drawingId: drawing.id,
            itemCode: item.itemCode,
            name: item.name,
            quantity: item.quantity,
            additionalQty: item.additionalQty,
            unit: item.unit,
            spec: item.spec,
            category: item.category,
          }
        });
      }

      if (pkgA) {
        const mr = await prisma.materialRequest.upsert({
          where: { requestNo: "REQ-260012" },
          update: {
            packageId: pkgA.id,
            drawingId: drawing.id,
            drawingRev: "Rev.03",
            neededBy: new Date("2026-09-14"),
            status: RecordStatus.APPROVED,
            notes: "ส่งโซน A · ติดต่อผู้รับเหมาหน้างานก่อนเข้าพื้นที่",
            externalRef: "WH-260045",
            warehouseName: "คลังหลักบางปะอิน",
            storageLocation: "Zone B-04 / Lot 12",
            confirmedBy: "เจ้าหน้าที่คลัง",
            confirmedAt: new Date("2026-09-11T16:30:00Z"),
            responseFileUrl: "WH-260045-confirmation.pdf",
            warehouseNotes: "มีแผ่นรั้วในสต็อกพร้อมส่ง 70 แผ่น ส่วนขาด 30 แผ่นต้องรอผลิตเพิ่ม เสาและคานมีครบ",
          },
          create: {
            requestNo: "REQ-260012",
            projectId: project.id,
            packageId: pkgA.id,
            drawingId: drawing.id,
            drawingRev: "Rev.03",
            neededBy: new Date("2026-09-14"),
            status: RecordStatus.APPROVED,
            notes: "ส่งโซน A · ติดต่อผู้รับเหมาหน้างานก่อนเข้าพื้นที่",
            externalRef: "WH-260045",
            warehouseName: "คลังหลักบางปะอิน",
            storageLocation: "Zone B-04 / Lot 12",
            confirmedBy: "เจ้าหน้าที่คลัง",
            confirmedAt: new Date("2026-09-11T16:30:00Z"),
            responseFileUrl: "WH-260045-confirmation.pdf",
            warehouseNotes: "มีแผ่นรั้วในสต็อกพร้อมส่ง 70 แผ่น ส่วนขาด 30 แผ่นต้องรอผลิตเพิ่ม เสาและคานมีครบ",
          }
        });

        const mrItems = [
          { itemCode: "F-PANEL-01", description: "แผ่นรั้ว F-PANEL-01", quantity: 100, unit: "แผ่น", allocated: 70, confirmed: 70, shortage: 30, bomItemId: "bom-f-01" },
          { itemCode: "F-POST-01", description: "เสารั้ว F-POST-01", quantity: 11, unit: "ต้น", allocated: 11, confirmed: 11, shortage: 0, bomItemId: "bom-f-02" },
          { itemCode: "F-BEAM-01", description: "คานทับหลัง F-BEAM-01", quantity: 10, unit: "ชิ้น", allocated: 10, confirmed: 10, shortage: 0, bomItemId: "bom-f-03" },
        ];

        for (const mri of mrItems) {
          const existingItem = await prisma.materialRequestItem.findFirst({
            where: { requestId: mr.id, itemCode: mri.itemCode }
          });
          if (existingItem) {
            await prisma.materialRequestItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: mri.quantity,
                unit: mri.unit,
                allocated: mri.allocated,
                confirmed: mri.confirmed,
                shortage: mri.shortage,
                bomItemId: mri.bomItemId,
              }
            });
          } else {
            await prisma.materialRequestItem.create({
              data: {
                requestId: mr.id,
                itemCode: mri.itemCode,
                description: mri.description,
                quantity: mri.quantity,
                unit: mri.unit,
                allocated: mri.allocated,
                confirmed: mri.confirmed,
                shortage: mri.shortage,
                bomItemId: mri.bomItemId,
              }
            });
          }
        }

        await prisma.productionOrder.upsert({
          where: { orderNo: "PRD-260008" },
          update: {
            projectId: project.id,
            requestId: mr.id,
            bomItemId: "bom-f-01",
            itemCode: "F-PANEL-01",
            itemName: "แผ่นรั้ว",
            quantity: 20,
            unit: "แผ่น",
            readyDate: new Date("2026-09-14"),
            status: ProductionStatus.PRODUCING,
            latestUpdate: "11 ก.ย. / ฝ่ายผลิต",
            history: [
              { date: "11 ก.ย. 10:00", text: "ฝ่ายผลิตยืนยันรับคำสั่งผลิต 20 แผ่น เข้าไลน์หล่อแบบ" }
            ],
            notes: "ผลิตเสริมรอบปกติ",
          },
          create: {
            orderNo: "PRD-260008",
            projectId: project.id,
            requestId: mr.id,
            bomItemId: "bom-f-01",
            itemCode: "F-PANEL-01",
            itemName: "แผ่นรั้ว",
            quantity: 20,
            unit: "แผ่น",
            readyDate: new Date("2026-09-14"),
            status: ProductionStatus.PRODUCING,
            latestUpdate: "11 ก.ย. / ฝ่ายผลิต",
            history: [
              { date: "11 ก.ย. 10:00", text: "ฝ่ายผลิตยืนยันรับคำสั่งผลิต 20 แผ่น เข้าไลน์หล่อแบบ" }
            ],
            notes: "ผลิตเสริมรอบปกติ",
          }
        });

        await prisma.productionOrder.upsert({
          where: { orderNo: "PRD-260009" },
          update: {
            projectId: project.id,
            requestId: mr.id,
            bomItemId: "bom-f-01",
            itemCode: "F-PANEL-01",
            itemName: "แผ่นรั้ว",
            quantity: 10,
            unit: "แผ่น",
            readyDate: null,
            status: ProductionStatus.PENDING,
            latestUpdate: "12 ก.ย. / ผู้ประสาน",
            history: [
              { date: "12 ก.ย. 09:00", text: "ส่งคำขอเพิ่ม 10 แผ่นจากยอดขาด" },
              { date: "12 ก.ย. 11:00", text: "ผู้ประสานติดตามกำหนดพร้อมส่ง" }
            ],
            notes: "ขอผลิตเพิ่ม 10 แผ่นจากส่วนขาดยืนยัน",
          },
          create: {
            orderNo: "PRD-260009",
            projectId: project.id,
            requestId: mr.id,
            bomItemId: "bom-f-01",
            itemCode: "F-PANEL-01",
            itemName: "แผ่นรั้ว",
            quantity: 10,
            unit: "แผ่น",
            readyDate: null,
            status: ProductionStatus.PENDING,
            latestUpdate: "12 ก.ย. / ผู้ประสาน",
            history: [
              { date: "12 ก.ย. 09:00", text: "ส่งคำขอเพิ่ม 10 แผ่นจากยอดขาด" },
              { date: "12 ก.ย. 11:00", text: "ผู้ประสานติดตามกำหนดพร้อมส่ง" }
            ],
            notes: "ขอผลิตเพิ่ม 10 แผ่นจากส่วนขาดยืนยัน",
          }
        });
      }
    } else if (project.code === "PCC-26002") {
      const pkgRW = await prisma.workPackage.findFirst({
        where: { projectId: project.id, code: "WP-RW-01" }
      });
      const drawing = await prisma.drawing.upsert({
        where: { id: "dwg-rw-201" },
        update: {
          code: "Drawing RW-201",
          title: "แบบติดตั้งงานกำแพงกันดิน (L-Wall)",
          revision: "02",
          status: RecordStatus.APPROVED,
          packageId: pkgRW?.id,
          approvedBy: "นายสมชาย วิศวกรรม",
          approvedAt: new Date("2026-08-25T10:00:00Z"),
          notes: "รับรองแบบฐานรากและแผงกันดิน L-Wall",
        },
        create: {
          id: "dwg-rw-201",
          projectId: project.id,
          packageId: pkgRW?.id,
          code: "Drawing RW-201",
          title: "แบบติดตั้งงานกำแพงกันดิน (L-Wall)",
          revision: "02",
          status: RecordStatus.APPROVED,
          approvedBy: "นายสมชาย วิศวกรรม",
          approvedAt: new Date("2026-08-25T10:00:00Z"),
          notes: "รับรองแบบฐานรากและแผงกันดิน L-Wall",
        }
      });

      const bomItemsRW = [
        { id: "bom-rw-01", itemCode: "RW-LWALL-01", name: "แผ่นผนังกันดิน L-Wall 2.0m", quantity: 125, unit: "แผ่น", spec: "L-Shape Precast Wall H=2.0m L=2.0m", category: "ชิ้นส่วนคอนกรีตสำเร็จรูป" },
        { id: "bom-rw-02", itemCode: "RW-KEY-01", name: "สลักล็อกรอยต่อ Shear Key", quantity: 130, unit: "ชิ้น", spec: "Galvanized Steel Connector", category: "ข้อต่อเหล็ก" },
        { id: "bom-rw-03", itemCode: "RW-GROUT-01", name: "ปูนเกราท์กำลังสูง Non-Shrink", quantity: 80, unit: "ถุง", spec: "High Strength Non-Shrink Grout", category: "วัสดุประสาน" },
      ];

      for (const item of bomItemsRW) {
        await prisma.bomItem.upsert({
          where: { id: item.id },
          update: {
            itemCode: item.itemCode,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            spec: item.spec,
            category: item.category,
          },
          create: {
            id: item.id,
            drawingId: drawing.id,
            itemCode: item.itemCode,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            spec: item.spec,
            category: item.category,
          }
        });
      }
    } else if (project.code === "PCC-26004") {
      const pkgPT = await prisma.workPackage.findFirst({
        where: { projectId: project.id, code: "WP-PT-01" }
      });
      const drawing = await prisma.drawing.upsert({
        where: { id: "dwg-pt-401" },
        update: {
          code: "Drawing PT-401",
          title: "แบบวางแนวลวดโพสเทนชั่น (PT Slab)",
          revision: "04",
          status: RecordStatus.APPROVED,
          packageId: pkgPT?.id,
          approvedBy: "นายวิชาญ วิศวกรรม",
          approvedAt: new Date("2026-09-28T14:00:00Z"),
          notes: "อนุมัติแนวลวด Tendon Profile และตำแหน่ง Anchor Block AP1-AP7",
        },
        create: {
          id: "dwg-pt-401",
          projectId: project.id,
          packageId: pkgPT?.id,
          code: "Drawing PT-401",
          title: "แบบวางแนวลวดโพสเทนชั่น (PT Slab)",
          revision: "04",
          status: RecordStatus.APPROVED,
          approvedBy: "นายวิชาญ วิศวกรรม",
          approvedAt: new Date("2026-09-28T14:00:00Z"),
          notes: "อนุมัติแนวลวด Tendon Profile และตำแหน่ง Anchor Block AP1-AP7",
        }
      });

      const bomItemsPT = [
        { id: "bom-pt-01", itemCode: "PT-STRAND-01", name: "ลวดอัดแรง PC Strand 0.5 นิ้ว (12.7mm)", quantity: 4500, unit: "เมตร", spec: "Unbonded 7-wire strand ASTM A416", category: "ลวดอัดแรง" },
        { id: "bom-pt-02", itemCode: "PT-ANCHOR-01", name: "หัวยึดสมอ Anchor Head + Castings", quantity: 180, unit: "ชุด", spec: "Monostrand Live End Anchor System", category: "ระบบสมอยึด" },
        { id: "bom-pt-03", itemCode: "PT-BARREL-01", name: "ลิ่มยึดลวด 2-Part Wedges", quantity: 360, unit: "ชิ้น", spec: "Hardened steel wedges", category: "ระบบสมอยึด" },
        { id: "bom-pt-04", itemCode: "PT-CHAIR-01", name: "ขาหยั่งลวด Support Chair", quantity: 650, unit: "ตัว", spec: "Plastic tipped bar chair H=80-140mm", category: "อุปกรณ์จัดระดับ" },
      ];

      for (const item of bomItemsPT) {
        await prisma.bomItem.upsert({
          where: { id: item.id },
          update: {
            itemCode: item.itemCode,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            spec: item.spec,
            category: item.category,
          },
          create: {
            id: item.id,
            drawingId: drawing.id,
            itemCode: item.itemCode,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            spec: item.spec,
            category: item.category,
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