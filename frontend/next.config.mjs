/** @type {import('next').NextConfig} */
import path from 'path';
const nextConfig = {
	output: 'standalone',
	webpack: (config) => {
		config.resolve.alias['@'] = path.resolve();
		return config;
	},
	// eslint: {
	// 	// Warning: This allows production builds to successfully complete even if
	// 	// your project has ESLint errors.
	// 	ignoreDuringBuilds: true,
	// },
};

export default nextConfig;
