import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyGitHubWebhookSignature } from '../src/lib/github-webhook'

describe('verifyGitHubWebhookSignature', () => {
  const payload = JSON.stringify({ action: 'opened', repository: { name: 'demo' } })
  const secret = 'test-secret'
  const validSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`

  it('accepts a valid sha256 signature', () => {
    expect(verifyGitHubWebhookSignature(payload, validSignature, secret)).toBe(true)
  })

  it('rejects missing secret instead of failing open', () => {
    expect(verifyGitHubWebhookSignature(payload, validSignature, '')).toBe(false)
  })

  it('rejects invalid signatures without throwing on length mismatch', () => {
    expect(verifyGitHubWebhookSignature(payload, 'sha256=short', secret)).toBe(false)
  })

  it('rejects non sha256 signatures', () => {
    expect(verifyGitHubWebhookSignature(payload, validSignature.replace('sha256=', 'sha1='), secret)).toBe(false)
  })
})
