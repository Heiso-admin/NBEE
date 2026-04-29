import { unstable_cache } from 'next/cache'
import { db } from '@heiso/core/lib/db'

/**
 * Cached version of findMembershipByAccountId().
 * Tag: `membership:{accountId}`
 */
export async function cachedFindMembershipByAccountId(accountId: string) {
    const cached = unstable_cache(
        async () => {
            const account = await db.query.accounts.findFirst({
                columns: {
                    id: true,
                    status: true,
                    role: true,
                    roleId: true,
                },
                with: {
                    customRole: {
                        columns: { id: true, name: true, fullAccess: true }
                    }
                },
                where: (t, { and, eq, isNull }) =>
                    and(eq(t.id, accountId), isNull(t.deletedAt)),
            })

            if (!account) return null

            return {
                id: account.id,
                accountId: account.id,
                status: account.status,
                role: account.role,
                customRole: account.customRole,
            }
        },
        [`membership:${accountId}`],
        { tags: [`membership:${accountId}`] },
    )
    return cached()
}
