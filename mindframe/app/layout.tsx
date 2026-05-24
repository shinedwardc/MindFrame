import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindFrame',
  description: 'CBT-powered mood journal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
