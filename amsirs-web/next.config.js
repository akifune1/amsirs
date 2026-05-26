/** @type {import('next').NextConfig} */
module.exports = {
  allowedDevOrigins: ['172.30.254.84'],
  
  // Add this block to allow larger camera payloads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}