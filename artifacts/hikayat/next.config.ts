import path from 'node:path';
import type { NextConfig } from 'next';

const basePath = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');

const config: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
  allowedDevOrigins: [
    '*.replit.dev', '*.replit.app', '127.0.0.1', 'localhost',
    ...(process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : []),
    ...(process.env.REPLIT_DOMAINS?.split(',') ?? []),
  ],
  poweredByHeader: false,
};

export default config;
