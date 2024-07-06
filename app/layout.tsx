import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AHOXY Note, Online Notepad, Fast and Easy to use',
  description: 'AHOXY Note Simple Web-Based Free',
  icons: {
    icon: './favicon.ico',
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >{children}
          </ThemeProvider></body>
          <GoogleAnalytics gaId="G-XX3NRGH9TQ" />
    </html>
  );
}
