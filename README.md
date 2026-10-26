# PCC PMS 2026 — Next.js Application

ระบบบริหารงานก่อสร้างสำหรับ Precast Concrete Co., Ltd.

**Stack:** Next.js 16 · TypeScript · PostgreSQL · Prisma 5 · NextAuth.js 5 · Tailwind CSS 4

---

## 🚀 เริ่มต้นใช้งาน (ครั้งแรก)

### ขั้นตอนที่ 1 — ติดตั้ง Postgres.app

1. ดาวน์โหลดจาก **https://postgresapp.com**
2. ลากไปไว้ใน Applications แล้วเปิด
3. กด **"Initialize"** เพื่อสร้าง PostgreSQL server
4. เพิ่ม `psql` ลง PATH:

```bash
sudo mkdir -p /etc/paths.d
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
```

5. เปิด Terminal ใหม่ แล้วตรวจสอบ: `psql --version`

### ขั้นตอนที่ 2 — ตั้งค่า Database

```bash
# สร้าง database และ user
psql postgres -c "CREATE ROLE pcc_user WITH LOGIN PASSWORD 'pcc_dev_pass';"
psql postgres -c "CREATE DATABASE pcc_pms_dev OWNER pcc_user;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE pcc_pms_dev TO pcc_user;"

# รัน migrations
npm run db:migrate

# ใส่ข้อมูลตัวอย่าง
npm run db:seed
```

### ขั้นตอนที่ 3 — เริ่ม Dev Server

```bash
npm run dev
```

เปิด **http://localhost:3000**

---

## 📋 บัญชีผู้ใช้ตัวอย่าง

| อีเมล | รหัสผ่าน | บทบาท |
|---|---|---|
| `admin@pcc.co.th` | `PccAdmin2026!` | ผู้ดูแลระบบ |
| `pm@pcc.co.th` | `PccDemo2026!` | ผู้จัดการโครงการ |
| `engineer@pcc.co.th` | `PccDemo2026!` | วิศวกรโครงการ |
| `site@pcc.co.th` | `PccDemo2026!` | วิศวกรหน้างาน |
| `qc@pcc.co.th` | `PccDemo2026!` | QC Inspector |
| `warehouse@pcc.co.th` | `PccDemo2026!` | คลัง/จัดซื้อ |
| `transport@pcc.co.th` | `PccDemo2026!` | ขนส่ง |
| `owner@client.co.th` | `PccDemo2026!` | เจ้าของโครงการ |

---

## 🛠 Scripts

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed initial data
npm run db:studio    # Open Prisma Studio (DB browser)
npm run db:reset     # Reset DB + reseed
npm run type-check   # TypeScript check
```

---

## 📁 โครงสร้างโปรเจกต์

```
pcc-pms-app/
├── prisma/
│   ├── schema.prisma      # Database schema (source of truth)
│   ├── seed.ts            # Initial data seeder
│   └── migrations/        # Migration history
├── src/
│   ├── app/
│   │   ├── (dashboard)/   # Protected pages (requires login)
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   ├── api/auth/      # NextAuth.js API routes
│   │   ├── login/         # Login page (SVG 00)
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Root redirect
│   ├── auth.ts            # NextAuth.js config
│   ├── auth.config.ts     # Auth providers & callbacks
│   ├── proxy.ts           # Auth middleware (route protection)
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── Topbar.tsx
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client singleton
│   │   └── utils.ts       # Utility functions
│   └── types/
│       └── next-auth.d.ts # Type augmentation
├── scripts/
│   └── setup-db.sh        # Database setup script
├── .env.local             # Local environment (ไม่ commit)
├── .env.example           # Template สำหรับ production
└── next.config.ts
```

---

## 🐧 เตรียม Deploy ไป Linux Server

```bash
# On Linux server
git clone <repo> pcc-pms-app
cd pcc-pms-app
cp .env.example .env.local
# แก้ DATABASE_URL, AUTH_SECRET

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

---

## 📌 Development Progress

| Phase | Status | รายละเอียด |
|---|:---:|---|
| Phase 0 — Setup & Foundation | ✅ **เสร็จ** | Next.js + Auth + DB Schema + Design System |
| Phase 1 — Project Core | 🔜 ถัดไป | CRUD โครงการ, 4-Step Wizard, Dashboard |
| Phase 2 — Planning & Materials | ⏳ รอ | Gantt, BOM, วัสดุ, ขนส่ง |
| Phase 3 — QC & Installation | ⏳ รอ | Daily Log, QC, NCR, PT Gates |
| Phase 4 — Finance & Reports | ⏳ รอ | การเงิน, รายงาน, Owner Portal |
