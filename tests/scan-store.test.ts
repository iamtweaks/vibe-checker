import crypto from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { getApiKeyFromHeaders, isAdminApiKey } from '../src/lib/scan-store'

describe('scan-store admin API key helpers', () => {
  const originalHashes = process.env.VIBECHECKER_API_KEY_HASHES

  afterEach(() => {
    if (originalHashes === undefined) {
      delete process.env.VIBECHECKER_API_KEY_HASHES
    } else {
      process.env.VIBECHECKER_API_KEY_HASHES = originalHashes
    }
  })

  it('requires configured hashes and rejects arbitrary keys by default', () => {
    delete process.env.VIBECHECKER_API_KEY_HASHES
    expect(isAdminApiKey('anything')).toBe(false)
  })

  it('accepts a key matching a configured sha256 hash', () => {
    const key = 'admin-test-key'
    process.env.VIBECHECKER_API_KEY_HASHES = crypto.createHash('sha256').update(key).digest('hex')
    expect(isAdminApiKey(key)).toBe(true)
    expect(isAdminApiKey('wrong-key')).toBe(false)
  })

  it('extracts API keys from x-api-key before Authorization bearer', () => {
    const headers = new Headers({
      'x-api-key': 'primary',
      authorization: 'Bearer fallback',
    })
    expect(getApiKeyFromHeaders(headers)).toBe('primary')
  })
})
