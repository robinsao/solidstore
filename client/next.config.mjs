/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "s.gravatar.com",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
