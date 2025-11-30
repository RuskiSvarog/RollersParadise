/**
 * Admin Permissions System
 * Owner: Ruski (avgelatt@gmail.com)
 * Owner can grant/revoke admin access to other users
 */

// Helper function to get user email from localStorage
function getUserFromLocalStorage(): { email: string } | null {
  try {
    // Check both possible localStorage keys
    const savedProfile = localStorage.getItem('rollers-paradise-profile') || localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      return { email: profile.email };
    }
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
  }
  return null;
}

export interface AdminUser {
  user_id: string;
  email: string;
  username: string;
  phone?: string;
  role: 'owner' | 'admin' | 'coder' | 'viewer';
  granted_by: string;
  granted_at: string;
  is_active: boolean;
}

// OWNER CREDENTIALS
export const OWNER_INFO = {
  email: 'avgelatt@gmail.com',
  username: 'Ruski',
  phone: '913-213-8666',
  role: 'owner' as const,
};

/**
 * Check if current user has admin access
 */
export async function checkAdminAccess(userId: string): Promise<{
  hasAccess: boolean;
  role?: 'owner' | 'admin' | 'coder' | 'viewer';
  isOwner: boolean;
}> {
  try {
    // Get user's email from localStorage
    const user = getUserFromLocalStorage();
    
    if (!user) {
      return { hasAccess: false, isOwner: false };
    }

    // Check if user is the owner
    if (user.email === OWNER_INFO.email) {
      return { 
        hasAccess: true, 
        role: 'owner',
        isOwner: true 
      };
    }

    // Check if user has been granted admin access
    const { projectId, publicAnonKey } = await import('./supabase/info');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/admin/check-access`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userId,
          email: user.email 
        }),
      }
    );

    if (!response.ok) {
      return { hasAccess: false, isOwner: false };
    }

    const data = await response.json();
    return {
      hasAccess: data.hasAccess || false,
      role: data.role,
      isOwner: false,
    };
  } catch (error) {
    console.error('Error checking admin access:', error);
    return { hasAccess: false, isOwner: false };
  }
}

/**
 * Get all admin users (Owner only)
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/admin/users`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch admin users');
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

/**
 * Grant admin access to a user (Owner only)
 */
export async function grantAdminAccess(
  email: string,
  role: 'admin' | 'coder' | 'viewer'
): Promise<{ success: boolean; message: string }> {
  try {
    const user = getUserFromLocalStorage();
    
    if (!user || user.email !== OWNER_INFO.email) {
      return { success: false, message: 'Only owner can grant access' };
    }

    const { projectId, publicAnonKey } = await import('./supabase/info');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/admin/grant-access`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          role,
          grantedBy: user.email 
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, message: error.message || 'Failed to grant access' };
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error granting admin access:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Revoke admin access from a user (Owner only)
 */
export async function revokeAdminAccess(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = getUserFromLocalStorage();
    
    if (!user || user.email !== OWNER_INFO.email) {
      return { success: false, message: 'Only owner can revoke access' };
    }

    const { projectId, publicAnonKey } = await import('./supabase/info');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/admin/revoke-access`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, message: error.message || 'Failed to revoke access' };
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error revoking admin access:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get current user's admin info
 */
export async function getCurrentAdminInfo(): Promise<{
  isAdmin: boolean;
  role?: string;
  email?: string;
  username?: string;
}> {
  try {
    const user = getUserFromLocalStorage();
    
    if (!user) {
      return { isAdmin: false };
    }

    const access = await checkAdminAccess(user.email);
    
    if (!access.hasAccess) {
      return { isAdmin: false };
    }

    return {
      isAdmin: true,
      role: access.role,
      email: user.email,
      username: user.email?.split('@')[0],
    };
  } catch (error) {
    console.error('Error getting admin info:', error);
    return { isAdmin: false };
  }
}