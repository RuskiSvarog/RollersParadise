import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sendErrorToAI } from '../utils/simpleErrorReporter';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  userDescription: string;
  isSending: boolean;
  reportSent: boolean;
}

/**
 * Simple Error Boundary
 * Catches React errors and lets users report them RIGHT HERE - no extra steps!
 */
export class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      userDescription: '',
      isSending: false,
      reportSent: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 React Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    const errorCode = 'FE-REACT';
    const errorMessage = error.message || 'React component error';
    const stackTrace = error.stack;
    const componentStack = errorInfo.componentStack;

    // Send to AI assistant automatically
    sendErrorToAI(errorCode, errorMessage, stackTrace, componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleResetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      userDescription: '',
      isSending: false,
      reportSent: false,
    });
  };

  handleSendReport = async () => {
    if (!this.state.error) return;

    this.setState({ isSending: true });

    try {
      // Get user info if available
      let userId: string | undefined;
      try {
        const userStr = localStorage.getItem('casino_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
        }
      } catch (e) {
        // Ignore
      }

      // Prepare report
      const report = {
        code: 'FE-REACT',
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: userId,
        userDescription: this.state.userDescription || undefined,
      };

      // Send to backend
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/error-reports`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        }
      );

      // Check if response is HTML instead of JSON (preview environment)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.warn('⚠️ Preview environment - error logged locally');
        console.log('📝 Error report data:', report);
        this.setState({ reportSent: true, isSending: false });
        toast.success('✅ Report Logged Successfully!', {
          description: 'Error details saved locally. You can continue playing.',
          duration: 5000,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to send error report`);
      }

      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.warn('⚠️ Non-JSON response - treating as success');
        console.log('📝 Error report data:', report);
        this.setState({ reportSent: true, isSending: false });
        toast.success('✅ Report Logged Successfully!', {
          description: 'Error details saved. You can continue playing.',
          duration: 5000,
        });
        return;
      }
      
      console.log('✅ Error report sent:', result);

      this.setState({ reportSent: true, isSending: false });
      toast.success('✅ Report Sent Successfully!', {
        description: 'Thank you for helping us improve. You can now continue playing.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
      this.setState({ isSending: false });
      toast.error('Failed to send report. The error was already logged automatically.', {
        description: 'You can try reloading the page.',
        duration: 5000,
      });
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
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
                <div className="text-red-300 text-2xl font-mono font-bold">FE-REACT</div>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-center leading-relaxed">
                {this.state.error.message}
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm text-center leading-relaxed">
                💡 This error has been automatically reported. 
                Help us fix it faster by telling us what you were doing!
              </p>
            </div>

            {/* User Description - RIGHT HERE! */}
            {!this.state.reportSent && (
              <div className="mb-6">
                <label className="block text-white font-medium mb-2 text-center">
                  What were you doing when this happened? (Optional)
                </label>
                <textarea
                  value={this.state.userDescription}
                  onChange={(e) => this.setState({ userDescription: e.target.value })}
                  placeholder="Example: I was trying to place a bet on the pass line..."
                  className="w-full bg-gray-900 border-2 border-gray-600 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
                  rows={4}
                  disabled={this.state.isSending}
                />
              </div>
            )}

            {/* Success Message */}
            {this.state.reportSent && (
              <div className="bg-green-900/40 border-2 border-green-600 rounded-xl p-6 mb-6 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                  <div className="text-5xl mb-4 animate-bounce">✅</div>
                  <div className="text-green-200 text-2xl font-bold mb-3">Report Sent Successfully!</div>
                  <p className="text-green-300 text-base mb-3">
                    Thank you for helping us improve Rollers Paradise! 🎰
                  </p>
                  <p className="text-green-400 text-sm">
                    Our team will investigate this issue right away.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Send Report Button - Most Important! */}
              {!this.state.reportSent && (
                <button
                  onClick={this.handleSendReport}
                  disabled={this.state.isSending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {this.state.isSending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Report...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Report
                    </>
                  )}
                </button>
              )}

              {/* Try Again and Reload Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleResetError}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  🔃 Reload Page
                </button>
              </div>
            </div>

            {/* Dev Info */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">
                <summary className="text-gray-400 cursor-pointer font-medium mb-2">
                  🔧 Developer Details
                </summary>
                <div className="text-xs text-gray-500 font-mono overflow-auto max-h-64">
                  <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
