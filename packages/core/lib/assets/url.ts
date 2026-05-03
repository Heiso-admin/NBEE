/**
 * Image URL helpers — assets-foundation §5
 *
 * Public files 走 CDN(NEXT_PUBLIC_CDN_URL,目前是 nbee-cdn.heiso.io)。
 * Private files 不在這裡處理,請走 server action `getDownloadUrl()`。
 */

const kDefaultCdn = "https://nbee-cdn.heiso.io";

function cdnBase(): string {
  return process.env.NEXT_PUBLIC_CDN_URL || kDefaultCdn;
}

/**
 * 把 row 上的 `path`(`{tenant}/{sha256}.{ext}`)轉成 CDN URL。
 *
 * @param path   file row 的 path 欄位
 * @param variant Phase B 沒做 image transform,留參數 placeholder 給未來 ?w=, ?q= 用
 */
export function imageUrl(path: string, variant?: string): string {
  if (!path) return "";
  const base = cdnBase().replace(/\/$/, "");
  const clean = path.replace(/^\//, "");
  return variant ? `${base}/${clean}?v=${encodeURIComponent(variant)}` : `${base}/${clean}`;
}
