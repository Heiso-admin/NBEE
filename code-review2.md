# 代碼審查 — NBEE Monorepo

> 日期: 2026-05-04
> 範圍: `apps/cms`、`packages/core`（post-refactor 現況）

## 摘要

- **整潔問題**：12 項
- **效能問題**：8 項
- **總計 finding**：20 項（重大 6、中等 9、輕微 5）

> 本輪聚焦 refactor 後的殘留與新增的 schema/命名衝突。所有 finding 對應到具體 line，可直接落地修。

---

## 🔴 重大

### #1. `proxy.ts` 不是 Next.js middleware — auth/redirect 從未執行

- 檔案：`apps/cms/proxy.ts`、`packages/core/proxy.ts`
- 類別：整潔（可能影響 runtime 安全）
- 問題：Next.js 只認 `middleware.ts` 在 app/src root；`proxy.ts` 不是 convention 檔。兩個 app 都沒有 `middleware.ts`，也沒有 import / config 把 `proxy.ts` 接上去。意思是：
  - 未登入沒有自動 redirect 到 `/login`
  - `x-current-path` / `x-current-pathname` header 沒被注入（下游 layout 拿不到）
  - newsletter `send.service.ts:197` 讀的 `x-tenant-id` 也是 middleware 注入的，會永遠 `undefined`
- 修法：rename `proxy.ts` → `middleware.ts`（或在 `next.config.ts` 設定）。順便 README L140 也要更新。

### #2. `lib/github`、`lib/vercel` 在 module load 階段 `await settings()` + throw

- 檔案：
  - `packages/core/lib/github/index.ts:4-7`
  - `packages/core/lib/vercel/index.ts:3-6`
- 類別：整潔 + 效能
- 問題：top-level `await settings()` + `throw new Error("XXX is required")`。任何 import 這兩個 module 的檔案都會在 build/boot 階段觸發 DB query；缺 token 時整個 app 啟動失敗。`GITHUB_TOKEN` 現在規劃從 `dev-center/key` 讀（`github.access_token`），不在 `system` group。
- 修法：改成 lazy init，在實際呼叫 export function 時才讀 key（用 `getKey("github.access_token", "GITHUB_TOKEN")`）。

### #3. 多處 Drizzle insert 使用不存在欄位 `userId`（NOT NULL 違反）

- 檔案：
  - `apps/cms/modules/features/article/_server/post.service.ts:360`（`articlePosts`）
  - `apps/cms/modules/api/modules/pages/pages.service.ts:759, 853, 918, 944`（`pageCategories` / `posts` / `urlRedirects`）
  - `apps/cms/modules/features/newsletter/_server/send.service.ts:352`（`newsletterLog`）
  - `apps/cms/app/admin-portal/(dashboard)/cms/pages/_server/templates.service.ts:45`（`pageTemplates`）
  - `apps/cms/modules/import-docs/_server/import.service.ts:232, 462, 515, 680, 725, 889, 898, 918, 952, 1013`
- 類別：整潔（runtime crash）
- 問題：schema 已經統一 `accountId`，但 insert 還用 `userId`；Drizzle 對未知 key 是 silent ignore，於是 `accountId` 會是 `undefined` 觸發 NOT NULL 約束。
- 修法：全部改 `accountId: userId`。article post.service / 跟 factory 一起做（已在原 #1 / #4 列出但範圍更廣）。

### #4. Article `getPost` / `getPostList` 的 SELECT alias 與 consumer 讀的欄位對不上

- 檔案：`apps/cms/modules/features/article/_server/post.service.ts:94, 153, 199, 245`
- 類別：整潔（runtime undefined）
- 問題：
  - L94 `userId: articlePosts.accountId` 命名為 `userId`，L153 讀 `p.accountId` → 永遠 `undefined`
  - L199 select `userId: accounts.id`，L245 讀 `base.accountId!` → 永遠 `undefined`，`!` 會把 null 強制變 string 然後寫到 `user.id`
- 修法：alias 全部去掉，下游直接讀真實欄位。同 changelog #3 / #4 已知，但 article service 還沒修。

### #5. `import-docs/_server/import.service.ts` 用 `ctx.accountId`，但 `ImportContext` 只有 `userId`

- 檔案：`apps/cms/modules/import-docs/_server/import.service.ts:19-22, 232, 462, 515, 680, 725`
- 類別：整潔（runtime undefined）
- 問題：`interface ImportContext { db, userId }`，但程式碼到處讀 `ctx.accountId`（不存在），最終 insert 變 `userId: undefined`，又落到 schema `account_id NOT NULL`，整個 import 流程必爆。
- 修法：interface 改成 `accountId`，所有 `ctx.userId` / `userId,` insert 一起改。

### #6. `tags.service.ts` 用 `id: name` — UPDATE 會把 row id 改掉

- 檔案：`apps/cms/app/admin-portal/(dashboard)/cms/pages/_server/tag.service.ts:45, 55`
- 類別：整潔（資料毀損）
- 問題：
  - L45 `addTag` insert：`{ id: name, ... }` — 用使用者輸入字串當 PK，撞 unique 就 throw
  - L55 `updateTag` set：`{ id: name, name, ... }` — 改 name 會連 PK 一起改，下游 reference 全斷
- 修法：用 `generateId()`，name 不當 id。

---

## 🟡 中等

### #7. Provider value 物件每次 render 都新建（潛在 re-render 問題）

- 檔案：
  - `packages/core/providers/site.tsx:63`
  - `packages/core/providers/settings.tsx:49`
  - `packages/core/providers/account.tsx:90-98`
- 類別：效能
- 問題：`<Provider value={{ ... }}>` 每次都 new object，所有 consumer 跟著重 render。`AccountProvider` 包整個 dashboard，`SiteProvider` 也是；影響面大。
- 修法：`useMemo` 包 value（雖然 `next.config.ts` 開了 `reactCompiler: true`，理論上可以自動 memoize，但 React 19 的 RC 對 context value 不一定 100% 涵蓋，手動加比較穩）。

### #8. `SettingProvider` 用一個 hook 包整個 app

- 檔案：`packages/core/providers/settings.tsx`、`packages/core/providers/ClientBody.tsx:32`
- 類別：效能 + 整潔
- 問題：
  - `SettingProvider` 在 client 端 fetch 全 system settings；唯一 consumer 是 `permission/team/_components/member-actions.tsx:53` 取 `BASE_HOST`
  - L14 `const SiteContext = createContext<SettingsContextType>(...)` — 命名應該是 `SettingsContext`（跟 `SiteProvider` 撞名，誤導）
  - 每次頁面載入打一次 server action 讀 system settings → 浪費
- 修法：把 `BASE_HOST` 改用既有 `useSite()` 拿（`basic.base_url`），或從 server-rendered prop 傳下去；移除整個 `SettingProvider`（包含 context 命名 bug）。

### #9. `ResendProvider._client` 永久 cache，DB key 換了不會更新

- 檔案：`packages/core/lib/email/resend.provider.ts:19, 21-32`
- 類別：效能（行為 bug）
- 問題：`_client` cache 在 instance；`getEmailProvider()` 又是 process-singleton（`lib/email/index.ts:19-26`）。一旦初始化用過某個 API key，後續 dev-center/key 改 key 不會生效，必須重啟 server。
- 修法：每次 `send()` 都 `await getKey()` 拿最新 key（getKey 走 DB，cost 不算高），或者改成「key 變更時主動 invalidate」。

### #10. `getPortalSetting` / `getWebSetting` / `getGeneralSettings` / `getSystemSettings` — 4 個函式做幾乎一樣的事

- 檔案：
  - `packages/core/server/site.service.ts:6` — `getPortalSetting`（group='site'）
  - `packages/core/modules/api/modules/site/site.service.ts:3` — `getPortalSetting`（同名，同 query）
  - `apps/cms/modules/api/modules/site/site.service.ts:4` — `getWebSetting`（group='site'）
  - `packages/core/modules/dev-center/portal-setting/portal-setting.service.ts:8` — `getGeneralSettings`（group='system'）
  - `packages/core/server/services/system/setting.ts:6` — `getSystemSettings`（group='system'）
- 類別：整潔
- 問題：相同 query 邏輯散在 5 個檔案，命名混亂（site / portal / general / system 互相交錯），且 changelog #14 講「拆 PortalSetting / WebSetting」是概念分層，但實作沒分。
- 修法：core 留一個 `getSettingsByGroup(group: string)`，其他全部砍掉（或 thin wrap）。

### #11. `getPortalSetting()` 沒 cache，在 layout / 每封 email / 每次 newsletter 都重打 DB

- 檔案：
  - `apps/cms/app/layout.tsx:42`、`packages/core/app/layout.tsx:36`（root layout）
  - `packages/core/lib/email/index.ts:95, 132, 162`（每封 transactional email）
  - `apps/cms/modules/features/newsletter/_server/send.service.ts:226`（每次 send）
  - `packages/core/providers/site.tsx:41`（client fetch）
- 類別：效能
- 問題：layout 標 `dynamic = "force-dynamic"`，每個 request 都重新跑一次 `getPortalSetting()`。settings 改動頻率低（人工觸發），完全可以 `unstable_cache` + `revalidateTag('site-settings')`。
- 修法：包一層 `cachedGetPortalSetting()`（tag: `site-settings`），save 時 `revalidateTag`。

### #12. `userId` schema 改 `accountId` 後，多處 in-memory 物件還叫 `userId` / `userName`

- 檔案：
  - `apps/cms/app/admin-portal/(dashboard)/cms/pages/_server/post.service.ts:78, 137, 199, 220` （`userId` / `userName` / `userAvatar` 為 select alias）
  - `apps/cms/app/admin-portal/(dashboard)/cms/pages/_server/templates.service.ts:11-19, 91, 177` （`TemplateItem.userId` 對應 DB `accountId`）
  - `apps/cms/modules/api/modules/articles/articles.service.ts:78-79, 121-122, 209-210, 248-249, 281-282`（`userName` / `userAvatar`）
- 類別：整潔
- 問題：select alias 跟 schema column 字串不一致，consumer 看到 `userId` 以為對應到 schema，混淆 + 容易 typo（已造成 #4）。
- 修法：alias 全砍，consumer 改讀 `accountId` / `accounts.name`；改完跟 factory 重構一起做。

### #13. `post.service.ts` 兩份（article / pages）共 1300+ 行近似重複（已知，但加上現況補充）

- 檔案：`apps/cms/modules/features/article/_server/post.service.ts`（627 行）+ `apps/cms/app/admin-portal/(dashboard)/cms/pages/_server/post.service.ts`（675 行）
- 類別：整潔
- 問題：除了 schema 不同（`articlePosts` vs `posts` + `articleCategories` vs `pageCategories`），其他 function 結構 95% 重疊。article 版的 SEO 欄位多 5 個（`seoTitle/Description/Image/Keywords/canonicalUrl`），這是抽 factory 時的真實 axis。
- 修法：`createPostService<TTable, TCategoryTable>(opts)` factory（已在 changelog 待辦）。修的時候順便把 #3 / #4 一起處理。

### #14. `web-settings/page.tsx` 909 行做太多事

- 檔案：`apps/cms/app/admin-portal/(dashboard)/cms/web-settings/page.tsx`
- 類別：整潔
- 問題：一個 client component 塞了 schema 定義、defaultValues、form 渲染（5 個 Card section）、submit、SEO sub-component 整合。
- 修法：拆成 `_components/{basic,branding,assets,social,seo,sitemap,deployment}-card.tsx`（每個約 100 行），page.tsx 只剩 form 組裝。

### #15. `WebSetting` type 從 client `page.tsx` 反向被 server `setting.service.ts` import

- 檔案：
  - `apps/cms/app/admin-portal/(dashboard)/settings/_server/setting.service.ts:6` 引用
  - `apps/cms/app/admin-portal/(dashboard)/cms/web-settings/page.tsx:122` 定義
- 類別：整潔
- 問題：server 檔 import client 檔的 type；雖然 type-only import 會被 erase，但結構上是反向依賴（service 依賴 page）。
- 修法：把 `WebSetting` type 抽到 `_types/web-setting.ts`，雙方各自 import。

---

## 🟢 輕微

### #16. 多處 `console.log` debug 殘留（changelog 標記已清，但實際未清）

- 檔案（共 21 個檔案）：
  - `apps/cms/modules/api/modules/faq/faq.service.ts:61` — `console.log("topic: ", topic)`
  - `apps/cms/app/admin-portal/(dashboard)/cms/navigation/_server/navigations.service.ts:77` — `console.log("revalidateUri: ", ...)`
  - `apps/cms/app/admin-portal/(dashboard)/cms/navigation/_components/navigation-menu-edit.tsx:347` — `console.log("updates:", ...)`
  - `apps/cms/modules/member/join/_components/member-join.tsx:16`、`packages/core/modules/auth/join/_components/member-join.tsx:94`、`packages/core/modules/dev-center/system/api-keys/_components/edit-api-key-dialog.tsx:88` 等
- 類別：整潔
- 修法：批次移除（grep `console\.log` 過一遍，留下 `console.error` / `console.warn`）。

### #17. `import * as schema` 還剩 4 處（changelog 說已清 29 處）

- 檔案：
  - `apps/cms/modules/import-docs/_server/import.service.ts:11`
  - `apps/cms/modules/api/modules/products/categories.route.ts:4`
  - `apps/cms/modules/api/modules/products/products.route.ts:4`
  - `apps/cms/modules/api/modules/categories.route.ts:5`
- 類別：整潔
- 修法：改成 named import。

### #18. `import { type CmsDb }` 但沒用 — 大量 dead import

- 檔案（共 ~30 處）：所有 `apps/cms/modules/**` 和 `app/admin-portal/**` 的 `_server/*.ts`、`*.route.ts` 都有 `import { cmsDb as db, type CmsDb } from "@/lib/db"`，但只有 3 個檔案（`pages.service.ts`, `import.service.ts`, `newsletter/send.service.ts`）真的用 `CmsDb`。
- 類別：整潔
- 修法：把沒用到的 `type CmsDb` 從 import 拿掉。

### #19. `findMenuItemsInBulkByLinkIds` 連線預熱 + LIKE 全表掃

- 檔案：`apps/cms/app/admin-portal/(dashboard)/cms/navigation/_server/navigation-menus.service.ts:200-207`
- 類別：效能
- 問題：
  - L200 `await db.execute(sql\`SELECT 1\`)` 預熱：`postgres-js` 會自動處理冷啟動，這個 query 是 cargo-cult，每次呼叫都多一個 round-trip
  - L201-203 多個 `like(link, %id%)` OR 起來：`%xxx%` 不能用 index，等於全表掃；而且 link 還可能是 `/page/{id}` 或 `{id}` 兩種格式
- 修法：拿掉預熱；link 格式統一 + 拆成 `link_post_id` 額外欄位（normalized）走 `inArray`，避免 LIKE。

### #20. `dev-center/key` UI 缺 OpenRouter 欄位，但 service 期望讀

- 檔案：
  - `packages/core/modules/dev-center/system/key/page.tsx:25-49`（form 只有 openai / github / resend）
  - `packages/core/modules/dev-center/system/_server/key.service.ts:8-13`（`KeysShape` 包含 openrouter）
  - `apps/cms/modules/features/newsletter/_server/subject-ai.service.ts:47`（讀 `openrouter.api_key`）
- 類別：整潔
- 問題：使用者沒辦法從 UI 設定 OpenRouter API Key，只能 fallback env。前後端 schema 不一致。
- 修法：UI 補一張 OpenRouter card；form schema 加上 `openrouter.api_key`。

---

## 跨檔模式

### A. `"use server"` + `export interface/type` 普及但 risky（已知）

15+ 個檔案是 `"use server"` 同時 export type/interface。TypeScript 會 erase，目前 build 不爆，但 Next.js 文件明寫只能 export async function；任何 next 版本變動可能踩雷。維持原計畫：把 type 抽到 `*.types.ts`（搭 factory 重構一起做）。

### B. Sequential await 該 `Promise.all`

明顯可平行化的點：

| 檔案 | line | 說明 |
|------|------|------|
| `packages/core/lib/email/index.ts` | 95-96, 132-133, 162-163 | `getPortalSetting()` + `settings()` |
| `apps/cms/modules/api/modules/articles/articles.service.ts` | 304, 328 | prev / next 兩查 |
| `apps/cms/modules/api/modules/pages/pages.service.ts` | 144, 164 | data / count 兩查 |
| `apps/cms/app/admin-portal/(dashboard)/cms/pages/_server/tag.service.ts` | 18, 31 | data / count |
| `packages/core/modules/dev-center/system/api-keys/_server/api-keys.service.ts` | 38, 44 | count / data |
| `packages/core/app/layout.tsx` | 35-36、`apps/cms/app/layout.tsx` 40-42 | `getLocale()` + `getPortalSetting()` |

### C. Soft-delete 沒有 partial index

所有大表（`posts`, `articlePosts`, `pageCategories`, `subscribers`, `files`, `pageTemplates`...）都有 `deleted_at` 但沒任何 index；每次 query 都帶 `WHERE deleted_at IS NULL`，全表掃。

建議：對熱表加 `CREATE INDEX ON xxx (id) WHERE deleted_at IS NULL`（或者把 `deleted_at` 加進複合 index 開頭）。

### D. Schema 一致性

| 表 | slug 是否 unique | deletedAt 是否有 index | accountId index | 備註 |
|----|----|----|----|----|
| `posts` (pages) | ❌（只有普通 index） | ❌ | ✅ | |
| `articlePosts` | ❌ | ❌ | ✅ | |
| `articleCategories` | ✅ unique | ❌ | ✅ | |
| `pageCategories` | ❌ | ❌ | ✅ | 跟 articleCategories 不一致 |
| `tags` | ✅ unique | ❌ | ✅ | |
| `urlRedirects` | ✅ unique + 又一個 index | ❌ | n/a | unique 之外又加 `source_idx`，重複 |

### E. 跨層 import 反向依賴

- `apps/cms/modules/seo/_components/sitemap-manager.tsx:25` import `@/app/admin-portal/(dashboard)/settings/_server/setting.service`：modules 層應該是 lower-level，不該依賴 app routes。
- `apps/cms/app/admin-portal/(dashboard)/settings/_server/setting.service.ts:6` import `WebSetting` from sibling client `page.tsx`（同 #15）。
- `apps/cms/app/admin-portal/(dashboard)/cms/navigation/_components/navigation-menu-edit.tsx:25-28` import `pages/_server/post.service` + `pages/_server/category.service`：feature 之間橫向耦合，可以但要意識到。

---

## ✅ Changelog（保留）

### Phase 1：低風險清理
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

### URL / 命名重構
- ✅ `/dashboard` → `/admin-portal`（dashboard 實際是 admin portal，跟 `portal-setting` 邏輯對應）
- ✅ `apps/cms/app/dashboard/` → `apps/cms/app/admin-portal/`
- ✅ `packages/core/app/dashboard/` → `packages/core/app/admin-portal/`
- ✅ `packages/core/modules/dashboard/` → `packages/core/modules/admin-portal/`
- ✅ 80+ 檔案中的 `/dashboard` URL 引用全部替換

---

## 📋 Checklist

### 🔴 重大（先做這些，會 crash / 行為錯）

- [ ] **#1** rename `proxy.ts` → `middleware.ts`（兩個 app 各一份）+ 更新 README
- [ ] **#2** `lib/github` / `lib/vercel` 改 lazy init，不要 module-load 階段 throw
- [ ] **#3** 全部 `userId,` insert → `accountId: userId`（grep 一次性掃）
- [ ] **#4** Article post.service alias bug（`userId/userName/userAvatar`）
- [ ] **#5** import.service.ts `ImportContext.userId` → `accountId`，`ctx.accountId` 等也跟著改
- [ ] **#6** tags.service `id: name` 兩處改用 `generateId()`

### 🟡 中等

- [ ] **#7** Provider value `useMemo`（site / settings / account）
- [ ] **#8** 砍 `SettingProvider`，`BASE_HOST` 改用 `useSite()` 或 server prop
- [ ] **#9** ResendProvider 不要 cache `_client`（每次重建或 invalidate）
- [ ] **#10** 統一 settings 讀取，刪除 4 個重複 helper
- [ ] **#11** `getPortalSetting` 加 `unstable_cache`
- [ ] **#12** 跟 #4 一起，alias 全砍
- [ ] **#13** post.service factory（跟 #3 / #4 一次做）
- [ ] **#14** web-settings/page.tsx 拆 sub-components
- [ ] **#15** `WebSetting` type 抽到 `_types/`

### 🟢 輕微

- [ ] **#16** 21 個檔案的 `console.log` 批次清掉
- [ ] **#17** 4 個 `import * as schema` 改 named import
- [ ] **#18** ~30 處 dead `type CmsDb` import 拿掉
- [ ] **#19** navigation-menus 拿掉預熱 query；長期改 link 結構避免 LIKE
- [ ] **#20** dev-center/key UI 補 OpenRouter 欄位

### 跨檔模式

- [ ] **B** sequential await 6 處改 `Promise.all`
- [ ] **C** 熱表加 `WHERE deleted_at IS NULL` partial index（migration）
- [ ] **D** schema slug unique / index 一致性（articleCategories / pageCategories / posts / urlRedirects）
- [ ] **E** seo / setting.service / web-settings 反向依賴整理
