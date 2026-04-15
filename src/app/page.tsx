'use client'

import { useState } from 'react'
import { Shield, Zap, Globe, Github, Terminal, ChevronRight, Lock, ArrowRight, FileCode, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'

type ScanType = 'github' | 'website'
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

interface Finding {
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

interface ScanResult {
  scanId: string
  type: ScanType
  targetUrl: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  findings: Finding[]
  severityCounts: Record<Severity, number>
  scannedAt: string
}

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  info: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const style = SEVERITY_STYLES[severity]
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
      {severity}
    </span>
  )
}

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-emerald-500" />
          <span className="font-semibold text-lg tracking-tight">VibeChecker</span>
        </div>
        <nav className="flex items-center gap-8 text-sm text-slate-600">
          <a href="#scanner" className="hover:text-slate-900 transition">Scanner</a>
          <a href="#features" className="hover:text-slate-900 transition">Features</a>
          <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="py-20 text-center bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-6">
          <Sparkles className="w-4 h-4" />
          <span>50+ Security Checks • Free Forever</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
          Free Vibe Coding<br />
          <span className="text-emerald-600">Security Scanner</span>
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Find critical vulnerabilities in your vibe-coded apps before they become breaches. No signup, no credit card.
        </p>
        
        <a 
          href="#scanner" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
        >
          Start Scanning <ChevronRight className="w-5 h-5" />
        </a>
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

  const handleScan = async () => {
    if (!url.trim()) return
    
    setIsScanning(true)
    setError(null)
    setResult(null)
    
    try {
      const endpoint = scanType === 'github' ? '/api/scan/github' : '/api/scan/website'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scan failed')
      }
      
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsScanning(false)
    }
  }

  const totalFindings = result ? Object.values(result.severityCounts).reduce((a, b) => a + b, 0) : 0

  return (
    <section id="scanner" className="py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => { setScanType('github'); setResult(null); setError(null) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                scanType === 'github' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
            <button
              onClick={() => { setScanType('website'); setResult(null); setError(null) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                scanType === 'website' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              Website
            </button>
          </div>
          
          {/* Input */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={scanType === 'github' 
                  ? 'https://github.com/owner/repo' 
                  : 'https://example.com'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning || !url.trim()}
              className="px-6 py-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning
                </>
              ) : (
                <>Scan <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* Scanning animation */}
          {isScanning && (
            <div className="space-y-3 text-sm text-slate-500">
              <p><span className="text-emerald-500">›</span> Initializing scanner...</p>
              <p><span className="text-emerald-500">›</span> Fetching {scanType === 'github' ? 'repository' : 'website'}...</p>
              <p><span className="text-emerald-500">›</span> Running security checks<span className="animate-pulse">_</span></p>
              <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
          
          {/* Results */}
          {result && result.status === 'completed' && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">Scan complete</span>
                </div>
                <div className="text-sm text-slate-500">{result.targetUrl}</div>
                <div className="flex gap-2 ml-auto">
                  {Object.entries(result.severityCounts).map(([sev, count]) => (
                    count > 0 && (
                      <span key={sev} className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[sev as Severity].bg} ${SEVERITY_STYLES[sev as Severity].text}`}>
                        {count} {sev}
                      </span>
                    )
                  ))}
                </div>
              </div>
              
              {/* Findings */}
              {totalFindings === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No issues found!</h3>
                  <p className="text-slate-500">This {scanType === 'github' ? 'repository' : 'website'} looks clean.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.findings.map((finding) => (
                    <div key={finding.id} className={`p-5 rounded-xl border ${SEVERITY_STYLES[finding.severity].border} ${SEVERITY_STYLES[finding.severity].bg}`}>
                      <div className="flex items-start gap-3">
                        <SeverityBadge severity={finding.severity} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-400">{finding.ruleId}</span>
                            <h4 className="font-medium text-slate-900">{finding.title}</h4>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{finding.description}</p>
                          {finding.filePath && (
                            <div className="text-xs text-slate-400 mb-2 font-mono">
                              {finding.filePath}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
                            </div>
                          )}
                          {finding.snippet && (
                            <pre className="text-xs bg-slate-900 text-red-300 p-3 rounded-lg overflow-x-auto mb-3 font-mono">
                              {finding.snippet}
                            </pre>
                          )}
                          <div className="p-3 rounded-lg bg-white border border-slate-200">
                            <p className="text-xs text-slate-400 mb-1">Fix:</p>
                            <p className="text-sm text-emerald-600 font-medium">{finding.remediation}</p>
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
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      title: 'Instant Results',
      description: 'Get detailed security findings in seconds.',
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-500" />,
      title: 'No Signup',
      description: 'Start scanning immediately. No account required.',
    },
    {
      icon: <FileCode className="w-5 h-5 text-emerald-500" />,
      title: 'Actionable Fixes',
      description: 'Copy-paste remediation steps to fix fast.',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      title: 'OWASP Top 10',
      description: 'Coverage for the most critical web app risks.',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">VibeChecker</span>
          </div>
          <div className="text-sm text-slate-500">
            Free security scanner for vibe-coded apps.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">
              GitHub
            </a>
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
      <Scanner />
      <Features />
      <Footer />
    </main>
  )
}
