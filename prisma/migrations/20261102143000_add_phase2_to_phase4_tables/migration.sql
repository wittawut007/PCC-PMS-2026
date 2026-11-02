-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PENDING', 'PRODUCING', 'READY', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "daily_logs" DROP CONSTRAINT "daily_logs_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_logs" DROP CONSTRAINT "daily_logs_project_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_logs" DROP CONSTRAINT "daily_logs_task_id_fkey";

-- DropForeignKey
ALTER TABLE "material_requests" DROP CONSTRAINT "material_requests_project_id_fkey";

-- DropForeignKey
ALTER TABLE "ncr_records" DROP CONSTRAINT "ncr_records_record_id_fkey";

-- DropForeignKey
ALTER TABLE "receiving_records" DROP CONSTRAINT "receiving_records_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "transport_trips" DROP CONSTRAINT "transport_trips_request_id_fkey";

-- AlterTable
ALTER TABLE "daily_logs" ADD COLUMN     "activity" TEXT,
ADD COLUMN     "equipment" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "package_id" TEXT,
ADD COLUMN     "photos" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "qc_status" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "work_hours" DECIMAL(5,2),
ALTER COLUMN "task_id" DROP NOT NULL,
ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "material_request_items" ADD COLUMN     "allocated" DECIMAL(14,3) NOT NULL DEFAULT 0,
ADD COLUMN     "bom_item_id" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "material_requests" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "confirmed_by" TEXT,
ADD COLUMN     "drawing_id" TEXT,
ADD COLUMN     "external_ref" TEXT,
ADD COLUMN     "response_file_url" TEXT,
ADD COLUMN     "storage_location" TEXT,
ADD COLUMN     "warehouse_name" TEXT,
ADD COLUMN     "warehouse_notes" TEXT;

-- AlterTable
ALTER TABLE "ncr_records" ADD COLUMN     "corrective_action" TEXT,
ADD COLUMN     "history" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "project_id" TEXT,
ADD COLUMN     "reference_doc" TEXT,
ADD COLUMN     "verification_notes" TEXT,
ALTER COLUMN "record_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "receiving_records" ADD COLUMN     "actual_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
ADD COLUMN     "attached_files" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "damage_notes" TEXT,
ADD COLUMN     "delivered_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PARTIAL';

-- AlterTable
ALTER TABLE "transport_trips" ADD COLUMN     "cargo_description" TEXT,
ADD COLUMN     "cargo_qty" DECIMAL(14,3),
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "delivery_note_no" TEXT,
ADD COLUMN     "destination" TEXT DEFAULT 'โซน A',
ADD COLUMN     "driver_phone" TEXT,
ADD COLUMN     "origin" TEXT DEFAULT 'คลังภายนอก',
ADD COLUMN     "package_id" TEXT,
ADD COLUMN     "project_id" TEXT,
ADD COLUMN     "timeline" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "unit" TEXT DEFAULT 'แผ่น',
ALTER COLUMN "request_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "qc_inspections" (
    "id" TEXT NOT NULL,
    "inspection_no" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "package_id" TEXT,
    "scope" TEXT,
    "drawing_ref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RE_INSPECT',
    "inspector" TEXT DEFAULT 'QC โครงการ',
    "inspected_at" TIMESTAMP(3),
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "ncr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_gates" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "package_id" TEXT,
    "gate_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unlocked_action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "pour_zone" TEXT,
    "test_result" TEXT,
    "standard_ref" TEXT,
    "approver" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drawings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "package_id" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "revision" TEXT NOT NULL DEFAULT '01',
    "status" "RecordStatus" NOT NULL DEFAULT 'APPROVED',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drawings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_items" (
    "id" TEXT NOT NULL,
    "drawing_id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "additional_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "spec" TEXT,
    "category" TEXT,
    "required_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "request_id" TEXT,
    "bom_item_id" TEXT,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'แผ่น',
    "spec" TEXT,
    "factory" TEXT DEFAULT 'ฝ่ายผลิต / โรงงานพรีคาสท์ PCC',
    "ready_date" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" "ProductionStatus" NOT NULL DEFAULT 'PENDING',
    "latest_update" TEXT,
    "history" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "package_id" TEXT,
    "package_title" TEXT NOT NULL,
    "budget_amount" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "committed_cost" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "forecast_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "variance" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handover_items" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "owner_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "status_label" TEXT NOT NULL,
    "status_tone" TEXT NOT NULL DEFAULT 'gray',
    "sort_order" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handover_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "request_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "assigned_role" TEXT NOT NULL,
    "assigned_to" TEXT,
    "package_code" TEXT,
    "bom_ref" TEXT,
    "required_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "status_label" TEXT NOT NULL,
    "tab_group" TEXT NOT NULL DEFAULT 'WAITING_ME',
    "details" JSONB DEFAULT '{}',
    "reference_doc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qc_inspections_inspection_no_key" ON "qc_inspections"("inspection_no");

-- CreateIndex
CREATE UNIQUE INDEX "approval_gates_project_id_gate_code_key" ON "approval_gates"("project_id", "gate_code");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_order_no_key" ON "production_orders"("order_no");

-- AddForeignKey
ALTER TABLE "ncr_records" ADD CONSTRAINT "ncr_records_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "workflow_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ncr_records" ADD CONSTRAINT "ncr_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_gates" ADD CONSTRAINT "approval_gates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_gates" ADD CONSTRAINT "approval_gates_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requests" ADD CONSTRAINT "material_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requests" ADD CONSTRAINT "material_requests_drawing_id_fkey" FOREIGN KEY ("drawing_id") REFERENCES "drawings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_request_items" ADD CONSTRAINT "material_request_items_bom_item_id_fkey" FOREIGN KEY ("bom_item_id") REFERENCES "bom_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_trips" ADD CONSTRAINT "transport_trips_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_trips" ADD CONSTRAINT "transport_trips_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_trips" ADD CONSTRAINT "transport_trips_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "material_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_records" ADD CONSTRAINT "receiving_records_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "transport_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drawings" ADD CONSTRAINT "drawings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drawings" ADD CONSTRAINT "drawings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_drawing_id_fkey" FOREIGN KEY ("drawing_id") REFERENCES "drawings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "material_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_bom_item_id_fkey" FOREIGN KEY ("bom_item_id") REFERENCES "bom_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handover_items" ADD CONSTRAINT "handover_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_tasks" ADD CONSTRAINT "approval_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

