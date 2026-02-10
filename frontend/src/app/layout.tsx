import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RAPEX - E-Commerce & Delivery',
  description: 'RAPEX E-Commerce & Delivery Platform - Shop, Sell, and Deliver with Ease',
  keywords: ['e-commerce', 'delivery', 'marketplace', 'shopping'],
  authors: [{ name: 'RAPEX Team' }],
}

export const viewport: Viewport = {
  themeColor: '#f97316',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
