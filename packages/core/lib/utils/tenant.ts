export const APP_MODE = "core";

/**
 * Retrieves the current tenant ID from environment.
 */
export function getTenantId(): string | undefined {
  if (process.env.TENANT_ID) {
    return process.env.TENANT_ID;
  }

  if (process.env.APP_MODE === APP_MODE) {
    return APP_MODE;
  }

  return undefined;
}
