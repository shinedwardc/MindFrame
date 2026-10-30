import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Emits a self-contained .next/standalone bundle with a pruned node_modules,
	// so the production image ships without pnpm, devDeps, or the source tree.
	output: 'standalone',
};

export default nextConfig;
