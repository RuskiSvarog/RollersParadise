import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle, Filter, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorReport, getErrorSeverity } from '../utils/errorCodes';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ErrorReportsDashboardProps {
  onClose: () => void;
}

export function ErrorReportsDashboard({ onClose }: ErrorReportsDashboardProps) {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [searchCode, setSearchCode] = useState('');
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (filter !== 'all') {
        params.append('resolved', (filter === 'resolved').toString());
      }

      if (searchCode) {
        params.append('errorCode', searchCode);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/error-reports/recent?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
        setTotal(result.total);
      } else {
        toast.error('Failed to load error reports');
      }
    } catch (error) {
      console.error('Failed to load error reports:', error);
      toast.error('Failed to load error reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter, searchCode, page]);

  const severityColors = {
    low: 'bg-blue-900/30 border-blue-600 text-blue-400',
    medium: 'bg-yellow-900/30 border-yellow-600 text-yellow-400',
    high: 'bg-orange-900/30 border-orange-600 text-orange-400',
    critical: 'bg-red-900/30 border-red-600 text-red-400',
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-b-2 border-gray-700 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🔧 Error Reports Dashboard</h2>
              <p className="text-gray-300">Monitor and manage application errors</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total Reports</div>
              <div className="text-white text-2xl font-bold">{total}</div>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <div className="text-red-400 text-sm mb-1">Unresolved</div>
              <div className="text-white text-2xl font-bold">
                {reports.filter((r) => !r.resolved).length}
              </div>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <div className="text-green-400 text-sm mb-1">Resolved</div>
              <div className="text-white text-2xl font-bold">
                {reports.filter((r) => r.resolved).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unresolved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'unresolved'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Unresolved
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'resolved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Resolved
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Search by error code..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                />
              </div>
              <button
                onClick={loadReports}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <AlertCircle className="w-16 h-16 mb-4" />
              <p className="text-xl font-medium">No error reports found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const severity = getErrorSeverity(report.code);
                return (
                  <div
                    key={report.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-all cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Error Code */}
                          <span className="bg-gray-900 border border-gray-600 px-3 py-1 rounded-lg font-mono font-bold text-white">
                            {report.code}
                          </span>

                          {/* Severity Badge */}
                          <span
                            className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase ${severityColors[severity]}`}
                          >
                            {severity}
                          </span>

                          {/* Resolved Status */}
                          {report.resolved ? (
                            <span className="flex items-center gap-1 text-green-400 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Resolved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              Unresolved
                            </span>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-white mb-2">{report.message}</p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span>⏰ {new Date(report.timestamp).toLocaleString()}</span>
                          {report.userId && <span>👤 User: {report.userId.slice(0, 8)}...</span>}
                          {report.userEmail && <span>📧 {report.userEmail}</span>}
                        </div>

                        {/* User Description */}
                        {report.userDescription && (
                          <div className="mt-2 bg-blue-900/20 border border-blue-600/30 rounded p-2">
                            <p className="text-blue-300 text-sm">
                              <strong>User:</strong> {report.userDescription}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <button className="text-blue-400 hover:text-blue-300 transition-colors p-2">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
            <div className="text-gray-400 text-sm">
              Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <ErrorReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={loadReports}
        />
      )}
    </div>
  );
}

interface ErrorReportDetailModalProps {
  report: ErrorReport;
  onClose: () => void;
  onUpdate: () => void;
}

function ErrorReportDetailModal({ report, onClose, onUpdate }: ErrorReportDetailModalProps) {
  const severity = getErrorSeverity(report.code);
  const severityColors = {
    low: 'bg-blue-900/30 border-blue-600 text-blue-400',
    medium: 'bg-yellow-900/30 border-yellow-600 text-yellow-400',
    high: 'bg-orange-900/30 border-orange-600 text-orange-400',
    critical: 'bg-red-900/30 border-red-600 text-red-400',
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-b-2 border-gray-700 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Error Report Details</h3>
              <div className="flex items-center gap-3">
                <span className="bg-gray-900 border border-gray-600 px-3 py-1 rounded-lg font-mono font-bold text-white">
                  {report.code}
                </span>
                <span className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase ${severityColors[severity]}`}>
                  {severity}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Message */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Error Message</div>
            <p className="text-white">{report.message}</p>
          </div>

          {/* User Description */}
          {report.userDescription && (
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <div className="text-blue-400 text-sm font-medium mb-2">User Description</div>
              <p className="text-blue-200">{report.userDescription}</p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Timestamp</div>
              <div className="text-white text-sm font-mono">{new Date(report.timestamp).toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Session ID</div>
              <div className="text-white text-sm font-mono">{report.sessionId || 'N/A'}</div>
            </div>
            {report.userId && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">User ID</div>
                <div className="text-white text-sm font-mono">{report.userId}</div>
              </div>
            )}
            {report.userEmail && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">User Email</div>
                <div className="text-white text-sm">{report.userEmail}</div>
              </div>
            )}
          </div>

          {/* URL */}
          {report.url && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">URL</div>
              <p className="text-white text-sm font-mono break-all">{report.url}</p>
            </div>
          )}

          {/* User Agent */}
          {report.userAgent && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">User Agent</div>
              <p className="text-white text-sm font-mono break-all">{report.userAgent}</p>
            </div>
          )}

          {/* Stack Trace */}
          {report.stack && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Stack Trace</div>
              <pre className="text-white text-xs font-mono bg-gray-900 p-3 rounded border border-gray-700 overflow-x-auto max-h-64">
                {report.stack}
              </pre>
            </div>
          )}

          {/* Component Stack */}
          {report.componentStack && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Component Stack</div>
              <pre className="text-white text-xs font-mono bg-gray-900 p-3 rounded border border-gray-700 overflow-x-auto max-h-64">
                {report.componentStack}
              </pre>
            </div>
          )}

          {/* Additional Info */}
          {report.additionalInfo && Object.keys(report.additionalInfo).length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Additional Information</div>
              <pre className="text-white text-xs font-mono bg-gray-900 p-3 rounded border border-gray-700 overflow-x-auto">
                {JSON.stringify(report.additionalInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}