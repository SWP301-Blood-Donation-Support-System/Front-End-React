import { AdminAPI } from '../api/admin';

// Default password that new staff accounts are created with
export const DEFAULT_STAFF_PASSWORD = 'staff123';

/**
 * Check if a staff member still has the default password
 * We track this by checking if they logged in with the default password
 */
export const checkIfDefaultPassword = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userId = userInfo?.UserId || userInfo?.UserID;
    
    if (!userId) return false;
    
    // Check if user is marked as having default password (only set when they login with default password)
    const hasDefaultPassword = localStorage.getItem(`hasDefaultPassword_${userId}`) === 'true';
    
    return hasDefaultPassword;
  } catch (error) {
    // If there's an error, assume they don't have default password
    return false;
  }
};

/**
 * Mark that a user logged in with the default password
 */
export const markAsDefaultPassword = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userId = userInfo?.UserId || userInfo?.UserID;
    if (userId) {
      localStorage.setItem(`hasDefaultPassword_${userId}`, 'true');
    }
  } catch (error) {
    console.error('Error marking as default password:', error);
  }
};

/**
 * Mark that a user has successfully changed their password from default
 */
export const markPasswordAsChanged = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userId = userInfo?.UserId || userInfo?.UserID;
    if (userId) {
      // Remove the default password flag
      localStorage.removeItem(`hasDefaultPassword_${userId}`);
      // Also set the changed password flag for backwards compatibility
      localStorage.setItem(`hasChangedPassword_${userId}`, 'true');
    }
  } catch (error) {
    console.error('Error marking password as changed:', error);
  }
};

/**
 * Check if the login credentials match the default password
 */
export const isDefaultPasswordLogin = (password) => {
  return password === DEFAULT_STAFF_PASSWORD;
};

/**
 * Validate that the new password is not the same as the default password
 */
export const validateNewPassword = (newPassword) => {
  if (newPassword === DEFAULT_STAFF_PASSWORD) {
    throw new Error('Mật khẩu mới không được giống với mật khẩu mặc định!');
  }
  return true;
};

/**
 * Check if user is staff (roleId = 2)
 */
export const isStaffUser = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userRoleId = userInfo?.RoleID || userInfo?.roleId;
    return userRoleId === 2 || userRoleId === "2";
  } catch (error) {
    return false;
  }
};

/**
 * Check if user is admin (roleId = 1)
 */
export const isAdminUser = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userRoleId = userInfo?.RoleID || userInfo?.roleId;
    return userRoleId === 1 || userRoleId === "1";
  } catch (error) {
    return false;
  }
};

/**
 * Check if user has admin or staff privileges (roleId = 1 or 2)
 */
export const hasAdminAccess = () => {
  return isAdminUser() || isStaffUser();
};

/**
 * Clean up old localStorage entries from previous implementation
 * This should be called once to migrate from old system
 */
export const cleanupOldPasswordFlags = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      // Remove old hasChangedPassword entries (we still keep them for backwards compatibility but clean duplicates)
      if (key.startsWith('hasChangedPassword_')) {
        // If we have both old and new flags, prioritize the new logic
        const userId = key.replace('hasChangedPassword_', '');
        const hasDefaultFlag = localStorage.getItem(`hasDefaultPassword_${userId}`);
        
        // If there's no default password flag, this user likely changed their password outside our system
        // So we should NOT mark them as having default password
        if (!hasDefaultFlag) {
          // Keep the old flag to indicate they don't have default password
          // But we won't use this for new users
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up old password flags:', error);
  }
};

/**
 * Get staff information from localStorage
 */
export const getStaffInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch (error) {
    return null;
  }
}; 