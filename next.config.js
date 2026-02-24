/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    images: {
        domains: ['lh3.googleusercontent.com'],
    },
    // Disable static page generation for pages using Supabase
    // Pages will be rendered dynamically at request time
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
}

module.exports = nextConfig
