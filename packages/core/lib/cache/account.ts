import { cacheTag } from 'next/cache'
import { getAccountByEmail } from '@heiso/core/lib/platform/account-adapter'
import type { TAccount } from '@heiso/core/lib/db/schema/auth/accounts'

/**
 * Cached version of getAccountByEmail().
 * Tag: `account:{email}`
 */
export async function cachedGetAccountByEmail(
    email: string,
): Promise<TAccount | null> {
    'use cache'
    cacheTag(`account:${email}`)

    return getAccountByEmail(email)
}
