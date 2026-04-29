# Fix Backlog (Cosmetic / Non-Functional)

不影響功能、純粹語意 / 命名 / 整潔度的議題。**等 [fix.md](/Users/josh/code/nbee/fix.md) 的優先項目都做完再回頭看**。

每筆寫得能讓接手的人知道：是什麼問題、影響什麼、建議怎麼修。

---

## #1 — `APP_MODE` env var 名實不符，且行為冗餘

### 現況

Vercel `nbee` project 的 production env 設了 `APP_MODE="apps"`，但 code 裡完全沒用到 `"apps"` 這個值。

兩個 callsite 都只判斷 `=== "core"`：

- [packages/core/lib/utils/tenant.ts:11](/Users/josh/code/nbee/packages/core/lib/utils/tenant.ts#L11)
  ```ts
  export const APP_MODE = "core";   // 常數固定
  if (process.env.APP_MODE === APP_MODE) return APP_MODE;
  ```
- [packages/core/modules/system/provisioning.ts:87](/Users/josh/code/nbee/packages/core/modules/system/provisioning.ts#L87)
  ```ts
  if (modules.includes('role') || process.env.APP_MODE === "core") { ... }
  ```

→ 不論值是 `"apps"`、`"cms"`、`"foo"`，行為**完全一致**（一律走「非 core」分支）。`APP_MODE="apps"` 在 Vercel 上**既沒語意也沒行為**。

### 為什麼這是問題

1. **誤導**：新人看到 env 會以為「apps」是某個 valid state，實際上 code 從沒辨識它
2. **語意錯**：這是 CMS app（`apps/cms/`），值該是 `"cms"` 才對
3. **架構味道**：env-driven 區分 app 身分本身就尷尬 —— `apps/cms/` 的目錄存在已經 implicit 告訴系統「這是 cms」，不該靠 runtime env 再宣告一次
4. **冗餘 special case**：core 為了支援「我是 admin」做了一條 fallback，但目前並沒有實際的 admin app 部署（沒有 `apps/admin/` 之類的 deployment target 在用 `APP_MODE="core"`）

### 建議修法（三選一）

#### A. 砍 APP_MODE，core 不再分模式（最乾淨）

兩個 callsite 重構：

```ts
// tenant.ts
export function getTenantId(): string | undefined {
  return process.env.TENANT_ID;
}

// provisioning.ts:87
if (modules.includes('role')) { seedRoles() }
```

→ -1 個 env var、-2 條 special case
→ 缺點：未來真要做 core admin app 要重補 mode 判斷
→ 優點：每個 deployment 邏輯一致，跟 platform-refactor.md Task 1「per-tenant env 契約」方向一致

#### B. 保留 var，rename + 補 enum 嚴格化

```ts
type AppMode = "core" | "cms";

export function getTenantId(): string | undefined {
  switch (process.env.APP_MODE as AppMode) {
    case "core": return "core";
    case "cms":  return process.env.TENANT_ID;  // 沒 TENANT_ID 就 undefined
    default:     throw new Error("APP_MODE must be 'core' or 'cms'");
  }
}
```

並把 Vercel `nbee` project 的 `APP_MODE` 從 `"apps"` 改成 `"cms"`。

→ 優點：保留 admin/cms 區分能力
→ 缺點：env var 沒拿掉，每個 tenant project 都要設

#### C. App 自己 hardcode，不從 env 讀

`apps/cms/next.config.ts` 加：
```ts
env: { APP_MODE: 'cms' }
```

build 時 inline 進 bundle，Vercel env 不用設。

→ 優點：app 身分由所在目錄決定，符合「目錄 = identity」原則
→ 缺點：core 內部仍有 mode 判斷，沒徹底解決

### 推薦

**A**，理由：
- 沒有實際的 core admin app 要部署
- platform-refactor.md Task 1 正在朝「砍 special case」方向走
- 之後若有 core admin，那就是 `apps/admin/` 獨立目錄，自帶獨立 env，不需要這個 fallback

### 處理時機

- 短期（不修 code）：把 Vercel `nbee` project 的 `APP_MODE` 從 `"apps"` 改成 `"cms"` —— 至少讓值有正確 semantic（雖然 code 還是不看）
- 中期（隨 [platform-refactor.md](/Users/josh/code/nbee-doc/task/active/platform-refactor.md) Task 1 一起做）：走 A，整個拔掉

### 相關檔案

- [.env.local](/Users/josh/code/nbee/apps/cms/.env.local) — 目前值 `"apps"`
- [.env.example](/Users/josh/code/nbee/apps/cms/.env.example) — template 也是 `"cms"`，所以 template 跟 production env 不一致
- [packages/core/lib/utils/tenant.ts](/Users/josh/code/nbee/packages/core/lib/utils/tenant.ts)
- [packages/core/modules/system/provisioning.ts:87](/Users/josh/code/nbee/packages/core/modules/system/provisioning.ts#L87)

---

## #2 — `OPENAI_API_KEY` env fallback 設計不明顯，容易誤解

### 現況

兩個 AI route 用同樣 pattern：

- [packages/core/modules/api/ai/copilot/route.ts:14](/Users/josh/code/nbee/packages/core/modules/api/ai/copilot/route.ts#L14)
- [packages/core/modules/api/ai/command/route.ts:136](/Users/josh/code/nbee/packages/core/modules/api/ai/command/route.ts#L136)

```ts
const { apiKey: key, ... } = await req.json();
const apiKey = key || process.env.OPENAI_API_KEY;
```

→ 設計是 **Plate editor BYO（Bring-Your-Own-Key）**：客戶端送 apiKey 在 request body，env 只是「dev 本機沒帶 key 時的 fallback」。

Vercel `nbee` project env **沒設 `OPENAI_API_KEY`**，跟此設計一致 ✅

### 為什麼算問題

純看 code 看不出「這是 BYO 設計」：
- 沒 env / 沒帶 key 都會 401，error message 一樣含糊
- 接手工程師可能誤以為「production 該設 `OPENAI_API_KEY` 但忘了」→ 去 Vercel 補 env → 跟原始設計衝突
- 跟 server 主動呼叫 LLM 的 `OPENROUTER_API_KEY`（也存在）容易混淆

### 跟 `OPENROUTER_API_KEY` 的關係

兩個 LLM env var 並存，用途不同，**不該合併**：

| Var | 來源 | 設計 | Vercel 上設嗎 |
|---|---|---|---|
| `OPENAI_API_KEY` | Plate editor BYO（client → server） | env 只是 dev fallback | ❌ 不該設（production BYO only）|
| `OPENROUTER_API_KEY` | Server 主動呼叫 LLM（自動生成文章 / SEO 等） | 真正的 server-side key | ✅ 該設 |

### 建議修法（任一即可）

#### A. 加註解（最低成本）

兩個 route 的 fallback 那行上方加：

```ts
// ⚠️ Plate editor 預設 BYO（Bring-Your-Own-Key），客戶端 request 帶 apiKey。
//    env fallback 只給 local dev 方便，production 不該設 OPENAI_API_KEY。
const apiKey = key || process.env.OPENAI_API_KEY;
```

→ 5 分鐘，0 風險，避免接手者誤刪 / 誤補 env。

#### B. 移除 fallback，強制 BYO

```ts
const apiKey = key;
if (!apiKey) {
  return NextResponse.json(
    { error: "Missing API key (BYO mode: please send `apiKey` in request body)" },
    { status: 401 },
  );
}
```

→ 設計更嚴格，error message 清楚。但 dev 本機要 BYO 麻煩。

### 推薦

**A**（加註解）—— 不動行為，dev 體驗不變，僅靠註解防誤解。實質工作量 5 分鐘。

### 處理時機

- 跟 fix.md #1 一起做（修齊 env 那波路過順手），或單獨 1 個小 PR 都可以
- 順便確認 `.env.example` 沒列 `OPENAI_API_KEY`（如果有，加註解寫「optional, dev fallback only」或乾脆刪掉）

### 相關檔案

- [packages/core/modules/api/ai/copilot/route.ts:14](/Users/josh/code/nbee/packages/core/modules/api/ai/copilot/route.ts#L14)
- [packages/core/modules/api/ai/command/route.ts:136](/Users/josh/code/nbee/packages/core/modules/api/ai/command/route.ts#L136)
- [apps/cms/.env.example](/Users/josh/code/nbee/apps/cms/.env.example) — 確認沒列 `OPENAI_API_KEY`
