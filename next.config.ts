import type {NextConfig} from 'next';
import path from 'path';
const nextConfig: NextConfig = {
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  //assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.hi-paris.fr',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '1drv.ms',
        port: '',
        pathname: '/f/c/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Required for Hugging Face Spaces
  },
  async headers() {
    return [
      {
        // Allow cross-origin requests for audio files
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // In production, consider limiting this to specific domains
          },
        ],
      },
    ];
  },
};

export default nextConfig;