/**
 * Input validation utilities for VibeChecker
 * Centralized validation logic to avoid code duplication across API routes
 */

import type { ValidationResult, GitHubParsedURL } from './types'

// ============== URL Validation ==============

const HTTPS_PROTOCOL = 'https:'
const HTTP_PROTOCOL = 'http:'
const GITHUB_HOSTNAME = 'github.com'

/**
 * Validates a general URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required', code: 'URL_REQUIRED' }
  }

  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty', code: 'URL_EMPTY' }
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'URL is too long (max 2000 characters)', code: 'URL_TOO_LONG' }
  }

  try {
    const parsed = new URL(trimmed)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format', code: 'URL_INVALID_FORMAT' }
  }
}

/**
 * Validates a website URL (http/https)
 */
export function validateWebsiteUrl(url: string): ValidationResult {
  const baseValidation = validateUrl(url)
  if (!baseValidation.valid) {
    return baseValidation
  }

  try {
    const parsed = new URL(url.trim())

    if (parsed.protocol !== HTTPS_PROTOCOL && parsed.protocol !== HTTP_PROTOCOL) {
      return {
        valid: false,
        error: 'Website URL must use http or https protocol',
        code: 'URL_INVALID_PROTOCOL',
      }
    }

    if (!parsed.hostname || parsed.hostname.length < 3) {
      return {
        valid: false,
        error: 'Invalid hostname',
        code: 'URL_INVALID_HOSTNAME',
      }
    }

    // Block localhost and private IPs in production
    const hostname = parsed.hostname.toLowerCase()
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
    ]

    if (blockedHosts.includes(hostname)) {
      return {
        valid: false,
        error: 'Localhost URLs are not allowed',
        code: 'URL_LOCALHOST_BLOCKED',
      }
    }

    // Block private IP ranges (simple check)
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
      return {
        valid: false,
        error: 'Private IP addresses are not allowed',
        code: 'URL_PRIVATE_IP_BLOCKED',
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format', code: 'URL_PARSE_ERROR' }
  }
}

/**
 * Validates a GitHub repository URL
 */
export function validateGitHubUrl(url: string): ValidationResult {
  const baseValidation = validateUrl(url)
  if (!baseValidation.valid) {
    return baseValidation
  }

  try {
    const parsed = new URL(url.trim())

    if (parsed.hostname !== GITHUB_HOSTNAME) {
      return {
        valid: false,
        error: 'Only GitHub repositories are supported',
        code: 'URL_NOT_GITHUB',
      }
    }

    const pathParts = parsed.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) {
      return {
        valid: false,
        error: 'GitHub URL must be in format: https://github.com/owner/repo',
        code: 'URL_GITHUB_INVALID_FORMAT',
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid GitHub URL format', code: 'URL_PARSE_ERROR' }
  }
}

/**
 * Parses a GitHub URL to extract owner, repo, and branch
 */
export function parseGitHubUrl(url: string): GitHubParsedURL {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+?)(?:\/tree\/([^\/]+))?(?:\.git)?$/,
    /github\.com\/([^\/]+)\/([^\/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
        branch: match[3] || undefined,
        isValid: true,
      }
    }
  }

  return { owner: '', repo: '', isValid: false }
}

// ============== Rate Limiting ==============

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20
const MIN_REQUEST_INTERVAL_MS = 500 // 500ms between requests

interface RateLimitEntry {
  count: number
  windowStart: number
  lastRequestTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Simple in-memory rate limiter
 * Returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(clientId: string): {
  allowed: boolean
  retryAfter?: number
  remainingRequests?: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(clientId)

  // No previous requests from this client
  if (!entry) {
    rateLimitStore.set(clientId, {
      count: 1,
      windowStart: now,
      lastRequestTime: now,
    })
    return { allowed: true, remainingRequests: MAX_REQUESTS_PER_WINDOW - 1 }
  }

  // Reset window if expired
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientId, {
      count: 1,
      windowStart: now,
      lastRequestTime: now,
    })
    return { allowed: true, remainingRequests: MAX_REQUESTS_PER_WINDOW - 1 }
  }

  // Check minimum interval between requests
  if (now - entry.lastRequestTime < MIN_REQUEST_INTERVAL_MS) {
    return {
      allowed: false,
      retryAfter: MIN_REQUEST_INTERVAL_MS - (now - entry.lastRequestTime),
    }
  }

  // Check request count limit
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)
    return { allowed: false, retryAfter }
  }

  // Allow request
  entry.count++
  entry.lastRequestTime = now
  rateLimitStore.set(clientId, entry)

  return {
    allowed: true,
    remainingRequests: MAX_REQUESTS_PER_WINDOW - entry.count,
  }
}

/**
 * Clean up expired rate limit entries
 * Should be called periodically (e.g., every 5 minutes)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(key)
    }
  }
}
