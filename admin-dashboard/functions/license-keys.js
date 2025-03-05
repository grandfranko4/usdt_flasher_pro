const { getAll, getById, create, update, remove } = require('./utils/supabase');
const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '16d5009c5b3179797a01b5e905a573d04b89a9619d66bbb0c90bfcf7be013b4f';

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
    console.log('Verifying token with secret:', JWT_SECRET.substring(0, 10) + '...');
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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
    try {
      const user = verifyToken(event.headers.authorization);
      
      // Check if user has admin role
      if (user.role !== 'admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' })
        };
      }
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET': {
        // Get all license keys or a specific one
        const id = event.path.split('/').pop();
        
        if (id && id !== 'license-keys') {
          const licenseKey = await getById('license_keys', id);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(licenseKey)
          };
        } else {
          const licenseKeys = await getAll('license_keys');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(licenseKeys)
          };
        }
      }
      
      case 'POST': {
        // Create a new license key
        const data = JSON.parse(event.body);
        console.log('Received license key data:', data);
        
        // Handle both frontend and backend field name formats
        const key = data.key;
        const status = data.status;
        const expiresAt = data.expires_at || data.expiresAt;
        const user = data.user;
        
        // Validate required fields
        if (!key || !status || !expiresAt || !user) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
          };
        }
        
        const licenseKeyData = {
          key: key,
          status: status,
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          user: user
        };
        
        console.log('Creating license key with data:', licenseKeyData);
        
        const licenseKey = await create('license_keys', licenseKeyData);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(licenseKey)
        };
      }
      
      case 'PUT': {
        // Update a license key
        const id = event.path.split('/').pop();
        const data = JSON.parse(event.body);
        
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing license key ID' })
          };
        }
        
        const licenseKey = await update('license_keys', id, {
          key: data.key,
          status: data.status,
          expires_at: data.expires_at,
          user: data.user
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(licenseKey)
        };
      }
      
      case 'DELETE': {
        // Delete a license key
        const id = event.path.split('/').pop();
        
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing license key ID' })
          };
        }
        
        await remove('license_keys', id);
        
        return {
          statusCode: 204,
          headers,
          body: ''
        };
      }
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
  } catch (error) {
    console.error('License keys error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
