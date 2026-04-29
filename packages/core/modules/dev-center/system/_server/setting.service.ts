"use server";

import type { Locale } from "@heiso/core/i18n/config";
import { db } from "@heiso/core/lib/db";
import { settings } from "@heiso/core/lib/db/schema";
import type { Settings } from "@heiso/core/types/system";
import type { SiteSetting } from "../settings/general/page";

async function getSettings(): Promise<Settings> {

  const result = await db.query.settings.findMany({
    columns: { name: true, value: true },
    where: (fields, { and, eq, isNull }) =>
      and(eq(fields.isKey, false), isNull(fields.deletedAt)),
  });

  const settingsMap: Record<string, unknown> = {};
  for (const { name, value } of result) {
    settingsMap[name] = value;
  }
  return settingsMap;
}

async function saveSetting() {
  // Unimplemented
}

async function saveSiteSetting(data: SiteSetting) {

  await db.transaction(async (tx) => {
    await Promise.all(
      Object.keys(data).map(async (key) => {
        const value = data[key as keyof typeof data];
        await tx
          .insert(settings)
          .values({
            name: key,
            value,
            group: "site",
          })
          .onConflictDoUpdate({
            target: settings.name,
            set: {
              value,
              updatedAt: new Date(),
            },
          });
      }),
    );
  });
}

export { getSettings, saveSetting, saveSiteSetting };

// 將系統預設語言存入 settings.language = { default: <locale> }
export async function saveDefaultLanguage(locale: Locale) {

  await db
    .insert(settings)
    .values({
      name: "language",
      value: { default: locale },
      group: "system",
    })
    .onConflictDoUpdate({
      target: settings.name,
      set: {
        value: { default: locale },
        updatedAt: new Date(),
      },
    });
}
