-- ============================================
-- Rename(保資料):file_storage_categories → file_folders
-- ============================================
ALTER TABLE "file_storage_categories" RENAME TO "file_folders";--> statement-breakpoint
DROP INDEX "file_storage_categories_name_idx";--> statement-breakpoint
CREATE INDEX "file_folders_name_idx" ON "file_folders" USING btree ("name");--> statement-breakpoint

-- ============================================
-- Rename(保資料):file_tag_relations → file_tag_mapping
-- ============================================
ALTER TABLE "file_tag_relations" RENAME TO "file_tag_mapping";--> statement-breakpoint
ALTER TABLE "file_tag_mapping" RENAME CONSTRAINT "file_tag_relations_file_id_files_id_fk" TO "file_tag_mapping_file_id_files_id_fk";--> statement-breakpoint
ALTER TABLE "file_tag_mapping" RENAME CONSTRAINT "file_tag_relations_tag_id_file_tags_id_fk" TO "file_tag_mapping_tag_id_file_tags_id_fk";--> statement-breakpoint
DROP INDEX "file_tag_relations_file_tag_idx";--> statement-breakpoint
CREATE INDEX "file_tag_mapping_file_tag_idx" ON "file_tag_mapping" USING btree ("file_id","tag_id");--> statement-breakpoint

-- ============================================
-- Rename(保資料):files.storage_category_id → folder_id
-- + 更新 FK 指向新表名 / 重建 index
-- ============================================
ALTER TABLE "files" DROP CONSTRAINT "files_storage_category_id_file_storage_categories_id_fk";--> statement-breakpoint
DROP INDEX "files_storage_category_id_idx";--> statement-breakpoint
ALTER TABLE "files" RENAME COLUMN "storage_category_id" TO "folder_id";--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_file_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."file_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "files_folder_id_idx" ON "files" USING btree ("folder_id");--> statement-breakpoint

-- ============================================
-- 新增欄位(Phase B:assets-foundation)
-- ============================================
ALTER TABLE "files" ADD COLUMN "tenant_id" varchar(50);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "hash" varchar(64);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "scan_status" varchar(20) DEFAULT 'clean' NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "gps_lat" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "gps_lng" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "captured_at" timestamp;--> statement-breakpoint

-- Dedup index(per-tenant 同 hash 找唯一)
CREATE INDEX "files_dedup_idx" ON "files" USING btree ("tenant_id","hash");
