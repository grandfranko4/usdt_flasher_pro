const { getAll, getById } = require('./utils/supabase');
const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables
const JWT_SECRET = 'ZTpSvcoYIjPq5CruYmeO8oaWJn3lMMCV35kNmQaiWi7Ksf2/YAjfmTHricptbxHEj2CKkBu2P4Y/vCt7XThXVw==';

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET environment variable');
  throw new Error('Missing JWT_SECRET environment variable');
}

console.log('JWT_SECRET is set:', JWT_SECRET.substring(0, 5) + '...');

// Helper function to verify JWT token
const verifyToken = (authHeader) => {
  console.log('Verifying token with auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', { userId: decoded.sub });
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

exports.handler = async (event, context) => {
  console.log('Flash history function called with event:', {
    method: event.httpMethod,
    path: event.path,
    headers: {
      ...event.headers,
      authorization: event.headers.authorization ? 'Bearer [REDACTED]' : undefined
    }
  });

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
    console.log('Authenticated user:', user);
    
    // Get license key ID from path
    const licenseKeyId = event.path.split('/').pop();
    console.log('License key ID from path:', licenseKeyId);
    
    if (!licenseKeyId || licenseKeyId === 'flash-history') {
      console.log('Invalid license key ID');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'License key ID is required' })
      };
    }

    // Get flash history for the license key
    console.log(`Getting flash history for license key ID: ${licenseKeyId}`);
    const flashHistory = await getAll('flash_history', {
      license_key_id: licenseKeyId
    });
    console.log(`Retrieved ${flashHistory.length} flash history records`);

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