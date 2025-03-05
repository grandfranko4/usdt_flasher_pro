const { getAll, getById, create, update, remove } = require('./utils/fauna');
const jwt = require('jsonwebtoken');

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
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
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
        
        // Validate required fields
        if (!data.key || !data.status || !data.expires_at || !data.user) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
          };
        }
        
        const licenseKey = await create('license_keys', {
          key: data.key,
          status: data.status,
          created_at: new Date().toISOString(),
          expires_at: data.expires_at,
          user: data.user
        });
        
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
