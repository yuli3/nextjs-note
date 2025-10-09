import type { Metadata } from "next";
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import './tailwind.generated.css'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleAdSense } from "@/components/adsense";

export const metadata: Metadata = {
  title: 'AHOXY Note, Online Notepad, Fast and Easy to use',
  description: 'AHOXY Note Simple Web-Based Free',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  openGraph: {
    title: 'AHOXY Note',
    description: 'AHOXY Note Simple Web-based Free',
    url: 'https://note.ahoxy.com',
  },
  twitter: {
    card: 'summary',
    title: 'AHOXY Note',
    description: 'AHOXY Note Simple Web-Based Free',
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://note.ahoxy.com',
  },
  other: {
    'X-UA-Compatible': 'IE=edge',
    'language': 'en',
    'yeti' : 'index, follow',
    'googlebot' : 'index, follow',
    'bingbot':  'index, follow',
    'yandexbot':  'index, follow',
    'pinterest': 'index, follow',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <div className="liquid-background" aria-hidden />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <NuqsAdapter>
              <div className="relative z-10 flex min-h-screen flex-col">
                {children}
              </div>
            </NuqsAdapter>
            <Toaster position="bottom-right" />
        </ThemeProvider>
        <GoogleAnalytics gaId="G-XX3NRGH9TQ" />
        <GoogleAdSense />
      </body>
    </html>
  )
}
