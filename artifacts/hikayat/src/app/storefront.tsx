'use client';

import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/error-boundary';

// Preserve device-local preferences and the existing navigation/design while
// Next.js owns the document, runtime, and server-side API routes.
const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-ivory text-olive" role="status">
      <span className="font-display text-3xl tracking-[0.25em]">HIKAYAT</span>
    </div>
  ),
});

export default function Storefront() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}
