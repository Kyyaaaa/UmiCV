-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Employee', 'TechLead', 'HR', 'Admin');

-- CreateEnum
CREATE TYPE "CVStatus" AS ENUM ('Draft', 'PendingApproval', 'Outdated', 'Updated', 'Cancelled');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('Approve', 'Reject');

-- CreateEnum
CREATE TYPE "TargetStatus" AS ENUM ('Outdated', 'Updated');

-- CreateEnum
CREATE TYPE "BatchRequestStatus" AS ENUM ('Active', 'Cancelled');

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "parent_department_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "department_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "tech_lead_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "cv_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "status" "CVStatus" NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 0,
    "sections_data" JSONB NOT NULL DEFAULT '{}',
    "submitted_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_version_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cv_profile_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_version_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "BatchRequestStatus" NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_request_targets" (
    "batch_request_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "TargetStatus" NOT NULL DEFAULT 'Outdated',
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_request_targets_pkey" PRIMARY KEY ("batch_request_id","user_id")
);

-- CreateTable
CREATE TABLE "approval_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cv_profile_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "level" INTEGER NOT NULL,
    "reason" TEXT,
    "section_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" VARCHAR(100) NOT NULL,
    "user_id" UUID,
    "resource_id" VARCHAR(255),
    "ip_address" VARCHAR(50),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_tech_lead_id_idx" ON "projects"("tech_lead_id");

-- CreateIndex
CREATE INDEX "cv_profiles_user_id_idx" ON "cv_profiles"("user_id");

-- CreateIndex
CREATE INDEX "cv_profiles_status_idx" ON "cv_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cv_profiles_user_id_language_code_key" ON "cv_profiles"("user_id", "language_code");

-- CreateIndex
CREATE INDEX "cv_version_histories_cv_profile_id_idx" ON "cv_version_histories"("cv_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "cv_version_histories_cv_profile_id_version_number_key" ON "cv_version_histories"("cv_profile_id", "version_number");

-- CreateIndex
CREATE INDEX "batch_requests_created_by_idx" ON "batch_requests"("created_by");

-- CreateIndex
CREATE INDEX "batch_requests_status_deadline_idx" ON "batch_requests"("status", "deadline");

-- CreateIndex
CREATE INDEX "batch_request_targets_user_id_idx" ON "batch_request_targets"("user_id");

-- CreateIndex
CREATE INDEX "approval_logs_cv_profile_id_idx" ON "approval_logs"("cv_profile_id");

-- CreateIndex
CREATE INDEX "approval_logs_approver_id_idx" ON "approval_logs"("approver_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_tech_lead_id_fkey" FOREIGN KEY ("tech_lead_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_profiles" ADD CONSTRAINT "cv_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_version_histories" ADD CONSTRAINT "cv_version_histories_cv_profile_id_fkey" FOREIGN KEY ("cv_profile_id") REFERENCES "cv_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_requests" ADD CONSTRAINT "batch_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_request_targets" ADD CONSTRAINT "batch_request_targets_batch_request_id_fkey" FOREIGN KEY ("batch_request_id") REFERENCES "batch_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_request_targets" ADD CONSTRAINT "batch_request_targets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_logs" ADD CONSTRAINT "approval_logs_cv_profile_id_fkey" FOREIGN KEY ("cv_profile_id") REFERENCES "cv_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_logs" ADD CONSTRAINT "approval_logs_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Manual Migration Required: GIN Index for JSONB
CREATE INDEX "idx_cv_profiles_sections_data_gin" ON "cv_profiles" USING GIN ("sections_data");

-- Manual Migration Required: Partial Index for status
CREATE INDEX "idx_batch_request_targets_status" ON "batch_request_targets"("status") WHERE "status" = 'Outdated';
