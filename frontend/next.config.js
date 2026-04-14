/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境建议开启 standalone 模式，优化部署体积
  output: 'standalone',
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // 部署时确保此处端口与后端一致，或者通过 Nginx 处理代理
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
  // Webpack 配置仅在开发模式下解决 Windows 特定目录报错，部署到 Ubuntu 时不生效
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
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