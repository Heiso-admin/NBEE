"use client";

import { CoverSection } from "./page-settings/cover-section";
import { GooglePreview } from "./page-settings/google-preview";
import { SeoSection } from "./page-settings/seo-section";
import { TagsSection } from "./page-settings/tags-section";

export function PageSettingsPanel() {
  return (
    <div className="flex-1 overflow-y-auto bg-background px-12 py-8 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h2 className="mb-1 text-lg font-semibold">頁面設定</h2>
          <p className="text-xs text-muted-foreground">
            文章發布前的封面、SEO、tag 設定。所有 AI 生成皆透過 simulator 模擬。
          </p>
        </div>

        <CoverSection />
        <TagsSection />
        <SeoSection />
        <GooglePreview />
      </div>
    </div>
  );
}
