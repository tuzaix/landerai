/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // 忽略一些系统目录以避免 Watchpack 报错 (EINVAL: invalid argument, lstat 'D:\System Volume Information')
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.next/**',
          'D:/System Volume Information/**',
          'C:/System Volume Information/**'
        ],
      }
    }
    return config
  },
}

module.exports = nextConfig