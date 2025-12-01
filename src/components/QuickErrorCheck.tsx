import React, { useState } from 'react';
import { AlertCircle, X, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ErrorReport {
  id: string;
  error_code: string;
  error_message: string;
  stack_trace?: string;
  user_description?: string;
  user_email?: string;
  timestamp: string;
  created_at: string;
  url?: string;
  user_agent?: string;
  resolved: boolean;
}

/**
 * Quick Error Check - View most recent error reports
 * Access by adding ?check-errors to URL
 */
export function QuickErrorCheck() {
  const [show, setShow] = useState(false);
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('check-errors') !== null) {
      setShow(true);
      fetchReports();
    }
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/error-reports/recent?limit=10`;
      
      console.log('🔍 Fetching recent error reports from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports || []);
        toast.success(`✅ Found ${data.count} recent error reports`);
        console.log('📊 Error reports:', data.reports);
      } else {
        throw new Error(data.error || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      toast.error('Failed to load error reports', {
        description: error instanceof Error ? error.message : String(error),
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-green-600/50 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border-b-2 border-green-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 rounded-full p-2">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Error Reports</h2>
                <p className="text-gray-300 text-sm">Last 10 reports from your live website</p>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-gray-300">
              Showing most recent reports • Total: <span className="text-white font-bold">{reports.length}</span>
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading recent error reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No error reports found</p>
              <p className="text-gray-500 text-sm mt-2">Your app is running smoothly! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className={`bg-gray-800/50 border-2 rounded-xl p-6 transition-all ${
                    index === 0 
                      ? 'border-green-500 shadow-lg shadow-green-500/20' 
                      : report.resolved 
                        ? 'border-gray-700' 
                        : 'border-red-600/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {index === 0 && (
                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap animate-pulse">
                          ⭐ NEWEST
                        </div>
                      )}
                      <div className="font-mono font-bold text-white text-xl truncate">
                        {report.error_code}
                      </div>
                      {report.resolved ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="whitespace-nowrap">{formatDate(report.created_at)}</span>
                    </div>
                  </div>

                  {/* Error Message */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-3">
                    <div className="text-gray-400 text-xs mb-1">Error Message</div>
                    <div className="text-white">{report.error_message}</div>
                  </div>

                  {/* User Description */}
                  {report.user_description && (
                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-3">
                      <div className="text-blue-400 text-xs mb-1">👤 What User Was Doing</div>
                      <div className="text-blue-100">{report.user_description}</div>
                    </div>
                  )}

                  {/* User Email */}
                  {report.user_email && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-gray-400">📧 Contact:</span>
                      <span className="text-white">{report.user_email}</span>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">Report ID</div>
                      <div className="text-gray-300 font-mono text-xs">{report.id.substring(0, 13)}...</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Timestamp</div>
                      <div className="text-gray-300 text-xs">{new Date(report.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* URL */}
                  {report.url && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-gray-500 text-xs mb-1">Page URL</div>
                      <div className="text-gray-400 font-mono text-xs truncate">{report.url}</div>
                    </div>
                  )}

                  {/* Stack Trace Preview */}
                  {report.stack_trace && (
                    <details className="mt-3">
                      <summary className="text-gray-400 text-sm cursor-pointer hover:text-white">
                        📋 View Stack Trace
                      </summary>
                      <pre className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-white text-xs overflow-x-auto mt-2">
                        {report.stack_trace.substring(0, 500)}
                        {report.stack_trace.length > 500 && '...'}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t-2 border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              🔍 To view all reports, use the full admin panel
            </div>
            <div className="text-gray-500">
              Press Ctrl+Shift+R or add ?admin=errors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}