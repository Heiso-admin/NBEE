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

---

## #3 — XSS 風險：`dangerouslySetInnerHTML` 直接渲染 DB 的 HTML

### 現況

兩個 user-facing 頁面把 DB 來的 `*.html` 直接 `dangerouslySetInnerHTML` 出來，沒過 sanitizer：

- [apps/cms/app/(www)/articles/[slug]/page.tsx:140](/Users/josh/code/nbee/apps/cms/app/(www)/articles/%5Bslug%5D/page.tsx#L140)
  ```tsx
  <div dangerouslySetInnerHTML={{ __html: article.html }} />
  ```
- [apps/cms/app/dashboard/(dashboard)/(features)/faq/_components/faq-card.tsx:242](/Users/josh/code/nbee/apps/cms/app/dashboard/(dashboard)/(features)/faq/_components/faq-card.tsx#L242)

### 風險

**Stored XSS**：

- 任一個 admin 在 editor 貼進去含 `<script>` / `<img onerror>` / `<iframe srcdoc>` 的 HTML
- 所有 reader（包括其他 admin、公開讀者）打開該文章 / FAQ → 程式碼在他們瀏覽器執行
- 可竊取 cookie / session、發 request 代他們做事、redirect 到釣魚站

### 建議修法

用 `isomorphic-dompurify` 或同等 sanitizer，**寫入時 sanitize 一次 + render 前再 sanitize 一次**（深度防禦）：

```tsx
import DOMPurify from 'isomorphic-dompurify';

// 寫入 DB 時（service layer）
const safeHtml = DOMPurify.sanitize(input, {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
});

// Render 時（page.tsx）
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.html) }} />
```

### 其他 5 處 `dangerouslySetInnerHTML` 評估

掃到的另外 5 處屬於 editor 內部 component（mermaid SVG、equation、chart、block preview）：

| 檔案 | 內容來源 | 風險 |
|---|---|---|
| `equation-node-static.tsx` (×2) | KaTeX 渲染的 LaTeX HTML | 低（KaTeX 自己 sanitize） |
| `chart.tsx` | 圖表渲染 | 低 |
| `block-preview.tsx` | Editor 預覽 | 中（看 content 來源） |
| `mermaid.view.tsx` | Mermaid SVG | 中（mermaid 渲染後的 SVG） |

→ 不是這個 fix 的 scope，但長期應該統一過 sanitizer。

### 相關檔案

- [apps/cms/app/(www)/articles/[slug]/page.tsx](/Users/josh/code/nbee/apps/cms/app/(www)/articles/%5Bslug%5D/page.tsx)
- [apps/cms/app/dashboard/(dashboard)/(features)/faq/_components/faq-card.tsx](/Users/josh/code/nbee/apps/cms/app/dashboard/(dashboard)/(features)/faq/_components/faq-card.tsx)
- 寫入點：article / FAQ 的 service layer（建議在這裡 sanitize）

---

## #4 — AI API endpoints 完全 unauthenticated（open proxy 風險）

### 現況

兩個 AI route 對任何 internet 訪客開放，沒做任何 `auth()` 檢查：

- [apps/cms/app/api/ai/copilot/route.ts](/Users/josh/code/nbee/apps/cms/app/api/ai/copilot/route.ts)
- [apps/cms/app/api/ai/command/route.ts](/Users/josh/code/nbee/apps/cms/app/api/ai/command/route.ts)

兩個都 re-export `@heiso/core/modules/api/ai/*/route`，實作只檢查 `apiKey` 有無，**沒檢查 user identity**。

### 風險

1. **Open proxy 給 OpenAI**：攻擊者用 own key + 你的 server 當中繼，掩蓋自己 IP
2. **資源濫用 / DoS**：被狂打 OpenAI API，OpenAI 會 rate limit **你的 IP**，影響合法用戶
3. **如果哪天意外設了 production `OPENAI_API_KEY` env**（fix2.md #2 描述的場景），fallback 觸發 → 直接被白嫖燒額度

### 建議修法

加 `auth()` + per-user rate limit：

```ts
import { auth } from "@heiso/core/modules/auth/auth.config";
import { consumeRateLimit, getClientIp } from "@heiso/core/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = consumeRateLimit(`ai:${session.user.id}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  // 原本邏輯...
}
```

→ **5 分鐘的修法，0 風險**（合法用戶都登入了，加 auth 不影響功能）。

### 相關檔案

- [packages/core/modules/api/ai/copilot/route.ts](/Users/josh/code/nbee/packages/core/modules/api/ai/copilot/route.ts) — 實作位置
- [packages/core/modules/api/ai/command/route.ts](/Users/josh/code/nbee/packages/core/modules/api/ai/command/route.ts) — 實作位置
- [packages/core/lib/rate-limit.ts](/Users/josh/code/nbee/packages/core/lib/rate-limit.ts) — rate limit util（newsletter 已用）

---

## #5 — Webhook signature verify 在 secret 缺失時 fail-open

### 現況

[apps/cms/app/api/webhook/resend-inbound/route.ts:65](/Users/josh/code/nbee/apps/cms/app/api/webhook/resend-inbound/route.ts#L65)

```ts
const secret = process.env.RESEND_WEBHOOK_SECRET ?? null;
if (secret) {
  // 驗章...
  if (!valid) return 401;
} else {
  console.warn("RESEND_WEBHOOK_SECRET not set; skipping signature verification (dev only)");
  // 繼續處理 webhook（fail-open!）
}
```

`/api/webhook/resend/route.ts` 同樣 pattern。

### 風險

如果 `RESEND_WEBHOOK_SECRET` **意外沒設在 production**（人為失誤、env rotate 沒同步、新 tenant project 漏設）：

- 所有 webhook 不驗章直接信任
- 攻擊者偽造 inbound email payload → 注入假 newsletter 訂閱 / 假 bounce / 觸發業務邏輯

「dev only」的好意註解擋不住人為失誤。

### 建議修法

Production 環境 fail-closed：

```ts
const secret = process.env.RESEND_WEBHOOK_SECRET ?? null;

if (!secret) {
  if (process.env.NODE_ENV === "production") {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET required in production");
    return json({ ok: false, error: "configuration_error" }, 500);
  }
  console.warn("[resend-webhook] dev only: skipping signature verification");
}
// ...
```

或更激進 —— bootstrap 階段就 throw（`instrumentation.ts` 之類），**避免 production 啟動時就缺 secret**。

### 相關檔案

- [apps/cms/app/api/webhook/resend-inbound/route.ts](/Users/josh/code/nbee/apps/cms/app/api/webhook/resend-inbound/route.ts)
- [apps/cms/app/api/webhook/resend/route.ts](/Users/josh/code/nbee/apps/cms/app/api/webhook/resend/route.ts)

---

## #6 — 其他 security 待釐清項目（audit follow-up）

下面這些不是已知 bug，但 **audit 時沒看夠深**，需要實作確認：

### 6a. Elysia API 各 route auth 一致性

[apps/cms/modules/api/](/Users/josh/code/nbee/apps/cms/modules/api/) 用 Elysia + `plugins/auth.ts` / `plugins/optional-auth.ts`。要逐個 module 確認用的是哪個 plugin：

- `categories` / `pages` / `articles` / `products` / `navigation` / `faq` / `site` / `redirects` / `newsletter`
- `optional-auth` vs `auth` 差在哪？被誤用會打破權限模型嗎？

### 6b. CORS 設定 allowlist

[apps/cms/modules/api/index.ts](/Users/josh/code/nbee/apps/cms/modules/api/index.ts) `.use(corsPlugin)` —— 如果 allowlist 是 `*` + 帶 cookie auth，等於 CSRF 大門開（任何 origin 可代用戶發 request）。

確認 [packages/core/modules/api/plugins/](/Users/josh/code/nbee/packages/core/modules/api/plugins/) 的 corsPlugin 實作。

### 6c. Permission cache invalidation

[packages/core/server/services/permission.ts](/Users/josh/code/nbee/packages/core/server/services/permission.ts)

```ts
permissionCache.set(userId, permissions);  // TTL 多久？revoke 時 invalidate 嗎？
```

撤權後用戶會繼續享有舊權限多久？有 `permissionCache.del(userId)` on role change 嗎？

### 6d. File upload 防護

[apps/cms/app/api/(www)/file/[name]/route.ts](/Users/josh/code/nbee/apps/cms/app/api/(www)/file/%5Bname%5D/route.ts) 有沒有：

- Path traversal 防護（`../../etc/passwd`）
- MIME / extension 白名單
- 檔案大小上限
- Auth check（沒 auth 就能上傳 = 任何人塞垃圾進你 S3）

### 6e. Open redirect

NextAuth `signIn(callbackUrl)`、`/login?callbackUrl=` 之類的 redirect 有沒有驗 origin？
如果沒驗 → 攻擊者送釣魚連結 `https://your-site.com/login?callbackUrl=https://evil.com` 騙用戶。

### 6f. CSP header 缺失

`next.config.ts` 跟 [proxy.ts](/Users/josh/code/nbee/apps/cms/proxy.ts) 都沒設 `Content-Security-Policy`。CSP 是 XSS 第二道防線（即便 #3 漏了，CSP 能擋住外部 script load）。

### 6g. Login rate limit

`/api/auth/[...nextauth]` 的 credentials provider（如果有用）有沒有防爆破 rate limit？沒有的話 username/password 暴力破解門戶大開。

### 處理建議

每個都是 1-3 hr audit 工作量（讀 code + 測試 + 寫小修），可以分配給工程師做為 follow-up sprint。**不影響當下功能**（除非已有人在打），但 production 應該逐個確認過。
