import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Download, X, AlertCircle, Lock, Copy, Users, Shield, UserPlus, Trash2, Trophy, CheckCircle } from 'lucide-react';
import { fetchErrorReports, fetchAllReports, ErrorReport, deleteErrorReport } from '../utils/fetchErrorReports';
import { toast } from 'sonner@2.0.3';
import { checkAdminAccess, getCurrentAdminInfo, grantAdminAccess, revokeAdminAccess, getAdminUsers, OWNER_INFO, AdminUser } from '../utils/adminPermissions';

const AdminRewardsPanel = lazy(() => import('./AdminRewardsPanel').then(m => ({ default: m.AdminRewardsPanel })));
const LeaderboardDebugPanel = lazy(() => import('./LeaderboardDebugPanel').then(m => ({ default: m.default })));

/**
 * ADMIN DASHBOARD - Owner: Ruski (avgelatt@gmail.com)
 * Access control: Only Ruski and users granted permission can access
 */
export function AdminErrorReports() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [showManageUsers, setShowManageUsers] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'coder' | 'viewer'>('coder');
  const [showRewardsPanel, setShowRewardsPanel] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Check authentication on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin-reports');
    
    // ONLY CHECK AUTH IF USER EXPLICITLY REQUESTED ADMIN PANEL
    if (adminParam === 'true') {
      // ✅ SILENT CHECK - Only show panel if authorized, otherwise do nothing
      const userEmail = getUserEmail();
      if (userEmail) {
        checkAdminAccess(userEmail).then((access) => {
          if (access.hasAccess) {
            // ✅ User is authorized - auto-login silently
            setIsAuthenticated(true);
            setShowReports(true); // Show the panel
            getCurrentAdminInfo().then(info => setAdminInfo(info));
            handleFetchReports();
          }
          // ❌ Not authorized - SILENT (do nothing, no message)
        });
      }
      // ❌ Not logged in - SILENT (do nothing, no message)
    }

    // Secret keyboard shortcut: Ctrl+Shift+Alt+R
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'R') {
        e.preventDefault();
        // ✅ SILENT CHECK - Only show panel if authorized, otherwise do nothing
        const userEmail = getUserEmail();
        if (userEmail) {
          checkAdminAccess(userEmail).then((access) => {
            if (access.hasAccess) {
              // ✅ User is authorized - auto-login silently
              setIsAuthenticated(true);
              getCurrentAdminInfo().then(info => setAdminInfo(info));
              handleFetchReports();
              setShowReports(true);
            }
            // ❌ Not authorized - SILENT (do nothing, no message)
          });
        }
        // ❌ Not logged in - SILENT (do nothing, no message)
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getUserEmail = (): string | null => {
    try {
      // Check both possible localStorage keys
      const savedProfile = localStorage.getItem('rollers-paradise-profile') || localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        return profile.email || null;
      }
    } catch (error) {
      // Silent error - don't log anything
    }
    return null;
  };

  const handleLogin = async () => {
    // Since we're checking actual user authentication, just verify they're logged in
    const userEmail = getUserEmail();
    
    if (!userEmail) {
      toast.error('Not logged in', {
        description: 'Please log in to your Ruski account first',
      });
      return;
    }

    // Check if this user has admin access
    const access = await checkAdminAccess(userEmail);
    
    if (access.hasAccess) {
      setIsAuthenticated(true);
      setShowLoginPrompt(false);
      const info = await getCurrentAdminInfo();
      setAdminInfo(info);
      
      toast.success('Admin access granted', {
        description: `Welcome ${info.username || userEmail}!`,
      });
      
      handleFetchReports();
    } else {
      toast.error('Access denied', {
        description: 'You do not have admin permissions. Contact Ruski (avgelatt@gmail.com) for access.',
      });
    }
  };

  const handleFetchReports = async () => {
    setLoading(true);
    try {
      const fetchedReports = await fetchAllReports(100);
      setReports(fetchedReports);
      setShowReports(true);
      
      toast.success(`Loaded ${fetchedReports.length} reports`);
    } catch (error) {
      toast.error('Failed to fetch reports', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAllReports = () => {
    if (reports.length === 0) {
      toast.error('No reports to copy');
      return;
    }

    try {
      // Format reports as text
      let content = '═══════════════════════════════════════════════════════════\n';
      content += '           ROLLERS PARADISE - ERROR REPORTS\n';
      content += `           Generated: ${new Date().toLocaleString()}\n`;
      content += `           Total Reports: ${reports.length}\n`;
      content += '═══════════════════════════════════════════════════════════\n\n';

      reports.forEach((report, index) => {
        content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `REPORT #${index + 1}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `ID: ${report.id}\n`;
        content += `Date: ${new Date(report.created_at).toLocaleString()}\n`;
        content += `Error Code: ${report.error_code}\n`;
        content += `Status: ${report.resolved ? '✅ RESOLVED' : '❌ UNRESOLVED'}\n`;
        content += `\nError Message:\n${report.error_message}\n`;

        if (report.user_description) {
          content += `\n👤 USER DESCRIPTION:\n"${report.user_description}"\n`;
        }

        if (report.user_email) {
          content += `\n📧 Contact Email: ${report.user_email}\n`;
        }

        if (report.user_id) {
          content += `\n🆔 User ID: ${report.user_id}\n`;
        }

        if (report.url) {
          content += `\n🔗 Page URL: ${report.url}\n`;
        }

        if (report.user_agent) {
          content += `\n💻 User Agent:\n${report.user_agent}\n`;
        }

        if (report.stack_trace) {
          content += `\n📋 STACK TRACE:\n${report.stack_trace}\n`;
        }

        if (report.component_stack) {
          content += `\n⚛️ COMPONENT STACK:\n${report.component_stack}\n`;
        }

        if (report.additional_info) {
          content += `\nℹ️ ADDITIONAL INFO:\n${JSON.stringify(report.additional_info, null, 2)}\n`;
        }

        content += '\n';
      });

      // Summary
      content += '\n═══════════════════════════════════════════════════════════\n';
      content += '                        SUMMARY\n';
      content += '═══════════════════════════════════════════════════════════\n';
      content += `Total Reports: ${reports.length}\n`;
      content += `Unresolved: ${reports.filter(r => !r.resolved).length}\n`;
      content += `Resolved: ${reports.filter(r => r.resolved).length}\n\n`;

      // Group by error code
      const byCode: Record<string, number> = {};
      reports.forEach(r => {
        byCode[r.error_code] = (byCode[r.error_code] || 0) + 1;
      });

      content += 'BY ERROR CODE:\n';
      Object.entries(byCode)
        .sort((a, b) => b[1] - a[1])
        .forEach(([code, count]) => {
          content += `  ${code}: ${count}\n`;
        });

      content += '\n═══════════════════════════════════════════════════════════\n';

      // Copy to clipboard
      navigator.clipboard.writeText(content);

      toast.success('Copied to clipboard!', {
        description: 'All reports copied. Paste into AI chat to get bugs fixed.',
      });
    } catch (error) {
      toast.error('Failed to copy', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleDownloadReports = () => {
    if (reports.length === 0) {
      toast.error('No reports to download');
      return;
    }

    try {
      // Format reports as text file (same format as copy)
      let content = '═══════════════════════════════════════════════════════════\n';
      content += '           ROLLERS PARADISE - ERROR REPORTS\n';
      content += `           Generated: ${new Date().toLocaleString()}\n`;
      content += `           Total Reports: ${reports.length}\n`;
      content += '═══════════════════════════════════════════════════════════\n\n';

      reports.forEach((report, index) => {
        content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `REPORT #${index + 1}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `ID: ${report.id}\n`;
        content += `Date: ${new Date(report.created_at).toLocaleString()}\n`;
        content += `Error Code: ${report.error_code}\n`;
        content += `Status: ${report.resolved ? '✅ RESOLVED' : '❌ UNRESOLVED'}\n`;
        content += `\nError Message:\n${report.error_message}\n`;

        if (report.user_description) {
          content += `\n👤 USER DESCRIPTION:\n"${report.user_description}"\n`;
        }

        if (report.user_email) {
          content += `\n📧 Contact Email: ${report.user_email}\n`;
        }

        if (report.user_id) {
          content += `\n🆔 User ID: ${report.user_id}\n`;
        }

        if (report.url) {
          content += `\n🔗 Page URL: ${report.url}\n`;
        }

        if (report.user_agent) {
          content += `\n💻 User Agent:\n${report.user_agent}\n`;
        }

        if (report.stack_trace) {
          content += `\n📋 STACK TRACE:\n${report.stack_trace}\n`;
        }

        if (report.component_stack) {
          content += `\n⚛️ COMPONENT STACK:\n${report.component_stack}\n`;
        }

        if (report.additional_info) {
          content += `\nℹ️ ADDITIONAL INFO:\n${JSON.stringify(report.additional_info, null, 2)}\n`;
        }

        content += '\n';
      });

      // Summary
      content += '\n═══════════════════════════════════════════════════════════\n';
      content += '                        SUMMARY\n';
      content += '═══════════════════════════════════════════════════════════\n';
      content += `Total Reports: ${reports.length}\n`;
      content += `Unresolved: ${reports.filter(r => !r.resolved).length}\n`;
      content += `Resolved: ${reports.filter(r => r.resolved).length}\n\n`;

      // Group by error code
      const byCode: Record<string, number> = {};
      reports.forEach(r => {
        byCode[r.error_code] = (byCode[r.error_code] || 0) + 1;
      });

      content += 'BY ERROR CODE:\n';
      Object.entries(byCode)
        .sort((a, b) => b[1] - a[1])
        .forEach(([code, count]) => {
          content += `  ${code}: ${count}\n`;
        });

      content += '\n═══════════════════════════════════════════════════════════\n';

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error-reports-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Reports downloaded!', {
        description: 'Check your Downloads folder',
      });
    } catch (error) {
      toast.error('Failed to download reports', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleManageUsers = async () => {
    setShowManageUsers(true);
    const users = await getAdminUsers();
    setAdminUsers(users);
  };

  const handleGrantAccess = async () => {
    if (!newUserEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const result = await grantAdminAccess(newUserEmail, newUserRole);
    
    if (result.success) {
      toast.success('Access granted!', {
        description: result.message,
      });
      setNewUserEmail('');
      const users = await getAdminUsers();
      setAdminUsers(users);
    } else {
      toast.error('Failed to grant access', {
        description: result.message,
      });
    }
  };

  const handleRevokeAccess = async (userId: string, email: string) => {
    if (email === OWNER_INFO.email) {
      toast.error('Cannot revoke owner access');
      return;
    }

    const result = await revokeAdminAccess(userId);
    
    if (result.success) {
      toast.success('Access revoked', {
        description: result.message,
      });
      const users = await getAdminUsers();
      setAdminUsers(users);
    } else {
      toast.error('Failed to revoke access', {
        description: result.message,
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowReports(false);
    setShowManageUsers(false);
    toast.info('Logged out of admin mode');
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const result = await deleteErrorReport(reportId);
      
      if (result.success) {
        toast.success('Report deleted', {
          description: result.message,
        });
        // Refresh reports
        handleFetchReports();
      } else {
        toast.error('Failed to delete report', {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error('Failed to delete report', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Don't render anything if not authenticated and no login prompt
  if (!showLoginPrompt && !isAuthenticated) {
    return null;
  }

  // Login prompt
  if (showLoginPrompt && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <div className="bg-gray-900 border-4 border-red-600 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
            <p className="text-gray-400">Owner: Ruski (avgelatt@gmail.com)</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                ✅ You must be logged in as <strong>Ruski</strong> or have been granted admin access.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Verify Access
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300 text-sm">
              💡 <strong>How to access:</strong><br/>
              • Add <code className="bg-gray-700 px-2 py-1 rounded">?admin-reports=true</code> to URL<br/>
              • Press <code className="bg-gray-700 px-2 py-1 rounded">Ctrl+Shift+Alt+R</code><br/>
              <br/>
              📞 Contact: {OWNER_INFO.phone}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User management panel
  if (showManageUsers && adminInfo?.role === 'owner') {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <div className="bg-gray-900 border-4 border-blue-600 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col m-4">
          {/* Header */}
          <div className="bg-blue-900/40 border-b-4 border-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <h2 className="text-3xl font-bold text-white">Manage Admin Users</h2>
                  <p className="text-gray-300">Grant or revoke admin access</p>
                </div>
              </div>
              <button
                onClick={() => setShowManageUsers(false)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Grant Access Form */}
            <div className="bg-gray-800 border-2 border-green-600 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-400" />
                Grant Admin Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="viewer">Viewer (View Only)</option>
                  <option value="coder">Coder (Full Access)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
                <button
                  onClick={handleGrantAccess}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Grant Access
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p><strong>Viewer:</strong> Can only view reports</p>
                <p><strong>Coder:</strong> Full access to fix bugs</p>
                <p><strong>Admin:</strong> Same as coder (for trusted users)</p>
              </div>
            </div>

            {/* Admin Users List */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white mb-4">Current Admin Users</h3>
              {adminUsers.map((user) => (
                <div
                  key={user.user_id}
                  className={`bg-gray-800 border-2 rounded-xl p-4 ${
                    user.role === 'owner' ? 'border-yellow-600' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Shield className={`w-6 h-6 ${
                        user.role === 'owner' ? 'text-yellow-400' :
                        user.role === 'admin' ? 'text-red-400' :
                        user.role === 'coder' ? 'text-blue-400' :
                        'text-gray-400'
                      }`} />
                      <div>
                        <div className="text-white font-bold">
                          {user.username || user.email}
                          {user.role === 'owner' && ' 👑'}
                        </div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                        {user.phone && (
                          <div className="text-gray-400 text-sm">📞 {user.phone}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        user.role === 'owner' ? 'bg-yellow-900/50 text-yellow-300' :
                        user.role === 'admin' ? 'bg-red-900/50 text-red-300' :
                        user.role === 'coder' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                      {user.role !== 'owner' && (
                        <button
                          onClick={() => handleRevokeAccess(user.user_id, user.email)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel
  if (isAuthenticated && showReports) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <div className="bg-gray-900 border-4 border-red-600 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col m-4">
          {/* Header */}
          <div className="bg-red-900/40 border-b-4 border-red-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    🔒 Admin Dashboard - {adminInfo?.username || 'User'}
                    {adminInfo?.role === 'owner' && ' 👑'}
                  </h2>
                  <p className="text-gray-300">
                    Total: {reports.length} reports | Unresolved: {reports.filter(r => !r.resolved).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyAllReports}
                  disabled={loading || reports.length === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
                <button
                  onClick={handleDownloadReports}
                  disabled={loading || reports.length === 0}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleFetchReports}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                {adminInfo?.role === 'owner' && (
                  <>
                    <button
                      onClick={handleManageUsers}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      <Users className="w-4 h-4" />
                      Manage Users
                    </button>
                    <button
                      onClick={() => setShowRewardsPanel(true)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      <Trophy className="w-4 h-4" />
                      Rewards
                    </button>
                    <button
                      onClick={() => setShowDebugPanel(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      <Shield className="w-4 h-4" />
                      Debug Tracking
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white text-xl">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-green-400 text-2xl">✅ No Error Reports!</p>
                <p className="text-gray-400 mt-2">Everything is running smoothly</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div
                    key={report.id}
                    className={`bg-gray-800 border-2 rounded-xl p-6 ${
                      report.resolved ? 'border-green-600/30 opacity-60' : 'border-red-600/50'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-700 text-white px-3 py-1 rounded font-bold">
                          #{index + 1}
                        </span>
                        <div className="font-mono font-bold text-white text-xl">
                          {report.error_code}
                        </div>
                        {report.resolved ? (
                          <span className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                            ✅ Resolved
                          </span>
                        ) : (
                          <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                            ❌ Open
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400">
                        {new Date(report.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Error Message */}
                    <div className="bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 mb-4">
                      <div className="text-gray-400 text-sm mb-2">Error Message:</div>
                      <div className="text-white font-mono">{report.error_message}</div>
                    </div>

                    {/* User Description */}
                    {report.user_description && (
                      <div className="bg-blue-900/20 border-2 border-blue-600 rounded-lg p-4 mb-4">
                        <div className="text-blue-400 font-bold mb-2">👤 What User Was Doing:</div>
                        <div className="text-blue-100">{report.user_description}</div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {report.user_email && (
                        <div className="bg-gray-900/30 p-3 rounded-lg">
                          <div className="text-gray-500 text-xs mb-1">📧 Email</div>
                          <div className="text-white text-sm">{report.user_email}</div>
                        </div>
                      )}
                      {report.user_id && (
                        <div className="bg-gray-900/30 p-3 rounded-lg">
                          <div className="text-gray-500 text-xs mb-1">🆔 User ID</div>
                          <div className="text-white text-sm truncate">{report.user_id.substring(0, 16)}...</div>
                        </div>
                      )}
                      {report.url && (
                        <div className="bg-gray-900/30 p-3 rounded-lg col-span-2">
                          <div className="text-gray-500 text-xs mb-1">🔗 Page</div>
                          <div className="text-white text-sm truncate">{report.url}</div>
                        </div>
                      )}
                    </div>

                    {/* Stack Trace */}
                    {report.stack_trace && (
                      <details className="mb-2">
                        <summary className="text-gray-400 cursor-pointer hover:text-white font-bold">
                          📋 View Stack Trace
                        </summary>
                        <pre className="bg-gray-950 border-2 border-gray-700 rounded-lg p-4 text-white text-xs overflow-x-auto mt-2 max-h-64">
                          {report.stack_trace}
                        </pre>
                      </details>
                    )}

                    {/* Component Stack */}
                    {report.component_stack && (
                      <details>
                        <summary className="text-gray-400 cursor-pointer hover:text-white font-bold">
                          ⚛️ View Component Stack
                        </summary>
                        <pre className="bg-gray-950 border-2 border-gray-700 rounded-lg p-4 text-white text-xs overflow-x-auto mt-2 max-h-48">
                          {report.component_stack}
                        </pre>
                      </details>
                    )}

                    {/* Mark Complete/Delete Button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-900/80 border-t-4 border-gray-700 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-400">
                💡 Click "Copy All" to copy everything, then paste into AI chat
              </div>
              <div className="text-red-400 font-bold">
                🔒 ADMIN MODE - {adminInfo?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Panel Modal */}
        {showRewardsPanel && (
          <Suspense fallback={null}>
            <AdminRewardsPanel onClose={() => setShowRewardsPanel(false)} />
          </Suspense>
        )}

        {/* Debug Panel Modal */}
        {showDebugPanel && adminInfo && (
          <Suspense fallback={null}>
            <LeaderboardDebugPanel 
              onClose={() => setShowDebugPanel(false)} 
              adminEmail={adminInfo.email}
            />
          </Suspense>
        )}
      </div>
    );
  }

  return null;
}