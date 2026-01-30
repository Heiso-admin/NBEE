"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import type {
  TMenu,
  TPermission,
  TRole,
  TRoleInsert,
  TRoleUpdate,
} from "@heiso/core/lib/db/schema";
import { roles } from "@heiso/core/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@heiso/core/lib/utils/tenant";

export type Role = TRole & {
  menus: {
    menus: TMenu;
  }[];
  permissions: {
    permission: TPermission;
  }[];
};

async function getRoles(): Promise<Role[]> {
  const tenantId = await getTenantId();
  if (!tenantId) return [];

  const db = await getDynamicDb();
  const result = await db.query.roles.findMany({
    with: {
      menus: {
        with: {
          menus: true,
        },
      },
      permissions: {
        with: {
          permission: true,
        },
      },
    },
    where: (t, { and, isNull, eq }) => {
      const filters = [isNull(t.deletedAt)];
      if (tenantId) {
        filters.push(eq(t.tenantId, tenantId));
      }
      return and(...filters);
    },
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

  return result;
}

async function createRole(data: Omit<TRoleInsert, "tenantId">) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Tenant context missing");

  const db = await getDynamicDb();
  const result = await db.insert(roles).values({ ...data, tenantId });
  revalidatePath("/dashboard/role", "page");
  return result;
}

async function updateRole(id: string, data: TRoleUpdate) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Tenant context missing");

  const db = await getDynamicDb();
  const result = await db
    .update(roles)
    .set(data)
    .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));

  revalidatePath("/dashboard/role", "page");
  return result;
}

async function deleteRole({ id }: { id: string }) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Tenant context missing");

  const db = await getDynamicDb();
  const result = await db
    .update(roles)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId), isNull(roles.deletedAt)));

  revalidatePath("/dashboard/role", "page");
  return result;
}

export { getRoles, createRole, updateRole, deleteRole };
