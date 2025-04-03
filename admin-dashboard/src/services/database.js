// Import API service (real database)
import apiService, {
  fetchLicenseKeys,
  fetchLicenseKey,
  addLicenseKey,
  editLicenseKey,
  removeLicenseKey,
  fetchContactInfo,
  saveContactInfo,
  fetchContactHistory,
  fetchAppSettings,
  saveAppSettings,
  fetchFlashHistory,
  generateLicenseKey,
  login as authenticateUser
} from './api';

// Export all API functions directly
export {
  fetchLicenseKeys,
  fetchLicenseKey,
  addLicenseKey,
  editLicenseKey,
  removeLicenseKey,
  fetchContactInfo,
  saveContactInfo,
  fetchContactHistory,
  fetchAppSettings,
  saveAppSettings,
  fetchFlashHistory,
  generateLicenseKey,
  authenticateUser
};

// Export the API service as default
export default apiService;
