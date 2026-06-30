/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 👈 This is required for Capacitor
  images: {
    unoptimized: true, // 👈 Required because mobile apps can't use Next.js image server
  }
};

export default nextConfig;