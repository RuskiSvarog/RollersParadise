import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReportModal } from './ErrorReportModal';
import { ERROR_CODES, ErrorDetails } from '../utils/errorCodes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorDetails: ErrorDetails | null;
  showReportModal: boolean;
}

/**
 * Error Boundary - Catches React component errors
 * Automatically captures and allows users to report errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
      showReportModal: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught error:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Create error details
    const errorDetails: ErrorDetails = {
      code: ERROR_CODES.FE_REACT_COMPONENT,
      message: error.message || 'React component error',
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      additionalInfo: {
        errorName: error.name,
        errorType: 'React Component Error',
      },
    };

    this.setState({
      error,
      errorInfo,
      errorDetails,
    });

    // Log to console for debugging
    console.error('Error Details:', errorDetails);
  }

  getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('casino_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      console.error('Failed to get user ID:', e);
    }
    return undefined;
  }

  getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  handleResetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
      showReportModal: false,
    });
  };

  handleShowReport = () => {
    this.setState({ showReportModal: true });
  };

  handleCloseReport = () => {
    this.setState({ showReportModal: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-gray-800 rounded-2xl border-2 border-red-600 p-8 shadow-2xl">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-white text-center mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Code */}
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <div className="text-red-400 text-sm font-medium mb-1">Error Code</div>
                  <div className="text-red-300 text-2xl font-mono font-bold">
                    {this.state.errorDetails?.code || 'FE-001'}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-center leading-relaxed">
                  {this.state.error?.message || 'An unexpected error occurred in the application.'}
                </p>
              </div>

              {/* User-friendly message */}
              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
                <p className="text-blue-300 text-sm text-center leading-relaxed">
                  💡 <strong>What this means:</strong> A component in the application encountered an error and couldn't display properly. This has been automatically logged.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={this.handleResetError}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={this.handleShowReport}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  📧 Send Error Report
                </button>
              </div>

              {/* Reload Page Button */}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                🔃 Reload Page
              </button>

              {/* Debug Info (collapsed) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <summary className="text-gray-400 cursor-pointer font-medium mb-2">
                    🔧 Developer Details
                  </summary>
                  <div className="text-xs text-gray-500 font-mono overflow-auto max-h-64">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* Error Report Modal */}
          {this.state.showReportModal && this.state.errorDetails && (
            <ErrorReportModal
              errorDetails={this.state.errorDetails}
              onClose={this.handleCloseReport}
              onReportSent={this.handleResetError}
            />
          )}
        </>
      );
    }

    return this.props.children;
  }
}
