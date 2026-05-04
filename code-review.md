# 代碼審查與清理計畫 — NBEE Monorepo

> 日期：2026-05-04
> 範圍：`apps/cms`、`packages/core`

## 進度

```
✅ 已修:    25 項
⏳ 待修:    8 項
總進度:    ████████████████▒▒▒▒  25/33  76%
```

---

## 🔴 待修：高嚴重度

### #2 `"use server"` 檔案 export 非 async 值
- **檔案**（14 處）：article/pages post.service、newsletter 一系列、`packages/core/server/user.service.ts:12`（runtime crash 風險）等
- **問題**：Next.js 要求 `"use server"` 檔只能 export async function。type / interface 會被 erase 沒事，但 `const`、同步 re-export 是地雷。
- **修法**：把 `interface`/`type`/`const` 搬到旁邊的 `*.types.ts`。

### #3 Drizzle SELECT alias 不匹配（跟 factory 一起修）
- **檔案**：`apps/cms/modules/features/article/_server/post.service.ts:95, 154`
- **問題**：alias 是 `userId` 但 consumer 讀 `p.accountId`，永遠 undefined。
- **修法**：拿掉 alias 直接讀 `p.accountId`。

### #4 Drizzle insert 用不存在欄位（跟 factory 一起修）
- **檔案**：`apps/cms/modules/features/article/_server/post.service.ts:361`
- **問題**：insert `userId`，但 schema 是 `accountId` → NOT NULL 違反。
- **修法**：改 `accountId: userId`。

### #16 `saveSetting` 是空殼
- **檔案**：`apps/cms/app/dashboard/(dashboard)/settings/_server/setting.service.ts:23, 101`
- **問題**：`async function saveSetting() {}` 是空函數，但被 export — client 呼叫以為存了，silent data loss 風險。
- **修法**：實作或刪掉；至少 `throw "not implemented"`。

---

## 🟡 待修：中嚴重度

### #1 4 個重複的 post.service.ts（factory 重構）
- **檔案**：article/pages/navigation 三份，~1,300 行重複
- **修法**：抽 `createPostService<TTable>(table, options)` factory

### #11 importContent N+1 query
- **檔案**：`apps/cms/modules/api/modules/pages/pages.service.ts:803-915`
- **修法**：~~已修為 inArray + Map~~ ✅（剩餘相關 service 待 audit）



---

## 🟢 待修：輕微


### #23 `as any` for `updatedAt`
- **檔案**：`apps/cms/modules/features/article/_server/post.service.ts:488-489`
- **修法**：跟 factory 一起整理。

### #25 `try { revalidatePath } catch {}` cargo-cult
- **檔案**：post.service 系列 6 處
- **修法**：拿掉 try/catch（跟 factory 一起）。

### #26 `as any` 共 275 個
- **集中**：editor 組件（PlateJS generic）、products / setting form
- **修法**：products CRUD 改用 `Partial<typeof products.$inferInsert>`；其他逐步替換。

### #27 AI / Resend key 沒走 `dev-center/key` 模組
- **檔案**：
  - `subject-ai.service.ts:46, 53` — `process.env.OPENROUTER_API_KEY`（直讀 env）
  - `resend.provider.ts` — `await settings()` 拿 `RESEND_API_KEY`（走 settings）
  - `dev-center/.../key/page.tsx` — UI 已有，存到 DB `group='api_keys'`，但**沒人讀** ⚠️
  - `_server/key.service.ts:22-26` — `getKeys()` **沒實作 mapping**（硬編碼空字串 bug）
- **修法**：
  1. 修 `getKeys()` 把 DB 資料真的 map 進回傳物件
  2. consumer 改成 `getKeys()` 讀（fallback 到 env）
  3. 統一 source of truth 在 `dev-center/key`


---

## 🚫 保留（決策後不修）

- **#13 `moduleRegistry`** — 用戶決定保留
- **#10 article/page.tsx redirect 白做工** — ~~已修~~ ✅（移到 changelog）

---

## 📋 待修 Checklist

### 跟 post / article / pages factory 重構一起修
- [ ] #1 抽 Post / Article / Pages factory
- [ ] #3 Drizzle SELECT alias bug
- [ ] #4 Drizzle insert userId → accountId bug
- [ ] #23 `as any` for updatedAt
- [ ] #25 移除 `try { revalidatePath } catch`

### 獨立可做
- [x] #16 刪除 `saveSetting` 空殼 + 刪 `getSettings`（0 consumer）+ 刪 core `setting.service.ts` 整個

### 大範圍重構（依產品方向決定）
- [ ] 砍 Page Builder（依 [discuss.md](discuss.md)）

---

## 📝 Changelog（已完成）

### Phase 1：低風險清理（半天）
- ✅ 刪 `apps/cms/server/post.service.ts`（502 行死代碼）
- ✅ 刪 `apps/cms/server/navigation.service.ts`（278 行錯位）+ Navigation 改用 pages service（reference layer）
- ✅ 修 `notInArray` newsletter dedup bug（避免重複寄信）
- ✅ 修 `urlRedirects.userId` → `accountId`（schema + DB migration）
- ✅ 修 `newsletterLog.userId` TS 欄位
- ✅ 移除 `console.log(item)`
- ✅ 移除 layout.tsx + pages.service.ts 註解掉的代碼
- ✅ 移除 29 個檔案多餘的 `import * as schema`

### Phase 2：中等範圍
- ✅ #7 統一 `formatBytes`（3 → 1 處）
- ✅ #8 統一 `slugify`（合併 simpleSlugify）
- ✅ #9 抽出 `getTenantIdOrThrow` 唯一實作
- ✅ #10 article/page.tsx 的白做工 redirect → early return + Promise.all
- ✅ #11 修 `pages.service.ts` 的 N+1 query
- ✅ #12 修 `getPostsWithMenus` 巢狀 loop O(m×n) → O(m+n)
- ✅ #14 Site Setting 概念清理 — 拆成 `PortalSetting`（core）+ `WebSetting`（cms）
- ✅ #16 刪除 cms `saveSetting` + `getSettings` 死代碼 + 整個 core `setting.service.ts`
- ✅ #17 簡化 `next.config.ts ↔ settings()` 反射循環 — `lib/s3` 直接讀 `process.env`
- ✅ #18 合併 `extractI18nRecursive` + `removeI18nFields` → 一次 walk 的 `splitI18n()`
- ✅ #19 visual-editor `getPreviewUrl` sequential await → `Promise.all`
- ✅ #20 faq.service.ts 簡 → 繁中文轉換
- ✅ #28 刪 core `DASHBOARD_DEFAULT_MENUS` 空殼 + 改用 generic type
- ✅ #2（核心 1 處）`user.service.ts` 同步 re-export 改 async wrapper（避免 build 時 server action wrapper crash）
- ✅ #15 加註解說明雙 schema 是「設計」(寬鬆 type-infer + 嚴格 i18n validate)，不重構（深改風險高）
- ✅ #26 評估後跳過：高頻 `as any` 都是 react-hook-form generic 的已知限制，修了反而麻煩
- ✅ #27 修 `getKeys()` mapping bug + 加 `getKey()` helper + 5 個 consumer 改走 dev-center/key 模組（RESEND / OpenRouter）

### Schema migrations
- ✅ posts / article_categories / pages / navigations / 其他 6 表：`user_id` → `account_id`
- ✅ url_redirects schema + DB column rename

### 內容資料 seed
- ✅ smartsight 32 篇文章 + 3 分類匯入
- ✅ FAQ 4 主題 19 題
- ✅ Navigation 4 群組 20 個 menu items

### 配置整理
- ✅ 統一 `apps/cms/config/setting.ts`（package + storage + email）
- ✅ env 注入由 `next.config.ts` 處理
- ✅ env-check 啟動時警告
- ✅ Logo / Favicon 出廠 fallback + auto-sync 到 cms public
