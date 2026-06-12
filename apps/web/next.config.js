/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xenocopilot/shared-types'],
  async redirects() {
    return [
      {
        source: '/opportunities',
        destination: '/revenue',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
