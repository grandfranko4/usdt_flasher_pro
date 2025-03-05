const { initializeDatabase, getAll, create } = require('./utils/fauna');
const bcrypt = require('bcryptjs');

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
    // Check for initialization key
    const { initKey } = JSON.parse(event.body);
    
    if (initKey !== process.env.INIT_KEY) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Initialize database structure
    await initializeDatabase();

    // Check if users collection is empty
    const users = await getAll('users');
    
    if (users.length === 0) {
      // Create default admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Gateway@523', salt);
      
      await create('users', {
        email: 'mikebtcretriever@gmail.com',
        password: hashedPassword,
        display_name: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString(),
        last_login: null
      });
    }

    // Check if contact_info collection is empty
    const contactInfo = await getAll('contact_info');
    
    if (contactInfo.length === 0) {
      // Create default contact info
      await create('contact_info', {
        primary_phone: '+447013216​28',
        secondary_phone: '+14693510740',
        tertiary_phone: '+91 7823232332',
        email: 'support@usdtflasherpro.com',
        website: 'https://usdtflasherpro.com',
        telegram_username: '@usdtflasherpro',
        discord_server: 'discord.gg/usdtflasherpro',
        updated_at: new Date().toISOString()
      });
    }

    // Check if app_settings collection is empty
    const appSettings = await getAll('app_settings');
    
    if (appSettings.length === 0) {
      // Create default app settings
      await create('app_settings', {
        app_version: '4.8',
        update_channel: 'stable',
        auto_update: 1,
        theme: 'dark',
        accent_color: '#00e6b8',
        animations_enabled: 1,
        session_timeout: 30,
        require_password_on_startup: 1,
        two_factor_auth: 0,
        default_network: 'trc20',
        max_flash_amount: 100000,
        default_delay_days: 0,
        default_delay_minutes: 0,
        debug_mode: 0,
        log_level: 'info',
        api_endpoint: 'https://api.usdtflasherpro.com/v1',
        updated_at: new Date().toISOString()
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Database initialized successfully' })
    };
  } catch (error) {
    console.error('Database initialization error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Database initialization failed' })
    };
  }
};
