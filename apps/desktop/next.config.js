/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

module.exports = nextConfig;
