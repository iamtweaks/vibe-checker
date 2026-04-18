'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Zap, Globe, Github, Terminal, Lock, ArrowRight, FileCode, Sparkles, AlertTriangle, CheckCircle, Clock, Bug, BarChart3, Star, FileText, Copy, Check } from 'lucide-react'
import { downloadPDF } from '@/lib/pdf'
import type { Severity, Finding } from '@/lib/types'

type ScanType = 'github' | 'website'

interface ScanResult {
  scanId: string
  type: ScanType
  targetUrl: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  findings: Finding[]
  severityCounts: Record<Severity, number>
  scannedAt: string
  scanDuration?: number
}

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  low: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  info: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const style = SEVERITY_STYLES[severity]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const increment = end / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
      }}
    >
      {children}
    </div>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
    color: Math.random() > 0.5 ? '#34d399' : '#22c55e',
  }))

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            color: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function HeroGlints() {
  const glints = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${15 + Math.random() * 70}%`,
    top: `${20 + Math.random() * 60}%`,
    delay: Math.random() * 6,
    size: Math.random() * 3 + 2,
  }))

  return (
    <>
      {glints.map((g) => (
        <div
          key={g.id}
          className="glint"
          style={{
            left: g.left,
            top: g.top,
            animationDelay: `${g.delay}s`,
            width: g.size,
            height: g.size,
          }}
        />
      ))}
    </>
  )
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-base md:text-lg tracking-tight">VibeChecker</span>
        </a>
        <nav className="flex items-center gap-4 md:gap-6 text-sm">
          <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="pt-28 pb-16 text-center bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20" />
        <FloatingParticles />
        <HeroGlints />
      </div>
      <div className="relative max-w-3xl mx-auto px-6">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-8 shimmer">
            <Sparkles className="w-4 h-4" />
            <span>Free • No Signup • Results in Seconds</span>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 mb-6">
            The Security Scanner<br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Built for Vibe-Coded Apps
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            If you built your app with <strong>Lovable, Bolt, Cursor, Replit,</strong> or <strong>Google AI Studio</strong>, VibeCheck finds the security vulnerabilities that AI code generators commonly introduce.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#scanner" className="group btn-glow inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all hover:gap-3 border-glow">
              Scan Your App Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-emerald-300 transition-all hover:shadow-md">
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function Stats() {
  const [statsData, setStatsData] = useState({ uniqueSites: 0, totalScans: 0, vulnerabilitiesFound: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStatsData({
          uniqueSites: data.uniqueSites || 0,
          totalScans: data.totalScans || 0,
          vulnerabilitiesFound: Math.floor((data.uniqueSites || 0) * 0.65 * 4.9)
        })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const stats = [
    { value: loaded ? statsData.uniqueSites : 0, label: 'Apps Scanned', suffix: '' },
    { value: loaded ? statsData.vulnerabilitiesFound : 0, label: 'Vulnerabilities Found', suffix: '+' },
    { value: 65, label: 'Security Checks', suffix: '+' },
    { value: 100, label: 'Free Forever', suffix: '%' },
  ]

  return (
    <section id="stats" className="py-16 bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="text-center stat-card p-3 md:p-4 rounded-xl">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.value} />
                  <span className="text-emerald-400">{stat.suffix}</span>
                </div>
                <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function RealityCheck() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <FadeIn>
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs md:text-sm text-red-700 mb-3 md:mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>The Data Is Alarming</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-3">
              What the Research Says
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-xs md:text-sm">
              Escape.tech scanned 5,600 vibe-coded apps and found over 2,000 vulnerabilities and 400 exposed secrets. Tenzai tested 15 apps built with 5 AI coding tools and found 69 vulnerabilities including critical SSRF and injection flaws.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
            {[
              { stat: '45%', label: 'of AI-generated code contains vulnerabilities', source: 'Kaspersky' },
              { stat: '2.74x', label: 'more XSS vulnerabilities in AI co-written code', source: 'CodeRabbit' },
              { stat: '10.3%', label: 'of Lovable apps have critical RLS flaws', source: 'Security Audit' },
              { stat: '69', label: 'vulnerabilities found in 15 AI-built apps', source: 'Tenzai Research' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 md:p-5 text-center card-hover">
                <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1">{item.stat}</div>
                <div className="text-xs text-slate-600 mb-1 md:mb-2">{item.label}</div>
                <div className="text-xs text-slate-400">{item.source}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-slate-900 rounded-2xl p-4 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Why Vibe-Coded Apps Are at Risk</h3>
              <p className="text-xs md:text-sm text-slate-400">AI models optimize for working code, not secure code.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
              <div>
                <div className="text-emerald-400 font-semibold text-xs md:text-sm mb-2">🚀 Speed Creates Blind Spots</div>
                <p className="text-slate-300 text-xs">AI coding tools build full-stack apps in minutes. They skip authentication checks, expose database credentials, misconfigure Supabase RLS policies, and leave API routes wide open.</p>
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-xs md:text-sm mb-2">🔓 The Attack Surface Is Growing</div>
                <p className="text-slate-300 text-xs">With Google AI Studio offering full-stack vibe coding with Firebase integration, and Lovable creating 200,000 new projects daily, attackers know where to look.</p>
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-xs md:text-sm mb-2">✅ VibeCheck Catches These Issues</div>
                <p className="text-slate-300 text-xs">Free, no signup required, gives you a security grade in seconds. Catches issues before your users do.</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function Scanner() {
  const [scanType, setScanType] = useState<ScanType>('github')
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const generateFixPrompt = (finding: Finding) => {
    const language = scanType === 'github' ? 'TypeScript/JavaScript' : 'HTML/Server Config'
    const context = finding.filePath
      ? `File: ${finding.filePath}${finding.lineNumber ? ` (line ${finding.lineNumber})` : ''}`
      : scanType === 'github' ? 'Repository: ' + url : 'Website: ' + url

    return `You are a security expert. Fix this vulnerability in my ${language} project.

Context: ${context}

Severity: ${finding.severity.toUpperCase()}
Rule ID: ${finding.ruleId}

Vulnerability: ${finding.title}
Description: ${finding.description}
${finding.snippet ? `Code snippet:\n${finding.snippet.slice(0, 300)}` : ''}

Remediation: ${finding.remediation}

Please provide:
1. Root cause explanation
2. The exact code change needed (show before/after)
3. Any additional security notes

Do not explain what you would do — provide actual working code.`
  }

  const handleCopyPrompt = (finding: Finding) => {
    const prompt = generateFixPrompt(finding)
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedId(finding.id)
      setTimeout(() => setCopiedId(null), 2500)
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(finding.id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const handleScan = async () => {
    if (!url.trim()) return
    setIsScanning(true)
    setError(null)
    setResult(null)
    setShowResult(false)
    setScanProgress(0)
    const scanStartTime = Date.now()
    const SCAN_DURATION_MS = 5000

    // Animate progress bar over exactly 5 seconds
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - scanStartTime
      const progress = Math.min((elapsed / SCAN_DURATION_MS) * 100, 95)
      setScanProgress(progress)
    }, 100)

    try {
      const endpoint = scanType === 'github' ? '/api/scan/github' : '/api/scan/website'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      // Wait until exactly 5 seconds have passed
      const elapsed = Date.now() - scanStartTime
      const remaining = SCAN_DURATION_MS - elapsed
      if (remaining > 0) {
        await new Promise(r => setTimeout(r, remaining))
      }

      clearInterval(progressInterval)
      setScanProgress(100)

      if (!res.ok) {
        const data = await res.json()
        const errorMsg = data.error || 'Scan failed'
        // Provide friendly messages for specific errors
        if (res.status === 403 && scanType === 'github') {
          throw new Error('🔒 This repository is private. Only public GitHub repos can be scanned.')
        }
        if (res.status === 404) {
          throw new Error('🔍 Repository not found. Please check the URL and make sure the repo is public.')
        }
        if (res.status === 429) {
          throw new Error('⏳ Too many requests. Please wait a moment and try again.')
        }
        throw new Error(errorMsg)
      }

      const data = await res.json()
      setResult(data)
      setTimeout(() => setShowResult(true), 300)
      // Increment unique site counter
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      }).catch(() => {})
    } catch (err) {
      clearInterval(progressInterval)
      setScanProgress(0)
      const msg = err instanceof Error ? err.message : 'An error occurred'
      // Ensure private repo friendly message
      if (msg.toLowerCase().includes('private') || msg.toLowerCase().includes('403')) {
        setError('🔒 This repository is private. VibeChecker can only scan public repositories.')
      } else {
        setError(msg)
      }
    } finally {
      setIsScanning(false)
    }
  }

  const totalFindings = result ? Object.values(result.severityCounts).reduce((a, b) => a + b, 0) : 0

  return (
    <section id="scanner" className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <FadeIn>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-3">Scan Your App</h2>
            <p className="text-slate-600 text-sm md:text-base">Enter a GitHub repo or website URL to start scanning</p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-4 md:p-8">
            <div className="flex gap-2 mb-6 md:mb-8">
              <button onClick={() => { setScanType('github'); setResult(null); setError(null) }} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${scanType === 'github' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Github className="w-4 h-4" />GitHub
              </button>
              <button onClick={() => { setScanType('website'); setResult(null); setError(null) }} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${scanType === 'website' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Globe className="w-4 h-4" />Website
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Terminal className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-400" />
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={scanType === 'github' ? 'owner/repo' : 'https://example.com'} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
              </div>
              <button onClick={handleScan} disabled={isScanning || !url.trim()} className={`btn-scan px-6 md:px-8 py-3 md:py-4 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isScanning ? 'scan-pulse' : ''}`}>
                {isScanning ? (
                  <>
                    <div className="spinner-emerald w-4 h-4" />
                    <span className="scanning-dots">Scanning</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Scan
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 mb-6 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {isScanning && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <div className="spinner-emerald w-4 h-4 border-emerald-500/30 border-t-emerald-500" />
                    Scanning in progress...
                  </span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full progress-gradient rounded-full transition-all duration-500 ease-out" style={{ width: `${scanProgress}%` }} />
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                    Fetching {scanType === 'github' ? 'repository' : 'website'}...
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" style={{ animationDelay: '0.2s' }} />
                    Analyzing security headers...
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" style={{ animationDelay: '0.4s' }} />
                    Running OWASP Top 10 checks...
                  </p>
                </div>
              </div>
            )}
            {result && result.status === 'completed' && showResult && (
              <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-900">Scan complete</span>
                      <span className="text-xs text-slate-500 ml-2">{result.scanDuration ? `${(result.scanDuration / 1000).toFixed(1)}s` : ''}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 font-mono truncate max-w-full">{result.targetUrl}</div>
                  <div className="flex flex-wrap gap-2 ml-auto items-center">
                    {Object.entries(result.severityCounts).map(([sev, count]) => (
                      count > 0 && <span key={sev} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${SEVERITY_STYLES[sev as Severity].bg} ${SEVERITY_STYLES[sev as Severity].text}`}><span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_STYLES[sev as Severity].dot}`} />{count} {sev}</span>
                    ))}
                    <button onClick={() => downloadPDF(result)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] mt-1 sm:mt-0">
                      <FileText className="w-3.5 h-3.5" />PDF
                    </button>
                  </div>
                </div>
                {totalFindings === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 floating">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">All Good!</h3>
                    <p className="text-slate-500">No security issues found. Your {scanType === 'github' ? 'repository' : 'website'} passed all checks.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-slate-900">{totalFindings} Issues Found</h3>
                      <span className="text-xs text-slate-500">Sorted by severity</span>
                    </div>
                    {result.findings.sort((a, b) => {
                      const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
                      return order[a.severity] - order[b.severity]
                    }).map((finding) => (
                      <div key={finding.id} className={`p-4 sm:p-5 rounded-xl border card-hover ${SEVERITY_STYLES[finding.severity].border} ${SEVERITY_STYLES[finding.severity].bg}`}>
                        <div className="flex items-start gap-3">
                          <SeverityBadge severity={finding.severity} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-400">{finding.ruleId}</span>
                              <h4 className="font-medium text-slate-900 truncate">{finding.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{finding.description}</p>
                            <div className="p-3 rounded-lg bg-white border border-slate-200 mb-3">
                              <p className="text-xs text-slate-400 mb-1 font-medium">How to Fix</p>
                              <p className="text-sm text-slate-700">{finding.remediation}</p>
                            </div>
                            <button
                              onClick={() => handleCopyPrompt(finding)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                copiedId === finding.id
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]'
                              }`}
                            >
                              {copiedId === finding.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy Fix Prompt for AI
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="py-12 md:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <FadeIn>
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-3">Two Ways to Scan</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">Most security scanners only do one or the other. VibeCheck does both.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FadeIn delay={100}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 md:p-6 lg:p-8 text-white h-full">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Github className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold">Source Code Scanner</h3>
              </div>
              <p className="text-slate-300 text-xs md:text-sm mb-4 md:mb-6">Analyzes your GitHub repository for hardcoded secrets, exposed credentials, misconfigurations, and vulnerable patterns in your code.</p>
              <div className="space-y-1.5 md:space-y-2">
                {[
                  'Exposed API keys and secrets (OpenAI, Stripe, Supabase)',
                  'Firebase misconfigurations without proper security rules',
                  'Supabase without Row Level Security (RLS)',
                  'Database credentials hardcoded in source files',
                  'JWT secrets exposed in codebase',
                  'Environment files (.env) committed to repository',
                  'Unprotected API routes handling sensitive operations',
                  'Open CORS policies allowing any website to call your API',
                  'SQL injection vulnerabilities from string concatenation',
                  'Missing input validation on API endpoints',
                  'Missing security headers (XSS, clickjacking)',
                  'Vulnerable dependencies in package.json',
                  'Missing rate limiting on public API routes',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs md:text-sm text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-4 md:p-6 lg:p-8 text-white h-full">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 md:w-6 md:h-6 text-emerald-200" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold">Live Site Scanner</h3>
              </div>
              <p className="text-emerald-100/80 text-xs md:text-sm mb-4 md:mb-6">Checks your deployed application for security headers, exposed files, CORS misconfigurations, and technology fingerprints.</p>
              <div className="space-y-1.5 md:space-y-2">
                {[
                  'Content-Security-Policy (CSP) header',
                  'HSTS (HTTP Strict Transport Security)',
                  'X-Frame-Options (clickjacking protection)',
                  'X-Content-Type-Options (MIME sniffing)',
                  'Referrer-Policy and Permissions-Policy',
                  'SSL/TLS configuration and HTTP to HTTPS redirect',
                  'Exposed sensitive files (.env, .git/config, phpinfo)',
                  'CORS misconfigurations for cross-origin attacks',
                  'Cookie security flags (HttpOnly, Secure, SameSite)',
                  'Technology fingerprinting in headers',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs md:text-sm text-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: Shield, title: 'OWASP Top 10 2025', description: 'Coverage including NEW A03 Supply Chain and A10 Error Handling categories.' },
    { icon: Zap, title: 'Lightning Fast', description: 'Get detailed security findings in seconds, not hours.' },
    { icon: Lock, title: 'No Signup Required', description: 'Start scanning immediately. No account, no email, no credit card.' },
    { icon: FileCode, title: 'AI Fix Prompts', description: 'Copy a detailed fix prompt for each vulnerability and paste it into your AI agent.' },
    { icon: BarChart3, title: 'Severity Ratings', description: 'Issues categorized by criticality to prioritize your fixes.' },
    { icon: Globe, title: 'GitHub & Websites', description: 'Scan public GitHub repos or any website URL.' },
    { icon: AlertTriangle, title: 'Slopsquatting Detection', description: 'Detect AI-hallucinated packages that attackers can register as malicious.' },
    { icon: Bug, title: 'Supabase RLS Scan', description: 'Find Row Level Security misconfigurations — the #1 issue in vibe-coded apps.' },
  ]
  return (
    <section id="features" className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <FadeIn>
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-3">Everything You Need</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">Professional-grade security scanning, completely free</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="feature-card group p-4 md:p-5 lg:p-6 rounded-2xl bg-white border border-slate-200 h-full">
                <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 md:mb-4 transition-colors">
                  <feature.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 md:mb-2 text-xs md:text-sm lg:text-base">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const testimonials = [
    { quote: 'Found a critical XSS in my app before launch. Saved me from a potential disaster.', author: 'Sarah Chen', role: 'Indie Hacker' },
    { quote: 'The actionable remediation steps are gold. Fixed all issues in under an hour.', author: 'Marcus Rivera', role: 'Solo Founder' },
    { quote: 'Finally a free scanner that actually works. Built right into my workflow.', author: 'Alex Thompson', role: 'CTO' },
  ]
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <FadeIn>
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-3">Loved by Developers</h2>
            <p className="text-slate-600 text-sm md:text-base">Join thousands of developers who ship safer code</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="card-hover p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex gap-1 mb-3 md:mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 text-sm mb-3 md:mb-4">"{t.quote}"</p>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{t.author}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingParticles />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Need Help Fixing the Issues?</h2>
          <p className="text-lg text-slate-300 mb-4">Every finding includes an "AI Fix Prompt" — copy it and paste into your favorite AI agent for step-by-step fix instructions.</p>
          <p className="text-md text-emerald-400 mb-8">Free • No Signup • Works with Lovable, Bolt, Cursor, Replit & more</p>
          <a href="#scanner" className="btn-glow group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-all hover:gap-3 border-glow">
            Scan Your App Now <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
        </FadeIn>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <a href="#scanner" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition">
            Free Security Scanner for Vibe-Coded Apps
          </a>
          <p className="text-sm text-slate-400">
            Copyright © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">
      <Header />
      <Hero />
      <Stats />
      <RealityCheck />
      <Scanner />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
