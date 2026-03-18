import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
);

/**
 * 產生帶前綴的唯一 ID
 * @param prefix - ID 前綴（例如 "u" → "u_xYzAb93Dq1"）
 * @param length - 隨機部分長度（預設 10）
 */
export function generateId(prefix?: string, length: number = 10) {
  if (!prefix) return nanoid(length);
  return `${prefix}_${nanoid(length)}`;
}

// ===== Account =====
export const generateAccountId = () => generateId("u");

// ===== Platform Roles =====
export const generatePlatformRoleId = () => generateId("pr");

// ===== Tenant Roles =====
export const generateRoleId = () => generateId("ro");
export const generatePermissionId = () => generateId("pe");

// ===== Features =====
export const generateNavigationId = () => generateId("n");

// ===== Auth =====
export const generateInviteToken = () => generateId(undefined, 20);
export const generateOTP = () => customAlphabet("0123456789", 6);

/** @deprecated 使用 generateAccountId */
export const generateUserId = () => generateId("u");
