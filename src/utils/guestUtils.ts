/**
 * Utility functions for guest account handling
 * Guest accounts should NEVER save any data to localStorage or server
 */

export function isGuestAccount(email: string | undefined): boolean {
  if (!email) return false;
  return email.includes('@temporary.local');
}

export function isGuestProfile(profile: { email: string } | null | undefined): boolean {
  if (!profile?.email) return false;
  return isGuestAccount(profile.email);
}

/**
 * Clear all guest-related data from localStorage
 * This should be called when a guest session ends
 */
export function clearGuestData(): void {
  // Remove any accidentally saved guest profiles
  const savedProfile = localStorage.getItem('rollers-paradise-profile');
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile);
      if (isGuestAccount(parsed.email)) {
        localStorage.removeItem('rollers-paradise-profile');
        console.log('👻 Cleared guest profile from storage');
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Remove old userProfile key (legacy)
  const oldProfile = localStorage.getItem('userProfile');
  if (oldProfile) {
    try {
      const parsed = JSON.parse(oldProfile);
      if (isGuestAccount(parsed.email)) {
        localStorage.removeItem('userProfile');
        console.log('👻 Cleared legacy guest profile from storage');
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Clear progression data for guests
  localStorage.removeItem('player-progression-v2');
  
  // Clear daily rewards for guests
  localStorage.removeItem('daily-rewards-data-v2');
  
  // Clear achievement data for guests
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('achievement-claimed-') || key.startsWith('achievement-seen-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear playlists for guests
  localStorage.removeItem('rollers-paradise-playlists');
  
  console.log('🧹 All guest data cleared');
}

/**
 * Safe localStorage setter that checks for guest accounts
 * Only saves if the user is NOT a guest
 */
export function safeLocalStorageSet(
  key: string, 
  value: string, 
  profile: { email: string } | null | undefined
): boolean {
  if (isGuestProfile(profile)) {
    console.log(`👻 Blocked save for guest account: ${key}`);
    return false;
  }
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}
