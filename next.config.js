/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
};

module.exports = nextConfig;
