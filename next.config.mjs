/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export', // Server-side API için kapatıldı
  // trailingSlash: true,
  images: {
    unoptimized: true
  },
  // distDir: 'out',
  // assetPrefix: './',
  // basePath: ''
};

export default nextConfig;
