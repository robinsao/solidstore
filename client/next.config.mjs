/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "s.gravatar.com",
      },
    ],
  },
};

export default nextConfig;
