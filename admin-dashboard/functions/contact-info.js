const { getAll, getLatest, create } = require('./utils/supabase');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Get JWT secret and socket server URL from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '26a62eda86ec779538b7afc01fb196cdde5591fd6396bb91ba31693a9da50a58';
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3030';

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
    // For GET requests without authentication (public endpoint)
    if (event.httpMethod === 'GET' && event.path.endsWith('/contact-info')) {
      const contactInfo = await getLatest('contact_info');
      
      if (!contactInfo) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Contact information not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          primaryPhone: contactInfo.primary_phone,
          secondaryPhone: contactInfo.secondary_phone,
          tertiaryPhone: contactInfo.tertiary_phone,
          email: contactInfo.email,
          website: contactInfo.website,
          telegramUsername: contactInfo.telegram_username,
          discordServer: contactInfo.discord_server
        })
      };
    }

    // Verify token for other requests
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
        // Get contact info history
        if (event.path.endsWith('/history')) {
          const history = await getAll('contact_info_history');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(history)
          };
        } else {
          const contactInfo = await getLatest('contact_info');
          
          if (!contactInfo) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Contact information not found' })
            };
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              primaryPhone: contactInfo.primary_phone,
              secondaryPhone: contactInfo.secondary_phone,
              tertiaryPhone: contactInfo.tertiary_phone,
              email: contactInfo.email,
              website: contactInfo.website,
              telegramUsername: contactInfo.telegram_username,
              discordServer: contactInfo.discord_server
            })
          };
        }
      }
      
      case 'POST': {
        // Update contact info
        const data = JSON.parse(event.body);
        console.log('Received contact info data:', data);
        
        const user = verifyToken(event.headers.authorization);
        
        // Handle both frontend and backend field name formats
        const primaryPhone = data.primaryPhone || data.primary_phone;
        const secondaryPhone = data.secondaryPhone || data.secondary_phone;
        const tertiaryPhone = data.tertiaryPhone || data.tertiary_phone;
        
        // Validate required fields
        if (!primaryPhone || !secondaryPhone || !tertiaryPhone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
          };
        }
        
        // Get current contact info for history
        const currentContactInfo = await getLatest('contact_info');
        
        // Create new contact info with standardized backend field names
        const contactInfoData = {
          primary_phone: primaryPhone,
          secondary_phone: secondaryPhone,
          tertiary_phone: tertiaryPhone,
          email: data.email || '',
          website: data.website || '',
          telegram_username: data.telegramUsername || data.telegram_username || '',
          discord_server: data.discordServer || data.discord_server || '',
          updated_at: new Date().toISOString()
        };
        
        console.log('Creating contact info with data:', contactInfoData);
        
        const contactInfo = await create('contact_info', contactInfoData);
        
        // Add history entries for changed fields
        if (currentContactInfo) {
          const fields = [
            { key: 'primary_phone', newKey: 'primaryPhone' },
            { key: 'secondary_phone', newKey: 'secondaryPhone' },
            { key: 'tertiary_phone', newKey: 'tertiaryPhone' },
            { key: 'email', newKey: 'email' },
            { key: 'website', newKey: 'website' },
            { key: 'telegram_username', newKey: 'telegramUsername' },
            { key: 'discord_server', newKey: 'discordServer' }
          ];
          
          for (const field of fields) {
            const oldValue = currentContactInfo[field.key];
            const newValue = data[field.newKey];
            
            if (oldValue !== newValue) {
              await create('contact_info_history', {
                field: field.newKey,
                old_value: oldValue || '',
                new_value: newValue || '',
                timestamp: new Date().toISOString(),
                user: user.email
              });
            }
          }
        }
        
        // Prepare response data
        const responseData = {
          primaryPhone: data.primaryPhone,
          secondaryPhone: data.secondaryPhone,
          tertiaryPhone: data.tertiaryPhone,
          email: data.email || '',
          website: data.website || '',
          telegramUsername: data.telegramUsername || '',
          discordServer: data.discordServer || ''
        };
        
        // Broadcast contact info update to all connected clients
        try {
          console.log('Broadcasting contact info update to socket server');
          await axios.post(`${SOCKET_SERVER_URL}/broadcast-contact-info`, responseData);
        } catch (error) {
          console.error('Error broadcasting contact info update:', error);
          // Continue even if broadcasting fails
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(responseData)
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
    console.error('Contact info error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
