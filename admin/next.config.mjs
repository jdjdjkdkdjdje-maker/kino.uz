/** @type {import('next').NextConfig} */
const nextConfig={
  output:'standalone',
  async rewrites(){return[{source:'/backend-api/:path*',destination:`${process.env.BACKEND_INTERNAL_URL||'http://localhost:4000'}/api/v1/:path*`}]}
};
export default nextConfig;
