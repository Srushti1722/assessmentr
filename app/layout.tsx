import './globals.css'
import type { Metadata } from 'next'
import { Settings, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication - Assessmentr',
  description: 'Master the Technical Interview',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="layout-wrapper">
          {children}
        </div>
        
        {/* Mobile-only footer for Settings & Help */}
        <footer className="mobile-only-footer">
          <button className="mobile-footer-btn" title="Settings">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="mobile-footer-btn" title="Help">
            <HelpCircle size={20} />
            <span>Help</span>
          </button>
        </footer>
      </body>
    </html>
  )
}
