#!/bin/bash
# PCC PMS — Database Setup Script
# รันหลังจากติดตั้ง Postgres.app แล้ว

set -e

echo "🐘 PCC PMS — PostgreSQL Setup"
echo "================================"

# ตรวจสอบว่ามี psql
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found!"
    echo ""
    echo "กรุณาติดตั้ง Postgres.app ก่อน:"
    echo "  1. ดาวน์โหลดจาก https://postgresapp.com"
    echo "  2. ติดตั้ง และ Initialize"
    echo "  3. เพิ่ม PATH: sudo mkdir -p /etc/paths.d && echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp"
    echo "  4. เปิด Terminal ใหม่ แล้วรัน script นี้อีกครั้ง"
    exit 1
fi

echo "✅ psql found: $(psql --version)"

# สร้าง database และ user
echo ""
echo "📦 สร้าง Database และ User..."

psql postgres << 'EOSQL'
-- สร้าง user (ถ้ายังไม่มี)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pcc_user') THEN
    CREATE ROLE pcc_user WITH LOGIN PASSWORD 'pcc_dev_pass';
    RAISE NOTICE 'Created role: pcc_user';
  END IF;
END
$$;

-- สร้าง database (ถ้ายังไม่มี)
SELECT 'CREATE DATABASE pcc_pms_dev OWNER pcc_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pcc_pms_dev')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pcc_pms_dev TO pcc_user;
EOSQL

echo "✅ Database ready: pcc_pms_dev"

# Run Prisma migrations
echo ""
echo "🔄 Running Prisma migrations..."
cd "$(dirname "$0")/.."
npx prisma migrate dev --name init

echo ""
echo "🌱 Seeding initial data..."
npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo "================================"
echo "Database : pcc_pms_dev"
echo "User     : pcc_user"
echo "Password : pcc_dev_pass"
echo "Port     : 5432"
echo ""
echo "เริ่มต้น dev server:"
echo "  npm run dev"
echo ""
echo "เปิด: http://localhost:3000"
