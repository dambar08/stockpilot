import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { StoreProvider } from '@/lib/store'
import { AdminProvider } from '@/lib/admin'
import { I18nProvider } from '@/lib/i18n/context'
import { AppShell } from '@/components/app-shell'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Stockpilot — Inventory & Order Management',
  description:
    'Track inventory across warehouses, manage sales and purchase orders, invoicing, payments, and reporting.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(0.985 0.004 264)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(0.19 0.02 271)' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <I18nProvider>
          <AuthProvider>
            <AdminProvider>
              <StoreProvider>
                <AppShell>{children}</AppShell>
              </StoreProvider>
            </AdminProvider>
          </AuthProvider>
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
