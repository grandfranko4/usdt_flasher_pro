const { getAll, getById } = require('./utils/supabase');
const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to verify JWT token
const verifyToken = (authHeader) => {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verify token
    const user = verifyToken(event.headers.authorization);
    
    // Get license key ID from path
    const licenseKeyId = event.path.split('/').pop();
    
    if (!licenseKeyId || licenseKeyId === 'flash-history') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'License key ID is required' })
      };
    }

    // Get flash history for the license key
    const flashHistory = await getAll('flash_history', {
      license_key_id: licenseKeyId
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(flashHistory)
    };
  } catch (error) {
    console.error('Error in flash-history:', error);
    return {
      statusCode: error.message.includes('token') ? 401 : 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 