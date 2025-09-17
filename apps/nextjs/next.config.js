/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * Configure external image domains
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: ["@spice/ui", "@spice/types"],
  
  /**
   * Ignore ESLint warnings during build
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * Performance optimizations
   */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  experimental: {
    // optimizeCss: true, // Disabled due to missing critters dependency
    optimizePackageImports: ['framer-motion'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  /**
   * Performance optimizations
   */
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  /**
   * Exclude test files from pages
   */
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),

  /**
   * Webpack optimizations
   */
  webpack: (config, { dev, isServer }) => {
    // Exclude test files from build
    config.module.rules.push({
      test: /\.test\.(ts|tsx|js|jsx)$/,
      use: 'ignore-loader',
    })
    
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            commons: {
              name: 'commons',
              chunks: 'initial',
              minChunks: 2,
            },
          },
        },
      }
    }
    return config
  },
};

export default config;