const { withNextVideo } = require('next-video/process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  webpack: (config) => {
    // Handle GLSL shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: 'raw-loader'
    });
    
    return config;
  },
  turbopack: {
 // Handle GLSL shader files
        rules: {
            '*.{glsl,vs,fs,vert,frag}': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
  },
  // Optimize images
  images: {
    unoptimized: true
  },
  // Fix lockfile warning
  outputFileTracingRoot: __dirname
}

module.exports = withNextVideo(nextConfig)
