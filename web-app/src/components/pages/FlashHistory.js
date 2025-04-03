import React, { useState, useEffect } from 'react';
import supabaseService from '../../services/supabase';

const FlashHistory = ({ licenseKey }) => {
  const [flashHistory, setFlashHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlashHistory = async () => {
      if (!licenseKey || !licenseKey.key) {
        setLoading(false);
        return;
      }

      try {
        const history = await supabaseService.getFlashHistory(licenseKey.key);
        setFlashHistory(history);
      } catch (err) {
        console.error('Error fetching flash history:', err);
        setError('Failed to load flash history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashHistory();
  }, [licenseKey]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Redirect to create flash section
  useEffect(() => {
    // Redirect to create flash section
    window.location.href = '/dashboard';
  }, []);

  return (
    <section id="flash-history" className="content-section">
      <h2>Flash History</h2>
      
      {loading ? (
        <div className="loading">Loading flash history...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : flashHistory.length === 0 ? (
        <div className="empty-state">
          <p>No flash history found.</p>
        </div>
      ) : (
        <div className="history-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Receiver Address</th>
                <th>Amount</th>
                <th>Network</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {flashHistory.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.timestamp)}</td>
                  <td className="address">{item.receiver_address}</td>
                  <td>{item.flash_amount} {item.currency}</td>
                  <td>{item.network}</td>
                  <td className="status success">Completed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default FlashHistory;
