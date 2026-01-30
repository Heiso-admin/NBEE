"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import { recursiveList } from "@heiso/core/lib/tree";

import { getTenantId } from "@heiso/core/lib/utils/tenant";

async function getMenus({ recursive = false }: { recursive?: boolean }) {
  const tenantId = await getTenantId();
  if (!tenantId) return { data: [], count: 0 };

  const db = await getDynamicDb();
  const result = await db.query.menus.findMany({
    where: (t, { and, eq, isNull }) => and(
      isNull(t.deletedAt),
      eq(t.tenantId, tenantId)
    ),
    orderBy: (t, { asc }) => [asc(t.order)],
  });

  const data = recursive ? recursiveList(result) : result;
  return {
    data,
    count: result.length,
  };
}

export { getMenus };
