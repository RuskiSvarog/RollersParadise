import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ErrorReport {
  id: string;
  error_code: string;
  error_message: string;
  stack_trace?: string;
  component_stack?: string;
  user_agent?: string;
  url?: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  user_description?: string;
  user_email?: string;
  additional_info?: any;
  resolved: boolean;
  created_at: string;
}

interface ErrorReportsViewerProps {
  onClose: () => void;
}

export function ErrorReportsViewer({ onClose }: ErrorReportsViewerProps) {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (searchCode) {
        params.append('errorCode', searchCode);
      }
      if (showResolved !== null) {
        params.append('resolved', showResolved.toString());
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/error-reports/recent?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      // Check if response is HTML (Figma environment issue)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('API endpoint not accessible in this environment. Please deploy to production or use Supabase directly.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch error reports`);
      }

      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. This feature may not work in preview mode.');
      }

      if (result.success) {
        setReports(result.reports || []);
        toast.success(`Found ${result.reports?.length || 0} error reports`);
      } else {
        throw new Error(result.error || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load error reports';
      
      toast.error('Cannot Load Error Reports', {
        description: errorMessage.includes('preview mode') || errorMessage.includes('not accessible') 
          ? 'This feature requires a deployed backend. Error reports are still being saved.' 
          : errorMessage,
        duration: 6000,
      });
      
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [showResolved]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-blue-600/50 shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b-2 border-blue-700/50 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full p-2">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Error Reports Database</h2>
                <p className="text-gray-300 text-sm">View all submitted error reports</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by error code..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Resolved</span>
              </label>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-gray-400">
              Total Reports: <span className="text-white font-bold">{reports.length}</span>
            </div>
            <div className="text-gray-400">
              Unresolved: <span className="text-red-400 font-bold">{reports.filter(r => !r.resolved).length}</span>
            </div>
            <div className="text-gray-400">
              Resolved: <span className="text-green-400 font-bold">{reports.filter(r => r.resolved).length}</span>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading error reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No error reports found</p>
              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 max-w-md mx-auto mt-4">
                <p className="text-yellow-300 text-sm mb-2">
                  ⚠️ <strong>Preview Environment Limitation</strong>
                </p>
                <p className="text-yellow-200 text-xs">
                  Error reports are being saved to the database, but viewing them requires a deployed backend. 
                  The error reporting system is still fully functional - users can submit reports and they will be stored.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`bg-gray-800/50 border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500 hover:bg-gray-800/70 ${
                    report.resolved ? 'border-green-600/30' : 'border-red-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {report.resolved ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <div className="font-mono font-bold text-white text-lg">
                          {report.error_code}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          report.resolved ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}>
                          {report.resolved ? 'Resolved' : 'Open'}
                        </div>
                      </div>

                      <div className="text-gray-300 mb-2 truncate">
                        {report.error_message}
                      </div>

                      {report.user_description && (
                        <div className="text-sm text-blue-300 mb-2">
                          📝 User: "{report.user_description.substring(0, 100)}{report.user_description.length > 100 ? '...' : ''}"
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(report.created_at)}
                        </div>
                        {report.user_email && (
                          <div>✉️ {report.user_email}</div>
                        )}
                        {report.user_id && (
                          <div>👤 {report.user_id.substring(0, 8)}...</div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Click to view */}
                    <div className="text-gray-400 text-sm whitespace-nowrap">
                      Click to view →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t-2 border-gray-700 p-4 rounded-b-2xl text-center text-gray-400 text-sm">
          Showing {reports.length} reports
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-blue-600 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-900/40 border-b-2 border-blue-600 p-6 sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Error Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Error Code</div>
                <div className="text-white text-2xl font-mono font-bold">{selectedReport.error_code}</div>
              </div>

              <div>
                <div className="text-gray-400 text-sm mb-1">Error Message</div>
                <div className="text-white text-lg">{selectedReport.error_message}</div>
              </div>

              {selectedReport.user_description && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">User Description</div>
                  <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 text-blue-100">
                    {selectedReport.user_description}
                  </div>
                </div>
              )}

              {selectedReport.user_email && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">User Email</div>
                  <div className="text-white">{selectedReport.user_email}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Timestamp</div>
                  <div className="text-white">{formatDate(selectedReport.timestamp)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Created At</div>
                  <div className="text-white">{formatDate(selectedReport.created_at)}</div>
                </div>
              </div>

              {selectedReport.url && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">URL</div>
                  <div className="text-white font-mono text-sm break-all">{selectedReport.url}</div>
                </div>
              )}

              {selectedReport.user_agent && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">User Agent</div>
                  <div className="text-white font-mono text-xs break-all">{selectedReport.user_agent}</div>
                </div>
              )}

              {selectedReport.stack_trace && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Stack Trace</div>
                  <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-white text-xs overflow-x-auto">
                    {selectedReport.stack_trace}
                  </pre>
                </div>
              )}

              {selectedReport.component_stack && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Component Stack</div>
                  <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-white text-xs overflow-x-auto">
                    {selectedReport.component_stack}
                  </pre>
                </div>
              )}

              {selectedReport.additional_info && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Additional Info</div>
                  <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-white text-xs overflow-x-auto">
                    {JSON.stringify(selectedReport.additional_info, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
