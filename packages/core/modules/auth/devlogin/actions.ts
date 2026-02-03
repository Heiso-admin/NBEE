"use server";

import { hashPassword } from "@heiso/core/lib/hash";
import { getAdminAuthAdapter } from "@heiso/core/lib/adapters";

// Helper to create Core Admin User & Member
async function createCoreAdmin(email: string, passwordString: string) {
    const { users, developers } = await import("@heiso/core/lib/db/schema");
    const { members } = await import("@heiso/core/lib/db/schema/permissions/member");
    const { hashPassword } = await import("@heiso/core/lib/hash");
    const { db } = await import("@heiso/core/lib/db"); // Use direct system DB connection

    // In Core mode, we might not have a tenant context, so we default to 'core'
    const tenantId = "core";

    const hashedPassword = await hashPassword(passwordString);

    // 1. Insert User
    const [newUser] = await db.insert(users).values({
        email,
        name: "Core PM",
        password: hashedPassword,
        active: true,
        lastLoginAt: new Date(),
        loginMethod: "credentials",
        mustChangePassword: false,
        updatedAt: new Date(),
    }).returning();

    // 2. Insert Member
    await db.insert(members).values({
        email,
        tenantId,
        userId: newUser.id,
        isOwner: true,
        status: 'joined',
        roleId: null, // Default to null, isOwner grants access
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // 3. Insert Developer (for Core Admin)
    await db.insert(developers).values({
        userId: newUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return newUser;
}

// Server Action to check status
export async function checkAdminStatus(email: string) {
    // Bypass for Core Mode (pm@heiso.io)
    if (process.env.APP_MODE === "core" && email === "pm@heiso.io") {
        const { getUser } = await import("@heiso/core/modules/auth/_server/user.service");
        const user = await getUser(email);

        // If user missing, return lastLoginAt: null to trigger 'prompt' (First User Setup)
        if (!user) {
            return { lastLoginAt: null };
        }
        return { lastLoginAt: user.lastLoginAt };
    }

    const adminAuth = getAdminAuthAdapter();
    if (!adminAuth) {
        return { error: "Admin auth not available" };
    }

    try {
        const user = await adminAuth.getAdminUser(email);
        if (!user) return { error: "User not found" };
        return { lastLoginAt: user.lastLoginAt };
    } catch (e) {
        console.error(e);
        return { error: "Database error" };
    }
}

// Server Action to update password
export async function updateAdminPassword(email: string, newPassword: string) {
    // Bypass for Core Mode (pm@heiso.io) - Handle Creation here too
    if (process.env.APP_MODE === "core" && email === "pm@heiso.io") {
        try {
            const { getUser } = await import("@heiso/core/modules/auth/_server/user.service");
            const { hashPassword } = await import("@heiso/core/lib/hash");
            const { users } = await import("@heiso/core/lib/db/schema");
            const { eq } = await import("drizzle-orm");

            const user = await getUser(email);
            if (!user) {
                // Create logic
                await createCoreAdmin(email, newPassword);
            } else {
                // Update logic
                const { db } = await import("@heiso/core/lib/db"); // Use direct DB
                const passwordHash = await hashPassword(newPassword);
                await db.update(users)
                    .set({ password: passwordHash, updatedAt: new Date(), lastLoginAt: new Date() })
                    .where(eq(users.email, email));
            }
            return { success: true };
        } catch (e) {
            console.error("[updateAdminPassword] Core bypass failed", e);
            return { error: "Update failed" };
        }
    }

    const adminAuth = getAdminAuthAdapter();
    if (!adminAuth) {
        return { error: "Admin auth not available" };
    }

    try {
        const passwordHash = await hashPassword(newPassword);
        await adminAuth.updatePassword(email, passwordHash);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update password" };
    }
}

// Server Action to ensure dev user exists and password is valid
export async function ensureDevUser(email: string, password: string) {
    // Only allow for pm@heiso.io in Core mode
    if (process.env.APP_MODE !== "core" || email !== "pm@heiso.io") {
        return { error: "Not allowed" };
    }

    try {
        const { verifyPassword } = await import("@heiso/core/lib/hash");
        const { getUser } = await import("@heiso/core/modules/auth/_server/user.service");

        let user = await getUser(email);

        if (!user) {
            // Auto-create (Fallback if they skipped the prompt or other flow)
            await createCoreAdmin(email, password);
            return { success: true, created: true };
        } else {
            // Verify password
            const isMatch = await verifyPassword(password, user.password);
            if (!isMatch) {
                return { error: "Invalid password" };
            }
            return { success: true };
        }
    } catch (e) {
        console.error("[ensureDevUser] Failed:", e);
        return { error: "Database operation failed" };
    }
}


