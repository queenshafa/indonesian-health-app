import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Kesehatan Digital Indonesia - Platform Kesehatan untuk Semua',
  description: 'Platform kesehatan digital Indonesia dengan fitur booking dokter real-time, asisten BPJS, AI symptom checker, dan edukasi kesehatan harian. Dirancang untuk semua usia dan area.',
  keywords: 'kesehatan, dokter, BPJS, booking antrian, gejala, fasilitas kesehatan, Indonesia',
  generator: 'Kesehatan Digital Indonesia',
  applicationName: 'Kesehatan Digital',
  authors: [{ name: 'Dinas Kesehatan Indonesia' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Kesehatan Digital Indonesia',
    description: 'Platform kesehatan digital untuk semua Indonesia',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-background">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="description" content="Platform kesehatan digital Indonesia untuk booking dokter, BPJS assistant, AI symptom checker, dan edukasi kesehatan" />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
