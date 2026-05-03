-- ============================================
-- Rename user_id to account_id for page-related tables
-- ============================================

-- page_categories: drop old index, rename column, create new index
DROP INDEX "page_categories_user_id_idx";--> statement-breakpoint
ALTER TABLE "page_categories" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
CREATE INDEX "page_categories_account_id_idx" ON "page_categories" USING btree ("account_id");--> statement-breakpoint

-- page_templates: drop old index, rename column, create new index
DROP INDEX "page_templates_user_id_idx";--> statement-breakpoint
ALTER TABLE "page_templates" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
CREATE INDEX "page_templates_account_id_idx" ON "page_templates" USING btree ("account_id");--> statement-breakpoint

-- pages (posts table): drop old index, rename column, create new index
DROP INDEX "pages_user_id_idx";--> statement-breakpoint
ALTER TABLE "pages" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
CREATE INDEX "pages_account_id_idx" ON "pages" USING btree ("account_id");--> statement-breakpoint

-- tags: drop old index, rename column, create new index
DROP INDEX "tags_user_id_idx";--> statement-breakpoint
ALTER TABLE "tags" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
CREATE INDEX "tags_account_id_idx" ON "tags" USING btree ("account_id");--> statement-breakpoint

-- navigations: just rename column (no existing user_id index to drop)
ALTER TABLE "navigations" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
