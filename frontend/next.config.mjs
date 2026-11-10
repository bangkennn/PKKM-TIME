/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
      {
        source: "/rest/:path*",
        destination: "http://localhost:3001/rest/:path*",
      },
      {
        source: "/resr/:path*",
        destination: "http://localhost:3001/resr/:path*",
      },
    ];
  },
};

export default nextConfig;
