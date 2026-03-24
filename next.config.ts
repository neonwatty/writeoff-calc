import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/calculators',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
