import React, { useState, useEffect } from 'react';
import { fallbackContactInfo } from '../../constants';

// Modal component
const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content info-modal-content">
        <div className="modal-header info-modal-header">
          <h2>Important Information</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="info-content">
            <p className="info-title">Web App Server Maintenance Fee</p>
            <p className="info-description">
              This web app version runs on our server and requires a server maintenance fee of <strong>$50</strong>.
            </p>
            <p className="info-description">
              For a more cost-effective solution, please contact our support team to get the software version that you can run locally on your computer without any recurring fees.
            </p>
          </div>
          <button className="action-btn primary" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const LicensePage = ({ onValidateLicenseKey, contactInfo }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Use fallback contact info if not provided
  const contactDetails = contactInfo || fallbackContactInfo;
  
  // Show info modal when component mounts
  useEffect(() => {
    // Show the modal after a short delay to ensure it appears after the page loads
    const timer = setTimeout(() => {
      setInfoModalOpen(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onValidateLicenseKey(licenseKey);
      
      if (!result.success) {
        setError(result.message || 'Invalid license key');
      }
    } catch (error) {
      console.error('Error validating license key:', error);
      setError('Error validating license key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="license-container">
      <div className="license-card">
        <div className="license-logo">
          <img src="/assets/USDT_FLASHER Logo.png" alt="USDT FLASHER PRO Logo" />
          <h1>USDT FLASHER PRO</h1>
        </div>
        
        <form className="license-form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="license-key"
            placeholder="Enter License Key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            disabled={loading}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="activate-btn"
            disabled={loading}
          >
            {loading ? 'Validating...' : 'GET STARTED'}
          </button>
          
          <button 
            type="button"
            className="info-btn"
            onClick={() => setInfoModalOpen(true)}
          >
            Server Information
          </button>
        </form>
        
        <div className="license-footer">
          <p id="contact-info">
            support: {contactDetails.primaryPhone} | {contactDetails.secondaryPhone} | {contactDetails.tertiaryPhone}
          </p>
        </div>
      </div>
      
      {/* Information Modal */}
      <InfoModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
      />
    </div>
  );
};

export default LicensePage;
