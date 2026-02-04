'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-4 text-slate-600">
              We apologize for the inconvenience. Our team has been notified.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-brand-primary px-6 py-3 text-white hover:bg-brand-primaryHover"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
