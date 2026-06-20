import crypto from 'node:crypto'

export function verifyGitHubWebhookSignature(
  payload: string,
  signature: string | null,
  secret = process.env.GITHUB_WEBHOOK_SECRET,
): boolean {
  if (!secret) return false
  if (!signature || !signature.startsWith('sha256=')) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  const trusted = Buffer.from(`sha256=${expectedSignature}`, 'utf-8')
  const received = Buffer.from(signature, 'utf-8')

  if (trusted.length !== received.length) return false
  return crypto.timingSafeEqual(trusted, received)
}
