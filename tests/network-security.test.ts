import { describe, expect, it } from 'vitest'
import { assertPublicHttpUrl, isBlockedAddress } from '../src/lib/network-security'

describe('network SSRF protections', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '::1',
    'fe80::1',
    'fc00::1',
  ])('blocks non-public address %s', (address) => {
    expect(isBlockedAddress(address)).toBe(true)
  })

  it('rejects localhost hostnames before fetching', async () => {
    await expect(assertPublicHttpUrl('http://localhost:3000')).rejects.toThrow(/Localhost/)
  })

  it('rejects unsupported protocols', async () => {
    await expect(assertPublicHttpUrl('file:///etc/passwd')).rejects.toThrow(/http and https/)
  })
})
