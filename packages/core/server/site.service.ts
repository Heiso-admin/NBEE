"use server";

import { db } from "@heiso/core/lib/db";
import type { SiteSetting } from "@heiso/core/modules/dev-center/system/settings/general/page";

export async function getSiteSettings(): Promise<SiteSetting> {
  const settings = await db.query.settings.findMany({
    where: (fields, { and, eq, isNull }) => and(
      isNull(fields.deletedAt),
      eq(fields.group, 'site'),
    ),
  });

  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result as SiteSetting;
}
