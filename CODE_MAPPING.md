# NBEE Code to Documentation Mapping

本文件旨在協助 AI 代理人與開發者快速連結 `NBEE` 程式碼與 `NBEE-Doc` 文件庫。

> **注意**: 文件路徑皆為相對於本儲存庫根目錄的相對路徑 (假設 `NBEE` 與 `NBEE-Doc` 位於同一層級目錄)。

## 📂 目錄對應表 (Directory Mapping)

| 程式碼位置 (Codebase Location) | 文件位置 (Documentation Location) | 說明 (Description) |
| :--- | :--- | :--- |
| `packages/core` | `../NBEE-Doc/package/core` | **NBEE-Core** 核心系統規格與功能說明 |
| `packages/core/app/(www)` | `../NBEE-Doc/apps-spec/cms` | **CMS-BEE** 業務邏輯與介面規格 |
| `packages/core/drizzle` | `../NBEE-Doc/package/core/db-update-guide.md` | 資料庫 schema 設計與更新指南 |
| `packages/biome-config` | `../NBEE-Doc/package/core/monorepo-guide.md` | 程式碼風格與 Monorepo 規範 |
| `packages/typescript-config` | `../NBEE-Doc/package/core/monorepo-guide.md` | TypeScript 共用設定 |
| `packages/core/config` | `../NBEE-Doc/package/core/architecture-overview.md` | 系統設定與權限定義 |
| `packages/core/docs` | `../NBEE-Doc/package/core/references.md` | 內部開發文件與參考資料 |
| `apps/test` | (無) | **Heiso Live** 測試應用程式 |

## 🐝 Hive 服務 (Hive Service)

| 概念 (Concept) | 相關程式碼 (Related Code) | 相關文件 (Doc Location) |
| :--- | :--- | :--- |
| **Hive Registry** | `packages/hive` (或內部 Adapter) | `../NBEE-Doc/Hive/registry-guide.md` |
| **Multi-Tenancy** | `packages/core/proxy.ts` | `../NBEE-Doc/Hive/architecture.md` |
| **Onboarding** | `packages/core/modules/auth` | `../NBEE-Doc/Hive/onboarding.md` |

## 🧩 關鍵概念對應 (Key Concepts Mapping)

| 概念 (Concept) | 相關程式碼 (Related Code) | 架構文件 (Architecture Doc) |
| :--- | :--- | :--- |
| **Authentication** | `packages/core/app/(auth)` | `../NBEE-Doc/package/core/architecture-overview.md` |
| **Permissions (RBAC)** | `packages/core/modules/permission` | `../NBEE-Doc/package/core/Core-Spec.md` |
| **CMS Structure** | `packages/core/app/(www)` | `../NBEE-Doc/apps-spec/cms/overview.md` |
| **AI Integration** | `packages/core/modules/ai` (若有) | `../NBEE-Doc/package/core/ai-integration.md` |

## 💡 如何使用 (How to Use)

- **AI 代理人**: 當需要理解特定模組的業務邏輯或架構決策時，請優先參考上述對應的文件路徑。
- **開發者**: 修改程式碼後，請檢查對應的文件是否需要更新。
