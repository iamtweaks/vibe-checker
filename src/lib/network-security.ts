import dns from 'node:dns/promises'
import net from 'node:net'

const MAX_REDIRECTS = 3
const DEFAULT_TIMEOUT_MS = 15_000
const MAX_RESPONSE_BYTES = 2_000_000

const LOCAL_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
])

function parseIPv4(address: string): number[] | null {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) return null
  const parts = address.split('.').map(Number)
  if (parts.some((part) => part < 0 || part > 255)) return null
  return parts
}

function isPrivateIPv4(address: string): boolean {
  const parts = parseIPv4(address)
  if (!parts) return false
  const [a, b] = parts

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase()
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    normalized.startsWith('::ffff:127.') ||
    normalized.startsWith('::ffff:10.') ||
    normalized.startsWith('::ffff:192.168.') ||
    /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
    normalized.startsWith('::ffff:169.254.')
  )
}

export function isBlockedAddress(address: string): boolean {
  const ipVersion = net.isIP(address)
  if (ipVersion === 4) return isPrivateIPv4(address)
  if (ipVersion === 6) return isPrivateIPv6(address)
  return false
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  const parsed = new URL(rawUrl)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs can be scanned')
  }

  const hostname = parsed.hostname.toLowerCase()
  if (LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
    throw new Error('Localhost URLs are not allowed')
  }

  if (isBlockedAddress(hostname)) {
    throw new Error('Private, loopback, multicast, or link-local addresses are not allowed')
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true })
  if (records.length === 0) {
    throw new Error('DNS lookup returned no addresses')
  }

  const blockedRecord = records.find((record) => isBlockedAddress(record.address))
  if (blockedRecord) {
    throw new Error(`Hostname resolves to a non-public address (${blockedRecord.family})`)
  }

  return parsed
}

async function readLimitedText(response: Response): Promise<string> {
  const contentLength = response.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_RESPONSE_BYTES) {
    throw new Error('Website response too large (>2MB). Aborting scan.')
  }

  if (!response.body) return response.text()

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    total += value.byteLength
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel()
      throw new Error('Website response too large (>2MB). Aborting scan.')
    }
    chunks.push(value)
  }

  return new TextDecoder().decode(Buffer.concat(chunks))
}

export async function fetchPublicHtml(rawUrl: string): Promise<{ finalUrl: string; html: string; headers: Headers }> {
  let currentUrl = rawUrl

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const parsed = await assertPublicHttpUrl(currentUrl)

    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'VibeChecker/1.0 Security Scanner (+https://vibe-checker.69-6-206-26.sslip.io)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (!location) throw new Error('Redirect response missing Location header')
      currentUrl = new URL(location, parsed).toString()
      continue
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType && !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error('Website response is not HTML')
    }

    const html = await readLimitedText(response)
    return { finalUrl: parsed.toString(), html, headers: response.headers }
  }

  throw new Error('Too many redirects while fetching website')
}
