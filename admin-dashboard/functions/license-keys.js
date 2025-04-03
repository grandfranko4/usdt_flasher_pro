const { getAll, getById, create, update, remove } = require('./utils/supabase');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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
  console.log('License keys function called with event:', {
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    
    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET': {
        try {
          // Get all license keys or a specific one
          const id = event.path.split('/').pop();
          
          if (id && id !== 'license-keys') {
            console.log(`Getting license key with ID: ${id}`);
            const licenseKey = await getById('license_keys', id);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(licenseKey)
            };
          } else {
            console.log('Getting all license keys');
            const licenseKeys = await getAll('license_keys');
            console.log(`Retrieved ${licenseKeys.length} license keys`);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(licenseKeys)
            };
          }
        } catch (error) {
          console.error('Error fetching license keys:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error fetching license keys: ' + error.message })
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
        
        // Broadcast license key update to all connected clients
        try {
          console.log('Broadcasting license key update to socket server');
          const allLicenseKeys = await getAll('license_keys');
          await axios.post(`${SOCKET_SERVER_URL}/broadcast-license-keys`, allLicenseKeys);
        } catch (error) {
          console.error('Error broadcasting license key update:', error);
          // Continue even if broadcasting fails
        }
        
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
        
        // Broadcast license key update to all connected clients
        try {
          console.log('Broadcasting license key update to socket server');
          const allLicenseKeys = await getAll('license_keys');
          await axios.post(`${SOCKET_SERVER_URL}/broadcast-license-keys`, allLicenseKeys);
        } catch (error) {
          console.error('Error broadcasting license key update:', error);
          // Continue even if broadcasting fails
        }
        
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
        
        // Broadcast license key update to all connected clients
        try {
          console.log('Broadcasting license key update to socket server');
          const allLicenseKeys = await getAll('license_keys');
          await axios.post(`${SOCKET_SERVER_URL}/broadcast-license-keys`, allLicenseKeys);
        } catch (error) {
          console.error('Error broadcasting license key update:', error);
          // Continue even if broadcasting fails
        }
        
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
