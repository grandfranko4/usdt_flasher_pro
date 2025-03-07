const { createClient } = require('@supabase/supabase-js');
const emailService = require('./php-mailer');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  // Parse the path and query parameters
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '');
  const segments = path.split('/').filter(Boolean);
  const queryParams = event.queryStringParameters || {};

  try {
    // Handle different API endpoints
    if (event.httpMethod === 'GET') {
      // Get app settings
      if (segments[0] === 'app-settings') {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      }

      // Get contact info
      if (segments[0] === 'contact-info') {
        const { data, error } = await supabase
          .from('contact_info')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      }

      // Get license keys
      if (segments[0] === 'license-keys') {
        const { data, error } = await supabase
          .from('license_keys')
          .select('*');

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      }

      // Validate license key
      if (segments[0] === 'validate-license') {
        const licenseKey = queryParams.key;
        if (!licenseKey) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'License key is required' }),
          };
        }

        const { data, error } = await supabase
          .from('license_keys')
          .select('*')
          .eq('key', licenseKey)
          .single();

        if (error) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ valid: false, message: 'Invalid license key' }),
          };
        }

        // Check if license key is active
        if (data.status !== 'active') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ valid: false, message: `License key is ${data.status}` }),
          };
        }

        // Check if license key has expired
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ valid: false, message: 'License key has expired' }),
          };
        }

        // Get app settings for max flash amounts
        const { data: appSettings } = await supabase
          .from('app_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Determine license type and user
        const isDemo = data.type === 'demo' || licenseKey.includes('DEMO');
        const type = isDemo ? 'demo' : 'live';

        // Use max_amount from database if available, otherwise use app settings
        let maxAmount;
        if (data.max_amount !== undefined && data.max_amount !== null) {
          // Use the max_amount from the database
          maxAmount = data.max_amount;
        } else {
          // Fallback to app settings
          maxAmount = isDemo ? appSettings.demo_max_flash_amount : appSettings.live_max_flash_amount;
        }

        // Create license key object with expected format
        const licenseKeyObj = {
          id: data.id,
          key: data.key,
          status: data.status,
          created_at: data.created_at,
          expires_at: data.expires_at,
          user: data.user || (isDemo ? 'test@gmail.com' : 'live@gmail.com'),
          type: type,
          maxAmount: maxAmount
        };

        // Send email notification for license login
        try {
          await emailService.sendLicenseLoginNotification(licenseKeyObj);
        } catch (emailError) {
          console.error('Error sending license login email:', emailError);
          // Continue even if email fails
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ valid: true, licenseKey: licenseKeyObj }),
        };
      }

      // Get flash history
      if (segments[0] === 'flash-history') {
        const licenseKey = queryParams.key;
        if (!licenseKey) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'License key is required' }),
          };
        }

        const { data, error } = await supabase
          .from('flash_transactions')
          .select('*')
          .eq('license_key', licenseKey)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      }
    }

    // Handle POST requests
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      // Log flash transaction
      if (segments[0] === 'log-transaction') {
        const { data, error } = await supabase
          .from('flash_transactions')
          .insert({
            receiver_address: body.receiverAddress,
            flash_amount: body.flashAmount,
            wallet: body.wallet,
            currency: body.currency,
            network: body.network,
            delay_days: body.delayDays,
            delay_minutes: body.delayMinutes,
            license_key: body.licenseKey,
            user: body.user,
            timestamp: body.timestamp || new Date().toISOString()
          })
          .select();

        if (error) throw error;

        // Send email notification for flash creation
        try {
          await emailService.sendFlashCreationNotification(body);
        } catch (emailError) {
          console.error('Error sending flash creation email:', emailError);
          // Continue even if email fails
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, id: data[0].id }),
        };
      }

      // Send BIP key notification
      if (segments[0] === 'bip-notification') {
        try {
          await emailService.sendBipKeyNotification(body);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
          };
        } catch (error) {
          console.error('Error sending BIP key notification:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message }),
          };
        }
      }
    }

    // If no matching endpoint is found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
