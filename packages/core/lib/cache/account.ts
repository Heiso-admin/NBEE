import { unstable_cache } from 'next/cache'
import { getDynamicDb } from '@heiso/core/lib/db/dynamic'
import { accounts } from '@heiso/core/lib/db/schema/auth/accounts'
import type { TAccount } from '@heiso/core/lib/db/schema/auth/accounts'
import { eq } from 'drizzle-orm'

/**
 * Cached version of getAccountByEmail().
 * Tag: `account:{email}`
 *
 * getDynamicDb() must be called OUTSIDE unstable_cache callback,
 * because headers() is not available inside cache callbacks.
 */
export async function cachedGetAccountByEmail(
    email: string,
): Promise<TAccount | null> {
    const db = await getDynamicDb()

    const cached = unstable_cache(
        async () => {
            const account = await db.query.accounts.findFirst({
                where: (t, { eq: e }) => e(t.email, email),
            })
            return account || null
        },
        [`account:${email}`],
        { tags: [`account:${email}`] },
    )
    return cached()
}
