const { signIn } = require('./utils/supabase');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Email and password are required' })
      };
    }

    // Sign in with Supabase
    try {
      const authData = await signIn(email, password);
      
      if (!authData || !authData.user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, message: 'Invalid email or password' })
        };
      }
      
      const user = authData.user;
      const userData = user.user_metadata || {};
      
      // Create JWT token for compatibility with existing frontend
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: userData.role || 'user'
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '1d' }
      );
      
      // Return user data and token
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            displayName: userData.display_name || user.email,
            role: userData.role || 'user'
          },
          token,
          supabaseToken: authData.session.access_token
        })
      };
    } catch (error) {
      console.error('Supabase authentication error:', error);
      
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid email or password' })
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Authentication error' })
    };
  }
};
