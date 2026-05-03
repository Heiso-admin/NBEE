#!/usr/bin/env bun
/**
 * pull-env：跑 `vercel env pull` 然後自動清掉本機 dev 用不到的東西。
 *
 * Usage:
 *   bun scripts/pull-env.ts cms                       # 預設 production
 *   bun scripts/pull-env.ts cms --environment=preview
 *
 * 砍掉兩類：
 *
 * 1) Vercel 自動注入 / team-level noise（本機 dev 用不到）：
 *    - VERCEL          (VERCEL, VERCEL_ENV, VERCEL_URL, VERCEL_OIDC_TOKEN, VERCEL_GIT_*, ...)
 *    - TURBO_          (TURBO_CACHE, TURBO_REMOTE_ONLY, ...)
 *    - NX_             (NX_DAEMON, ...)
 *
 * 2) 已 audit 確認的死變數（nbee + hive 0 處 process.env 引用）：
 *    - HIVE_DATABASE_URL    舊架構殘留，目前 code 沒人讀（commit 91405a6 拔光）
 *    - VERCEL_API_TOKEN     只 hive service 該有
 *    - VERCEL_PROJECT_ID    CMS 不需要 self-introspect
 *    - GITHUB_ACCESS_TOKEN  完全死碼（lib/github/index.ts 沒 caller）
 *    - APP_MODE             死變數，code 只判 `=== "core"` 設 "apps" 沒作用
 *
 *    上面這些在 Vercel project 上應該也要砍掉（見 openspec/changes/infra-vercel-env-cleanup/
 *    + core-app-mode-removal/），在那之前本機先清乾淨。
 */
import { $ } from "bun";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const NOISE_PREFIXES = ["VERCEL", "TURBO_", "NX_"];

const DEAD_VARS = new Set([
  "HIVE_DATABASE_URL",
  "VERCEL_API_TOKEN",
  "VERCEL_PROJECT_ID",
  "GITHUB_ACCESS_TOKEN",
  "APP_MODE",
]);

function isNoiseKey(key: string): boolean {
  return NOISE_PREFIXES.some((p) => key === p || key.startsWith(p));
}

function isDeadKey(key: string): boolean {
  return DEAD_VARS.has(key);
}

const app = process.argv[2];
if (!app) {
  console.error("Usage: bun scripts/pull-env.ts <app> [--environment=preview|production|development]");
  console.error("Example: bun scripts/pull-env.ts cms");
  process.exit(1);
}

const env = process.argv.find((a) => a.startsWith("--environment="))?.split("=")[1] ?? "production";
const appDir = resolve(import.meta.dir, "..", "apps", app);
const envFile = resolve(appDir, ".env.local");

if (!existsSync(appDir)) {
  console.error(`❌ App not found: apps/${app}`);
  process.exit(1);
}

// 1) 跑 vercel env pull
console.log(`→ Pulling ${env} env for apps/${app}...`);
await $`vercel env pull .env.local --environment=${env} --yes`.cwd(appDir).quiet();

// 2) 讀檔、過濾、寫回
const original = readFileSync(envFile, "utf-8");
const lines = original.split("\n");

let removedNoise = 0;
let removedDead = 0;
const deadVarsFound: string[] = [];

const cleaned = lines
  .filter((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return true; // 保留空白 / 註解
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (!match) return true; // 非 KEY=VALUE 格式保留
    const key = match[1];
    // 先檢查 dead vars（避免 VERCEL_API_TOKEN / VERCEL_PROJECT_ID 被當成 VERCEL noise）
    if (isDeadKey(key)) {
      removedDead++;
      deadVarsFound.push(key);
      return false;
    }
    if (isNoiseKey(key)) {
      removedNoise++;
      return false;
    }
    return true;
  })
  .join("\n");

writeFileSync(envFile, cleaned);

const kept = cleaned.split("\n").filter((l) => /^[A-Z_]/.test(l.trim())).length;

console.log(`✓ ${envFile}`);
console.log(`  - removed ${removedNoise} runtime noise (VERCEL_* / TURBO_* / NX_*)`);
console.log(`  - removed ${removedDead} dead vars: ${deadVarsFound.join(", ") || "none"}`);
console.log(`  - kept ${kept} live vars`);

if (removedDead > 0) {
  console.log(``);
  console.log(`⚠️ Dead vars 也存在於 Vercel project，建議跑 cleanup change：`);
  console.log(`   - openspec/changes/infra-vercel-env-cleanup/`);
  console.log(`   - openspec/changes/core-app-mode-removal/`);
}
