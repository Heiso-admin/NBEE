# NBEE 產品重新規劃討論

> 日期：2026-05-04
> 背景：在 AI 時代（Lovable / v0 / bolt.new 等），WordPress-like CMS 的競爭力快速衰退，需要重新思考 NBEE 的產品定位。

---

## 一、現狀盤點

### 1.1 既有功能（功能模組）

| 模組 | 類型 | 對應 WordPress | AI 時代影響 |
|------|------|---------------|-------------|
| **Page** | 頁面（visual editor） | Page | 🔴 **被 AI 直接取代** |
| **Article** | 文章 / 部落格 | Post | 🟡 受影響但有運營價值 |
| **Product** | 商品（Article + 商品欄位） | WooCommerce | 🟡 業務需要持續存在 |
| **Navigation** | 選單管理 | Menu | 🟢 仍需要結構性管理 |
| **FAQ** | 常見問題 | FAQ Plugin | 🟡 部分被 AI Chatbot 取代 |
| **Form** | 動態表單 | CF7 / WPForms | 🟢 B2B 核心，AI 不易取代 |
| **Newsletter** | Email 訂閱 | MailPoet | 🟢 CRM 核心 |
| **SEO** | Meta / Sitemap | Yoast | 🟢 專業能力 |

### 1.2 既有 Tier 規劃

```
Starter   → Menu / Page / Article / FAQ / 媒體庫（1 seat）
Business  → + Form / Site SEO / 垃圾桶（多人協作）
Premium   → + Live Streaming / Email Builder / Activity Log
```

### 1.3 已有的 AI 思考

- ✅ **AI Article Planner**（自動生成文章）— 已有 spec
- ✅ **AI Form Intelligence**（生成表單結構、語意分析）— 已有思考
- ❌ AI 編輯助手、AI 翻譯、AI SEO、AI Chatbot 尚未具體化

---

## 二、AI 時代的根本挑戰

### 2.1 哪些被 AI 工具取代（紅燈）

| 功能 | 被誰取代 | 程度 |
|------|---------|------|
| Page builder（拖拉式編輯器） | Lovable / v0 / bolt.new / Framer AI | 🔴 完全取代 |
| 設計 UI / 動畫 / 響應式 | v0 / Cursor + Tailwind | 🔴 完全取代 |
| Static page 內容生成 | ChatGPT / Claude / Gemini | 🔴 完全取代 |
| Theme 開發 | AI code gen | 🟡 大幅取代 |

**結論**：繼續投資 visual editor 等於跟 Lovable 正面打仗，**這仗打不贏**。

### 2.2 AI 不擅長 / 不取代的（綠燈）

| 領域 | 為什麼 AI 取代不了 |
|------|------------------|
| **資料持久化** | AI 不存資料、不管狀態 |
| **多租戶管理** | SaaS 控制面、權限、配額 |
| **業務流程** | 表單提交 → 流程自動化 → 通知 → 入庫 |
| **內容運營** | 排程、版本、發布流程、團隊協作 |
| **客戶關係** | Subscriber、Segmentation、Newsletter、CRM |
| **結構化整合** | Headless API、跨系統資料同步 |
| **行業 know-how** | 醫美 / 法律 / 教育的專屬流程 |

---

## 三、重新定位的方向（5 個選項）

### A. 🤖 AI-Native CMS（AI 內嵌的 CMS）

**核心思路**：不跟 AI 工具競爭，把 AI 變成自己的工具。

**具體功能：**
- AI 文章生成（已規劃）
- AI 翻譯（多語系自動填充）
- AI SEO 助手（自動產生 meta、改寫標題）
- AI 圖片生成 / 選圖（搭配文章 cover）
- AI Chatbot（基於 FAQ + Article 自動回答）
- AI 個性化推送（Newsletter 客製化內容）

**優勢**：保留現有架構，加深 moat
**劣勢**：仍是 CMS 框架，Page 的痛點沒解決

---

### B. 🎯 行業垂直深耕（Vertical SaaS）

**核心思路**：不做通用 CMS，專注特定行業。

**候選行業：**
- 🏥 **醫美 / 眼科**（你的 smartsight 已經有 32 篇眼科文章）
- ⚖️ 法律事務所
- 📚 教育機構 / 補習班
- 🍽️ 餐飲連鎖

**具體做法：**
- 行業專屬 schema（醫師資料、診所、療程、案例）
- 行業專屬模板（不是通用 page builder）
- 行業專屬流程（預約、術後追蹤、評價）
- 行業專屬 SEO（醫療法規、行業關鍵字）

**優勢**：有明確 ICP（理想客戶）、客單價高、AI 工具搶不走
**劣勢**：TAM 變小、要懂行業

---

### C. 📡 Headless CMS + AI 整合

**核心思路**：放棄前端，當 AI 工具的後端。

**具體做法：**
- 砍掉 Page Builder / Visual Editor
- 強化 API（GraphQL / REST）
- 讓 Lovable / v0 部署時讀 NBEE 的內容
- NBEE 變成「**AI 生成網站的內容資料庫**」

**典範**：Strapi / Sanity / Contentful

**優勢**：跟 AI 工具合作而非競爭
**劣勢**：失去現有用戶（要 visual editor 的客戶）

---

### D. 📊 Marketing Operations Platform

**核心思路**：從 CMS 升級成「行銷運營平台」。

**功能矩陣：**
```
內容管理     +  Audience 管理    +  Engagement
─────────       ─────────────       ────────────
Article          Subscribers        Newsletter
Product          Segmentation       Form Submission
FAQ              Tagging             Chatbot
                                      Activity Log
                                      Analytics
```

**具體做法：**
- 加強 Form → Submission Workflow
- 加強 Newsletter → A/B test、Segmentation
- 新增 Funnel 追蹤
- 新增 Email Sequence（drip campaign）
- 新增 Chatbot（基於現有 FAQ）

**競爭對手**：HubSpot Lite / Mailchimp / ActiveCampaign

**優勢**：客單價拉高、SaaS 黏性強
**劣勢**：要做更多功能、競爭激烈

---

### E. 🔧 Workflow OS（基於 Form 擴展）

**核心思路**：Form 不只是收集資料，而是觸發流程。

**靈感**：你的 `forms/dynamicform-philosophy.md` 已經提到：
- Conversion-as-a-Service
- Event Registration
- Workflow Automation

**具體做法：**
- Form 提交 → 觸發 webhook / Slack / Discord / LINE
- Form Schema 驅動 → AI 自動生成 form
- Submission → 自動入 CRM / Audience
- Submission → 觸發 Email Sequence

**典範**：Tally + Make.com + Zapier

**優勢**：B2B 強需求、moat 在資料整合
**劣勢**：偏離 CMS 本位

---

## 四、我的建議：A + B 混合

不要選一個，**兩個一起做才有差異化**：

```
┌─────────────────────────────────────────────────┐
│  核心：AI-Native（A）                             │
│  ├─ AI 寫文章 / 翻譯 / SEO                        │
│  ├─ AI 生成表單                                  │
│  └─ AI Chatbot（基於 FAQ + Article）              │
│                                                 │
│  差異化：行業垂直（B）                            │
│  └─ 第一個垂直：醫美 / 眼科                       │
│     ├─ Doctor / Clinic / Treatment schema       │
│     ├─ 預約流程                                  │
│     └─ Case Study 模板                          │
└─────────────────────────────────────────────────┘
```

### 為什麼這個組合？

1. **AI-Native 是地基**：所有功能都受惠
2. **行業垂直是矛**：smartsight 已經有醫美內容，可以快速 PoC
3. **共生關係**：行業 schema 讓 AI 生成更準確（domain knowledge）

---

## 五、減法 / 刪除清單

### 5.1 立刻減弱投資

| 功能 | 為什麼 |
|------|--------|
| **Page Builder（visual editor）** | 被 AI 取代，繼續做 ROI 低 |
| **Page Templates** | 改成 AI 生成 |
| **Theme 系統**（如果有） | 讓 AI 處理 |

### 5.2 重整邏輯

從代碼角度看（見 [code-review.md](code-review.md)）：

| 模組 | 現狀 | 建議 |
|------|------|------|
| `apps/cms/server/post.service.ts` | 502 行死代碼 | 🗑️ 刪除 |
| `apps/cms/server/navigation.service.ts` | 名字騙人，內容是 page picker | 🗑️ 刪除（改 import pages 的） |
| Page builder 的 visual editor | 大量代碼 | 🟡 維持但停止新功能 |
| Article / Product service | 跟 Page service 95% 重複 | 🔄 抽出 factory |

### 5.3 強化 / 新增

| 功能 | 動作 |
|------|------|
| **Article + AI** | 落地 AI Article Planner |
| **Form + AI** | AI 生成 schema、語意分析 |
| **FAQ + Chatbot** | 接 AI 把 FAQ + Article 變 chat |
| **Newsletter Segmentation** | Subscriber tagging |
| **Headless API** | 強化 GraphQL / REST |
| **Vertical Schema** | 加入 Doctor / Clinic / Case 等行業表 |

---

## 六、新版 Tier 提案

```
┌─────────────────────────────────────────────────────┐
│ NBEE Free                  $0 / month               │
│ ─ Article / FAQ / Newsletter（基本）                 │
│ ─ 1 GB storage                                      │
│ ─ NBEE branding                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ NBEE Pro                   $29 / month              │
│ ─ + Form / Product                                  │
│ ─ + AI 寫作助手（每月 50k tokens）                   │
│ ─ + Custom domain                                   │
│ ─ 10 GB storage                                     │
│ ─ Multi-seat（5）                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ NBEE Business              $99 / month              │
│ ─ + AI Chatbot                                      │
│ ─ + Newsletter Segmentation                         │
│ ─ + Workflow Automation                             │
│ ─ + Headless API                                    │
│ ─ 100 GB storage                                    │
│ ─ Multi-seat（unlimited）                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ NBEE Vertical (醫美 / 法律 / etc)  $299 / month     │
│ ─ Business 全部功能                                  │
│ ─ + 行業專屬 schema / 模板 / 流程                    │
│ ─ + 行業 SEO 顧問（人工）                            │
│ ─ Onboarding 諮詢                                   │
└─────────────────────────────────────────────────────┘
```

---

## 七、決策問題

請回答以下幾個問題，幫助縮小方向：

### 7.1 商業模式
- [ ] NBEE 的客戶是誰？（中小企業 / 行銷團隊 / 開發者 / 行業客戶）
- [ ] 你願意放棄 Page Builder 嗎？（這會流失部分現有用戶）
- [ ] 願意鎖定垂直行業嗎？（限縮 TAM 但提高成功率）

### 7.2 資源配置
- [ ] 接下來 3 個月，最重要的 1 件事是什麼？
- [ ] 工程資源夠不夠做 AI 整合？（每個 module 都要加 AI）

### 7.3 競爭定位
- [ ] 跟 Webflow / Wix / Framer 比，NBEE 的 unfair advantage 是什麼？
- [ ] 跟 Strapi / Sanity 比呢？
- [ ] 跟 HubSpot 比呢？

---

## 八、我的個人觀點

如果只能選一個方向，**我會選 A + B（AI-Native + 醫美垂直）**：

**理由：**
1. **AI 是無法迴避的浪潮**，不擁抱就被淘汰
2. **垂直行業是 moat**，AI 工具搶不走「醫療法規 + 行業 schema」這種知識
3. **smartsight 已經有現成內容**（32 篇眼科文章），可以快速做 PoC
4. **客單價可以拉高**（垂直 SaaS 客單通常是通用的 3-10 倍）
5. **Page Builder 是包袱**，精力應該轉移

**第一個 90 天目標：**
- 把現有 medical content（smartsight 32 篇）變成「眼科診所開站包」
- 加上 AI Article Planner（已有 spec，落地）
- 加上 FAQ Chatbot（基於 19 個現有 FAQ）
- 找 1-3 家眼科診所 beta（可能 smartsight 自己用）

---

## 九、下一步建議

1. **回答上面的決策問題**（7.1 / 7.2 / 7.3）
2. **選一個方向（A-E）或組合**
3. **列出 90 天 OKR**
4. **重整 [code-review.md](code-review.md) 的修復優先順序**（依新方向決定哪些 code 該修、該刪）

你覺得呢？哪個方向最像你想做的？
