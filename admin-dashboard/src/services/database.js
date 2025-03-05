// Import SQLite service (mock database)
import {
  getLicenseKeys,
  getLicenseKey,
  createLicenseKey,
  updateLicenseKey,
  deleteLicenseKey,
  getContactInfo,
  updateContactInfo,
  getContactInfoHistory,
  getAppSettings,
  updateAppSettings,
  getFlashHistory,
  authenticateUser
} from './sqlite-service';

// Import generateLicenseKey from API (keeping this function from the API)
import { generateLicenseKey } from './api';

// Map SQLite functions to the API function names for compatibility
export const fetchLicenseKeys = getLicenseKeys;
export const fetchLicenseKey = getLicenseKey;
export const addLicenseKey = createLicenseKey;
export const editLicenseKey = updateLicenseKey;
export const removeLicenseKey = deleteLicenseKey;
export const fetchContactInfo = getContactInfo;
export const saveContactInfo = updateContactInfo;
export const fetchContactHistory = getContactInfoHistory;
export const fetchAppSettings = getAppSettings;
export const saveAppSettings = updateAppSettings;
export const fetchFlashHistory = getFlashHistory;
export { generateLicenseKey };

// Export the authenticateUser function from SQLite service
export { authenticateUser };
