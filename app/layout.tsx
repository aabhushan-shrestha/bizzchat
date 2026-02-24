import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'BizChat — Business Messaging Platform',
    description: 'Connect businesses and customers through seamless messaging',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'BizChat',
    },
    other: {
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': 'BizChat',
        'mobile-web-app-capable': 'yes',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#000000',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="h-full antialiased">{children}</body>
        </html>
    )
}
