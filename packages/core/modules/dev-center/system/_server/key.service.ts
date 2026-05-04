"use server";

import { db } from "@heiso/core/lib/db";
import { settings } from "@heiso/core/lib/db/schema/system/setting";

const KEY_GROUP = "api_keys";

export interface KeysShape {
  openai: { api_key: string };
  openrouter: { api_key: string };
  github: { access_token: string };
  resend: { api_key: string };
}

const NAME_MAP = {
  "openai.api_key": (k: KeysShape) => k.openai.api_key,
  "openrouter.api_key": (k: KeysShape) => k.openrouter.api_key,
  "github.access_token": (k: KeysShape) => k.github.access_token,
  "resend.api_key": (k: KeysShape) => k.resend.api_key,
} as const;

const DEFAULT_KEYS: KeysShape = {
  openai: { api_key: "" },
  openrouter: { api_key: "" },
  github: { access_token: "" },
  resend: { api_key: "" },
};

/**
 * 從 DB 讀 API keys（group='api_keys'）並 map 成結構化物件。
 * 沒設過的 key 回傳空字串，不回 null（避免 caller 又處理一次 null）。
 */
export async function getKeys(): Promise<KeysShape> {
  const rows = await db.query.settings.findMany({
    where: (f, { eq }) => eq(f.group, KEY_GROUP),
  });

  const map = new Map(rows.map((r) => [r.name, String(r.value ?? "")]));
  return {
    openai: { api_key: map.get("openai.api_key") || "" },
    openrouter: { api_key: map.get("openrouter.api_key") || "" },
    github: { access_token: map.get("github.access_token") || "" },
    resend: { api_key: map.get("resend.api_key") || "" },
  };
}

/**
 * 取單一 key（DB 優先，fallback env）。
 * 用於 consumer 內部統一從這裡拿 secret，不用各自處理 DB / env。
 */
export async function getKey(
  name: keyof typeof NAME_MAP,
  envFallback?: string,
): Promise<string> {
  const keys = await getKeys();
  const dbValue = NAME_MAP[name](keys);
  if (dbValue) return dbValue;
  if (envFallback && process.env[envFallback]) return process.env[envFallback]!;
  return "";
}

export async function saveKeys(data: Partial<KeysShape>) {
  const entries: Array<[string, string]> = [];
  if (data.openai?.api_key !== undefined)
    entries.push(["openai.api_key", data.openai.api_key]);
  if (data.openrouter?.api_key !== undefined)
    entries.push(["openrouter.api_key", data.openrouter.api_key]);
  if (data.github?.access_token !== undefined)
    entries.push(["github.access_token", data.github.access_token]);
  if (data.resend?.api_key !== undefined)
    entries.push(["resend.api_key", data.resend.api_key]);

  if (entries.length === 0) return;

  await Promise.all(
    entries.map(([name, value]) =>
      db
        .insert(settings)
        .values({ name, value, group: KEY_GROUP, isKey: true })
        .onConflictDoUpdate({
          target: settings.name,
          set: { value, updatedAt: new Date() },
        }),
    ),
  );
}

export const KEY_DEFAULTS = DEFAULT_KEYS;
