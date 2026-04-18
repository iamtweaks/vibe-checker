/**
 * Shared TypeScript interfaces for VibeChecker scanners
 * Centralizes types to ensure consistency across scanners, API routes, and PDF generation
 */

// ============== Core Types ==============

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Finding {
  id: string
  ruleId: string
  severity: Severity
  title: string
  description: string
  filePath?: string
  lineNumber?: number
  snippet?: string
  remediation: string
}

export interface SeverityCounts {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

// ============== Scanner Results ==============

export interface WebsiteScanResult {
  findings: Finding[]
  severityCounts: SeverityCounts
  scannedUrls: number
  scanDuration: number
}

export interface GitHubScanResult {
  findings: Finding[]
  severityCounts: SeverityCounts
  scannedFiles: number
  scanDuration?: number
}

// ============== API Types ==============

export interface ScanAPIRequest {
  url: string
  githubToken?: string
}

export interface ScanAPIResponse {
  scanId: string
  type: 'github' | 'website'
  targetUrl: string
  status: 'completed' | 'failed'
  findings: Finding[]
  severityCounts: SeverityCounts
  scannedAt: string
  scannedUrls?: number
  scannedFiles?: number
  scanDuration?: number
  error?: never
}

export interface ScanAPIError {
  error: string
  code?: string
  details?: Record<string, string>
}

// ============== Input Validation ==============

export interface ValidationResult {
  valid: boolean
  error?: string
  code?: string
}

// ============== Rate Limiting ==============

export interface RateLimitState {
  lastRequestTime: number
  requestCount: number
}

// ============== Utility Types ==============

export interface ParsedURL {
  url: string
  hostname: string
  pathname: string
  protocol: string
}

export interface GitHubParsedURL {
  owner: string
  repo: string
  branch?: string
  isValid: boolean
}
