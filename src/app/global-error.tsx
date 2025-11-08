// src/app/global-error.tsx 
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (add your service here)
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Something Went Wrong
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. 
              This has been logged and we'll investigate.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-gray-800 break-words">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <a
                href="/dashboard"
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 font-medium transition"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </a>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-6">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}