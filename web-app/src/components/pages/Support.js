import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { fallbackContactInfo } from '../../constants';

const Support = () => {
  const { contactInfo } = useApp();
  
  // Use fallback contact info if not provided
  const contactDetails = contactInfo || fallbackContactInfo;

  // Redirect to create flash section
  useEffect(() => {
    // Open support in a new window
    const openSupportWindow = () => {
      const supportWindow = window.open('', 'support_window', 'width=800,height=600');
      
      if (!supportWindow) {
        console.error('Failed to open support window. Popup might be blocked.');
        return;
      }
      
      // Write content to the new window
      supportWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>USDT FLASHER PRO - Support</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #1a1a1a;
              color: #f5f6fa;
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            
            .support-page {
              max-width: 800px;
              margin: 0 auto;
              padding: 30px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 1px solid #333;
            }
            
            .header img {
              width: 100px;
              height: auto;
              margin-bottom: 15px;
            }
            
            .header h1 {
              color: #00e6b8;
              margin: 0;
            }
            
            .support-section {
              margin-bottom: 40px;
              background-color: #222;
              border-radius: 10px;
              padding: 20px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .support-section h2 {
              color: #00e6b8;
              margin-top: 0;
              padding-bottom: 10px;
              border-bottom: 1px solid #333;
            }
            
            .contact-list {
              list-style-type: none;
              padding: 0;
            }
            
            .contact-list li {
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            
            .contact-list li:before {
              content: "📞";
              margin-right: 10px;
            }
            
            .contact-item {
              margin-bottom: 15px;
            }
            
            .contact-item .label {
              font-weight: bold;
              color: #00e6b8;
              margin-right: 10px;
            }
            
            .faq-item {
              margin-bottom: 20px;
              border-bottom: 1px solid #333;
              padding-bottom: 20px;
            }
            
            .faq-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .faq-question {
              font-weight: bold;
              color: #00e6b8;
              margin-bottom: 10px;
              cursor: pointer;
            }
            
            .faq-answer {
              color: #ddd;
              padding-left: 15px;
              border-left: 2px solid #00e6b8;
            }
            
            .close-btn {
              display: block;
              width: 200px;
              margin: 30px auto;
              padding: 10px;
              background-color: #00e6b8;
              color: #000;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
              text-align: center;
            }
            
            .close-btn:hover {
              background-color: #00c9a0;
            }
          </style>
        </head>
        <body>
          <div class="support-page">
            <div class="header">
              <img src="/assets/USDT_FLASHER Logo.png" alt="USDT FLASHER PRO Logo">
              <h1>USDT FLASHER PRO Support</h1>
            </div>
            
            <div class="support-section">
              <h2>Contact Information</h2>
              <ul class="contact-list" id="support-contact-list">
                <li>${contactDetails.primaryPhone}</li>
                <li>${contactDetails.secondaryPhone}</li>
                <li>${contactDetails.tertiaryPhone}</li>
              </ul>
              
              <div class="contact-item">
                <span class="label">Email:</span>
                <span id="support-email">${contactDetails.email}</span>
              </div>
              
              <div class="contact-item">
                <span class="label">Website:</span>
                <span id="support-website">${contactDetails.website}</span>
              </div>
              
              <div class="contact-item">
                <span class="label">Telegram:</span>
                <span id="support-telegram">${contactDetails.telegramUsername}</span>
              </div>
              
              <div class="contact-item">
                <span class="label">Discord:</span>
                <span id="support-discord">${contactDetails.discordServer}</span>
              </div>
            </div>
            
            <div class="support-section">
              <h2>Frequently Asked Questions</h2>
              
              <div class="faq-item">
                <div class="faq-question">How do I activate my license key?</div>
                <div class="faq-answer">
                  Enter your license key on the activation screen and click "GET STARTED". 
                  If your key is valid, you will be granted access to the application.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question">How long does a flash transaction take?</div>
                <div class="faq-answer">
                  Flash transactions are typically processed within minutes, but can be delayed 
                  based on your delay settings. You can set delays in days and minutes.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question">What networks are supported?</div>
                <div class="faq-answer">
                  USDT FLASHER PRO supports multiple networks including TRC20 (Tron), 
                  ERC20 (Ethereum), BEP20 (Binance Smart Chain), SOL (Solana), and MATIC (Polygon).
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question">How do I get technical support?</div>
                <div class="faq-answer">
                  For technical support, please contact us using any of the contact methods 
                  listed above. Our support team is available 24/7 to assist you.
                </div>
              </div>
            </div>
            
            <button class="close-btn" onclick="window.close()">Close Support</button>
          </div>
        </body>
        </html>
      `);
      
      // Close the document
      supportWindow.document.close();
      
      // Redirect to create flash section
      window.location.href = '/dashboard';
    };
    
    openSupportWindow();
  }, [contactInfo, contactDetails]);

  return (
    <section id="support" className="content-section">
      <h2>Support</h2>
      <div className="support-container">
        <div className="support-info">
          <p>Opening support in a new window...</p>
        </div>
      </div>
    </section>
  );
};

export default Support;
