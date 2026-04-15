import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VibeChecker - Free Vibe Coding Security Scanner',
  description: 'Free security scanner for vibe-coded apps. Find critical vulnerabilities before they become breaches.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-[#fafafa] antialiased">
        {children}
      </body>
    </html>
  )
}
