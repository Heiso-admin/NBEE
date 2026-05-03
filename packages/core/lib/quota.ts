"use server";

import { db } from "@heiso/core/lib/db";
import { files } from "@heiso/core/lib/db/schema";
import { isNull, sql } from "drizzle-orm";

const kDefaultQuotaBytes = 3 * 1024 * 1024 * 1024; // standard tier = 3 GB

/**
 * Tenant quota(總 storage 上限)。
 * 來源:env `TENANT_QUOTA_BYTES`(由 Hive push,assets-foundation §3)。
 * 沒設 → fallback 3 GB(standard tier)。
 */
export async function getTenantQuota(): Promise<number> {
  const v = process.env.TENANT_QUOTA_BYTES;
  if (!v) return kDefaultQuotaBytes;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : kDefaultQuotaBytes;
}

/**
 * 已用 bytes(active files,扣除 soft-deleted)。
 * cell DB 單 tenant。dedup 時只有 1 row 代表該內容,所以 SUM(size) 自動去重。
 */
export async function getUsedBytes(): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${files.size}), 0)` })
    .from(files)
    .where(isNull(files.deletedAt));
  return Number(row?.total ?? 0);
}

/**
 * 檢查 incoming 檔案會不會爆 quota。
 * 上傳前在 server-side 呼叫(client-side 算 hash 之後、發 PUT 之前)。
 */
export async function checkQuota(incomingBytes: number): Promise<{
  allowed: boolean;
  used: number;
  quota: number;
  remaining: number;
}> {
  const [used, quota] = await Promise.all([getUsedBytes(), getTenantQuota()]);
  const remaining = quota - used;
  return {
    allowed: incomingBytes <= remaining,
    used,
    quota,
    remaining,
  };
}
