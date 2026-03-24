import { cacheTag } from 'next/cache'
import { findMembershipByAccountId } from '@heiso/core/modules/account/authentication/_server/auth.service'

/**
 * Cached version of findMembershipByAccountId().
 * Tag: `membership:{accountId}`
 */
export async function cachedFindMembershipByAccountId(accountId: string) {
    'use cache'
    cacheTag(`membership:${accountId}`)

    return findMembershipByAccountId(accountId)
}
