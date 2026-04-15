'use client'

import { useState } from 'react'
import { Shield, Zap, AlertTriangle, CheckCircle, Globe, Github, Terminal, ChevronRight, Lock, ArrowRight, FileCode, Sparkles } from 'lucide-react'

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
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  info: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const style = SEVERITY_STYLES[severity]
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
      {severity}
    </span>
  )
}

function Header() {
  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-emerald-400" />
          <span className="font-mono font-bold text-xl tracking-tight">VibeChecker</span>
        </div>
        <nav className="flex items-center gap-8 text-sm">
          <a href="#scanner" className="text-zinc-400 hover:text-white transition">Scanner</a>
          <a href="#features" className="text-zinc-400 hover:text-white transition">Features</a>
          <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition">
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="py-24 text-center">
      <div className="max-w-3xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-400 mb-8">
          <Sparkles className="w-4 h-4" />
          <span>50+ Security Checks • Free Forever</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-mono font-bold tracking-tight mb-6">
          Free Vibe Coding<br />
          <span className="text-emerald-400">Security Scanner</span>
        </h1>
        
        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Find critical vulnerabilities in your Lovable, Cursor, and Bolt projects before they become breaches. No signup required.
        </p>
        
        <a 
          href="#scanner" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
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
    <section id="scanner" className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8">
          {/* Tab switcher */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => { setScanType('github'); setResult(null); setError(null) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm transition ${
                scanType === 'github' 
                  ? 'bg-emerald-500 text-black' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
            <button
              onClick={() => { setScanType('website'); setResult(null); setError(null) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm transition ${
                scanType === 'website' 
                  ? 'bg-emerald-500 text-black' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              Website
            </button>
          </div>
          
          {/* Input */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={scanType === 'github' 
                  ? 'https://github.com/owner/repo' 
                  : 'https://example.com'}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning || !url.trim()}
              className="px-6 py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Scanning
                </>
              ) : (
                <>Scan <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="font-mono text-sm">{error}</span>
            </div>
          )}
          
          {/* Scanning animation */}
          {isScanning && (
            <div className="space-y-3 font-mono text-sm text-zinc-500">
              <p><span className="text-emerald-400">›</span> Initializing scanner...</p>
              <p><span className="text-emerald-400">›</span> Fetching {scanType === 'github' ? 'repository' : 'website'}...</p>
              <p><span className="text-emerald-400">›</span> Running security checks<span className="animate-pulse">_</span></p>
              <div className="h-1.5 bg-zinc-900 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
          
          {/* Results */}
          {result && result.status === 'completed' && (
            <div className="mt-8 pt-8 border-t border-zinc-800">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-zinc-900/50 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-sm">Scan complete</span>
                </div>
                <div className="text-sm text-zinc-500 font-mono">{result.targetUrl}</div>
                <div className="flex gap-2 ml-auto">
                  {Object.entries(result.severityCounts).map(([sev, count]) => (
                    count > 0 && (
                      <span key={sev} className={`px-2 py-0.5 rounded text-xs font-mono ${SEVERITY_STYLES[sev as Severity].bg} ${SEVERITY_STYLES[sev as Severity].text}`}>
                        {count} {sev}
                      </span>
                    )
                  ))}
                </div>
              </div>
              
              {/* Findings */}
              {totalFindings === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-mono font-bold mb-2">No issues found!</h3>
                  <p className="text-zinc-500">This {scanType === 'github' ? 'repository' : 'website'} looks clean.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.findings.map((finding) => (
                    <div key={finding.id} className={`p-5 rounded-xl border ${SEVERITY_STYLES[finding.severity].border} ${SEVERITY_STYLES[finding.severity].bg}`}>
                      <div className="flex items-start gap-3">
                        <SeverityBadge severity={finding.severity} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-zinc-500">{finding.ruleId}</span>
                            <h4 className="font-semibold">{finding.title}</h4>
                          </div>
                          <p className="text-sm text-zinc-400 mb-3">{finding.description}</p>
                          {finding.filePath && (
                            <div className="font-mono text-xs text-zinc-500 mb-2">
                              {finding.filePath}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
                            </div>
                          )}
                          {finding.snippet && (
                            <pre className="text-xs bg-black/50 p-3 rounded-lg overflow-x-auto mb-3 font-mono text-red-300">
                              {finding.snippet}
                            </pre>
                          )}
                          <div className="p-3 rounded-lg bg-black/30 border border-zinc-700/50">
                            <p className="text-xs text-zinc-500 mb-1">Fix:</p>
                            <p className="text-sm text-emerald-400 font-mono">{finding.remediation}</p>
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
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      title: 'Instant Results',
      description: 'Get detailed security findings in seconds.',
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: 'No Signup',
      description: 'Start scanning immediately. No account required.',
    },
    {
      icon: <FileCode className="w-5 h-5 text-emerald-400" />,
      title: 'Actionable Fixes',
      description: 'Copy-paste remediation steps to fix fast.',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      title: 'OWASP Top 10',
      description: 'Coverage for the most critical web app risks.',
    },
  ]

  return (
    <section id="features" className="py-20 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 hover:border-zinc-700 transition">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-mono font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-mono font-bold">VibeChecker</span>
          </div>
          <div className="text-sm text-zinc-500">
            Free security scanner for vibe-coded apps.
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="https://github.com/iamtweaks/vibe-checker" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
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
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <Scanner />
      <Features />
      <Footer />
    </main>
  )
}
