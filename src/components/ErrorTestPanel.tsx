import React, { useState } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import { reportError, reportNetworkError, reportAPIError } from '../utils/globalErrorHandler';
import { ERROR_CODES } from '../utils/errorCodes';
import { toast } from 'sonner';

/**
 * Error Test Panel - For developers to test the error reporting system
 * This component should only be visible in development mode
 * 
 * Usage: Add to your app temporarily to test error reporting
 */
export function ErrorTestPanel() {
  const [shouldThrow, setShouldThrow] = useState(false);

  // Test React Error Boundary
  if (shouldThrow) {
    throw new Error('Test React Component Error - This is a test error from ErrorTestPanel');
  }

  // Test uncaught error
  const testUncaughtError = () => {
    setTimeout(() => {
      throw new Error('Test Uncaught Error - This should be caught by global error handler');
    }, 100);
    toast.info('Uncaught error will be thrown in 100ms...');
  };

  // Test unhandled promise rejection
  const testUnhandledRejection = () => {
    Promise.reject(new Error('Test Promise Rejection - This should be caught by global error handler'));
    toast.info('Promise rejection triggered...');
  };

  // Test manual error reporting
  const testManualReport = () => {
    const testError = new Error('Test Manual Report - User clicked test button');
    reportError(testError, {
      testType: 'manual',
      userAction: 'clicked test button',
      timestamp: new Date().toISOString(),
    });
    toast.success('Manual error report sent!');
  };

  // Test network error
  const testNetworkError = () => {
    reportNetworkError(
      'https://rollersparadise.com/api/test',
      500,
      'Internal Server Error',
      { error: 'Test network error' }
    );
    toast.success('Network error report sent!');
  };

  // Test API error
  const testAPIError = () => {
    reportAPIError(
      '/api/test-endpoint',
      'POST',
      new Error('Test API Error - Simulated API failure')
    );
    toast.success('API error report sent!');
  };

  // Test React component error
  const testReactError = () => {
    setShouldThrow(true);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-gradient-to-br from-red-900 via-gray-900 to-gray-800 border-2 border-red-600 rounded-2xl p-6 shadow-2xl max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <Bug className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-bold text-white">Error Test Panel</h3>
        <span className="ml-auto text-xs bg-yellow-600 text-black px-2 py-1 rounded font-bold">DEV ONLY</span>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 mb-4">
        <p className="text-yellow-300 text-sm">
          ⚠️ <strong>Developer Tool:</strong> Test the error reporting system. Each button triggers a different error type.
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={testReactError}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test React Component Error
        </button>

        <button
          onClick={testUncaughtError}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Uncaught Error
        </button>

        <button
          onClick={testUnhandledRejection}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Promise Rejection
        </button>

        <button
          onClick={testManualReport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Manual Report
        </button>

        <button
          onClick={testNetworkError}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Network Error
        </button>

        <button
          onClick={testAPIError}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test API Error
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs">
          💡 Press <kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+Shift+E</kbd> to open Error Dashboard
        </p>
      </div>
    </div>
  );
}

/**
 * Usage Example:
 * 
 * In App.tsx (during development):
 * 
 * import { ErrorTestPanel } from './components/ErrorTestPanel';
 * 
 * function App() {
 *   return (
 *     <>
 *       {process.env.NODE_ENV === 'development' && <ErrorTestPanel />}
 *       {/* rest of app *\/}
 *     </>
 *   );
 * }
 */
