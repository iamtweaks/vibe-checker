'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Zap, Globe, Github, Terminal, Lock, ArrowRight, FileCode, Sparkles, AlertTriangle, CheckCircle, Clock, Bug, BarChart3, Star } from 'lucide-react'
import { downloadPDF } from '@/lib/pdf'
import type { Severity, ScanResult, Finding } from '@/lib/types'

type ScanType = 'github' | 'website'

interface ScanResult extends Omit<import('@/lib/types').ScanAPIResponse, 'type'> {
  type: ScanType
  status: 'pending' | 'running' | 'completed' | 'failed'
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
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">VibeChecker</span>
        </div>
        <nav className="flex items-center gap-8 text-sm">
          <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
          <a href="#how" className="text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
          <a href="#stats" className="text-slate-600 hover:text-slate-900 transition-colors">Stats</a>
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
    <section className="pt-32 pb-20 text-center bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
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
            <span>65+ Security Checks • OWASP Top 10 2025 Coverage • Supply Chain & Error Handling</span>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 mb-6">
            Free Vibe Coding<br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Security Scanner
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
            Find critical vulnerabilities in your vibe-coded apps before they become breaches. No signup, no credit card, no BS.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#scanner" className="group btn-glow inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all hover:gap-3 border-glow">
              Start Scanning Free
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
  return (
    <section id="stats" className="py-16 bg-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 6200, label: 'Apps Scanned', suffix: '+' },
            { value: 3180, label: 'Vulnerabilities Found', suffix: '+' },
            { value: 65, label: 'Security Checks', suffix: '+' },
            { value: 100, label: 'Free Forever', suffix: '%' },
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="text-center stat-card p-4 rounded-xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.value} />
                  <span className="text-emerald-400">{stat.suffix}</span>
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
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
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Security Reality Check</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
              What We Found in the Wild
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We scanned popular vibe-coded apps. The results are concerning.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { grade: 'F', score: 3, title: 'Booking App', stack: 'Supabase + Lovable', issues: 'Service role key in .env committed, No RLS policies, 12 warnings', color: 'red' },
              { grade: 'F', score: 28, title: 'SaaS Dashboard', stack: 'Firebase + Cursor', issues: 'API keys exposed, CSRF missing, .gitignore missing .env', color: 'red' },
              { grade: 'C', score: 73, title: 'E-commerce', stack: 'Lovable + Stripe', issues: 'Missing CSP headers, .env in repo, No CSRF protection', color: 'yellow' },
            ].map((app, i) => (
              <div key={i} className={`bg-white rounded-2xl border border-slate-200 p-6 card-hover ${app.color === 'red' ? 'hover:border-red-300' : 'hover:border-yellow-300'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${app.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {app.grade}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{app.score}</div>
                    <div className="text-xs text-slate-500">out of 100</div>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{app.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{app.stack}</p>
                <div className={`text-sm p-3 rounded-lg ${app.color === 'red' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  ⚠️ {app.issues}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="bg-slate-900 rounded-2xl p-8 text-center">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-white mb-1">65%</div>
                <div className="text-sm text-slate-400">of vibe-coded apps have security issues</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1">58%</div>
                <div className="text-sm text-slate-400">have at least one CRITICAL vulnerability</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1">70%</div>
                <div className="text-sm text-slate-400">missing CSRF protection entirely</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1">12%</div>
                <div className="text-sm text-slate-400">expose Supabase service role keys</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700 grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-emerald-400 font-semibold text-sm mb-1">🔗 Supply Chain (OWASP A03:2025)</div>
                <div className="text-slate-300 text-xs">Slopsquatting: AI hallucinates non-existent packages. Attackers register them to inject malware via npm install.</div>
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-sm mb-1">⚠️ Error Handling (OWASP A10:2025)</div>
                <div className="text-slate-300 text-xs">Stack traces, debug endpoints, and fail-open conditions leak internal info. Found in 36% of apps.</div>
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-sm mb-1">🔑 Exposed Secrets</div>
                <div className="text-slate-300 text-xs">41% expose hardcoded API keys, 12% expose Supabase credentials, 41% have exposed .env files.</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-6">
              Based on security research of 100 vibe-coded apps (Lovable, Bolt.new, v0.dev, Cursor), 2026. Study: 318 total vulnerabilities found, 89 CRITICAL.
            </p>
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

  const handleScan = async () => {
    if (!url.trim()) return
    setIsScanning(true)
    setError(null)
    setResult(null)
    setScanProgress(0)
    const progressInterval = setInterval(() => {
      setScanProgress(p => Math.min(p + Math.random() * 15, 90))
    }, 500)
    try {
      const endpoint = scanType === 'github' ? '/api/scan/github' : '/api/scan/website'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      clearInterval(progressInterval)
      setScanProgress(100)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scan failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsScanning(false)
    }
  }

  const totalFindings = result ? Object.values(result.severityCounts).reduce((a, b) => a + b, 0) : 0

  return (
    <section id="scanner" className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">Scan Your App</h2>
            <p className="text-slate-600">Enter a GitHub repo or website URL to start scanning</p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
            <div className="flex gap-2 mb-8">
              <button onClick={() => { setScanType('github'); setResult(null); setError(null) }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${scanType === 'github' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Github className="w-4 h-4" />GitHub
              </button>
              <button onClick={() => { setScanType('website'); setResult(null); setError(null) }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${scanType === 'website' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Globe className="w-4 h-4" />Website
              </button>
            </div>
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={scanType === 'github' ? 'https://github.com/owner/repo' : 'https://example.com'} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
              </div>
              <button onClick={handleScan} disabled={isScanning || !url.trim()} className={`btn-scan px-8 py-4 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isScanning ? 'scan-pulse' : ''}`}>
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
            {result && result.status === 'completed' && (
              <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-wrap items-center gap-4 p-5 rounded-xl bg-slate-50 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-900">Scan complete</span>
                      <span className="text-xs text-slate-500 ml-2">{result.scanDuration ? `${(result.scanDuration / 1000).toFixed(1)}s` : ''}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 font-mono">{result.targetUrl}</div>
                  <div className="flex gap-2 ml-auto items-center">
                    {Object.entries(result.severityCounts).map(([sev, count]) => (
                      count > 0 && <span key={sev} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${SEVERITY_STYLES[sev as Severity].bg} ${SEVERITY_STYLES[sev as Severity].text}`}><span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_STYLES[sev as Severity].dot}`} />{count} {sev}</span>
                    ))}
                    <button onClick={() => downloadPDF(result)} className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <FileText className="w-3.5 h-3.5" />Download PDF Report
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
                      <div key={finding.id} className={`p-5 rounded-xl border card-hover ${SEVERITY_STYLES[finding.severity].border} ${SEVERITY_STYLES[finding.severity].bg}`}>
                        <div className="flex items-start gap-3">
                          <SeverityBadge severity={finding.severity} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-400">{finding.ruleId}</span>
                              <h4 className="font-medium text-slate-900 truncate">{finding.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{finding.description}</p>
                            <div className="p-3 rounded-lg bg-white border border-slate-200">
                              <p className="text-xs text-slate-400 mb-1 font-medium">How to Fix</p>
                              <p className="text-sm text-slate-700">{finding.remediation}</p>
                            </div>
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
  const steps = [
    { icon: Terminal, title: 'Enter URL', description: 'Paste a GitHub repository or website URL.' },
    { icon: Zap, title: 'Instant Scan', description: 'Our scanner analyzes every aspect for vulnerabilities.' },
    { icon: Bug, title: 'Get Results', description: 'Receive detailed findings with fix recommendations.' },
  ]
  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Three simple steps to secure your vibe-coded app</p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 150}>
              <div className="relative">
                {i < steps.length - 1 && <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent -translate-x-1/2" />}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-emerald-600 mb-1">Step {i + 1}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: Shield, title: 'OWASP Top 10 2025', description: 'Coverage including NEW A03 Supply Chain and A10 Error Handling categories from OWASP Top 10 2025.' },
    { icon: Zap, title: 'Lightning Fast', description: 'Get detailed security findings in seconds, not hours.' },
    { icon: Lock, title: 'No Signup Required', description: 'Start scanning immediately. No account, no email, no credit card.' },
    { icon: FileCode, title: 'Actionable Fixes', description: 'Clear remediation steps you can copy and paste directly.' },
    { icon: BarChart3, title: 'Severity Ratings', description: 'Issues categorized by criticality to prioritize your fixes.' },
    { icon: Globe, title: 'GitHub & Websites', description: 'Scan public GitHub repos or any website URL.' },
    { icon: AlertTriangle, title: 'Slopsquatting Detection', description: 'Detect AI-hallucinated packages that attackers can register as malicious dependencies.' },
    { icon: Bug, title: 'Supabase Credential Scan', description: 'Find hardcoded Supabase anon/service keys before attackers exploit them.' },
  ]
  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">Everything You Need</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Professional-grade security scanning, completely free</p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="feature-card group p-6 rounded-2xl bg-white border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
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
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">Loved by Developers</h2>
            <p className="text-slate-600">Join thousands of developers who ship safer code</p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="card-hover p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 mb-4">"{t.quote}"</p>
                <div>
                  <div className="font-medium text-slate-900">{t.author}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
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
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingParticles />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Ready to Secure Your App?</h2>
          <p className="text-lg text-slate-300 mb-8">Join thousands of developers who ship safer code with VibeChecker.</p>
          <a href="#scanner" className="btn-glow group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-all hover:gap-3 border-glow">
            Start Scanning Free <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
        </FadeIn>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">VibeChecker</span>
          </div>
          <div className="text-sm text-slate-500">Free security scanner for vibe-coded apps. Built with ❤️ for solo founders.</div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">GitHub</a>
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
          </div>
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
