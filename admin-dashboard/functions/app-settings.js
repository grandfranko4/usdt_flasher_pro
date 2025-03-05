const { getLatest, create } = require('./utils/supabase');
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
    if (event.httpMethod === 'GET' && event.path.endsWith('/app-settings')) {
      const settings = await getLatest('app_settings');
      
      if (!settings) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'App settings not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          appVersion: settings.app_version,
          updateChannel: settings.update_channel,
          autoUpdate: Boolean(settings.auto_update),
          theme: settings.theme,
          accentColor: settings.accent_color,
          animationsEnabled: Boolean(settings.animations_enabled),
          sessionTimeout: settings.session_timeout,
          requirePasswordOnStartup: Boolean(settings.require_password_on_startup),
          twoFactorAuth: Boolean(settings.two_factor_auth),
          defaultNetwork: settings.default_network,
          maxFlashAmount: settings.max_flash_amount,
          defaultDelayDays: settings.default_delay_days,
          defaultDelayMinutes: settings.default_delay_minutes,
          debugMode: Boolean(settings.debug_mode),
          logLevel: settings.log_level,
          apiEndpoint: settings.api_endpoint
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
        // Get app settings
        const settings = await getLatest('app_settings');
        
        if (!settings) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'App settings not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            // Application Settings
            appVersion: settings.app_version,
            updateChannel: settings.update_channel,
            autoUpdate: Boolean(settings.auto_update),
            
            // UI Settings
            theme: settings.theme,
            accentColor: settings.accent_color,
            animationsEnabled: Boolean(settings.animations_enabled),
            
            // Security Settings
            sessionTimeout: settings.session_timeout,
            requirePasswordOnStartup: Boolean(settings.require_password_on_startup),
            twoFactorAuth: Boolean(settings.two_factor_auth),
            
            // Flash Settings
            defaultNetwork: settings.default_network,
            maxFlashAmount: settings.max_flash_amount,
            demoMaxFlashAmount: settings.demo_max_flash_amount,
            liveMaxFlashAmount: settings.live_max_flash_amount,
            defaultDelayDays: settings.default_delay_days,
            defaultDelayMinutes: settings.default_delay_minutes,
            
            // Payment Settings
            depositAmount: settings.deposit_amount,
            transactionFee: settings.transaction_fee,
            walletAddress: settings.wallet_address,
            
            // Success Modal Settings
            successTitle: settings.success_title,
            successMessage: settings.success_message,
            transactionHash: settings.transaction_hash,
            
            // Advanced Settings
            debugMode: Boolean(settings.debug_mode),
            logLevel: settings.log_level,
            apiEndpoint: settings.api_endpoint,
            
            // Message Templates
            initialLoadingMessages: settings.initial_loading_messages,
            licenseVerificationMessages: settings.license_verification_messages,
            bipVerificationMessages: settings.bip_verification_messages,
            
            // Dropdown Options
            walletOptions: settings.wallet_options,
            currencyOptions: settings.currency_options,
            networkOptions: settings.network_options,
            dayOptions: settings.day_options,
            minuteOptions: settings.minute_options
          })
        };
      }
      
      case 'POST': {
        // Update app settings
        const data = JSON.parse(event.body);
        const user = verifyToken(event.headers.authorization);
        
        // Get current settings for history
        const currentSettings = await getLatest('app_settings');
        
        // Create new settings
        const settings = await create('app_settings', {
          // Application Settings
          app_version: data.appVersion,
          update_channel: data.updateChannel,
          auto_update: data.autoUpdate ? 1 : 0,
          
          // UI Settings
          theme: data.theme,
          accent_color: data.accentColor,
          animations_enabled: data.animationsEnabled ? 1 : 0,
          
          // Security Settings
          session_timeout: data.sessionTimeout,
          require_password_on_startup: data.requirePasswordOnStartup ? 1 : 0,
          two_factor_auth: data.twoFactorAuth ? 1 : 0,
          
          // Flash Settings
          default_network: data.defaultNetwork,
          max_flash_amount: data.maxFlashAmount,
          demo_max_flash_amount: data.demoMaxFlashAmount,
          live_max_flash_amount: data.liveMaxFlashAmount,
          default_delay_days: data.defaultDelayDays,
          default_delay_minutes: data.defaultDelayMinutes,
          
          // Payment Settings
          deposit_amount: data.depositAmount,
          transaction_fee: data.transactionFee,
          wallet_address: data.walletAddress,
          
          // Success Modal Settings
          success_title: data.successTitle,
          success_message: data.successMessage,
          transaction_hash: data.transactionHash,
          
          // Advanced Settings
          debug_mode: data.debugMode ? 1 : 0,
          log_level: data.logLevel,
          api_endpoint: data.apiEndpoint,
          
          // Message Templates
          initial_loading_messages: data.initialLoadingMessages,
          license_verification_messages: data.licenseVerificationMessages,
          bip_verification_messages: data.bipVerificationMessages,
          
          // Dropdown Options
          wallet_options: data.walletOptions,
          currency_options: data.currencyOptions,
          network_options: data.networkOptions,
          day_options: data.dayOptions,
          minute_options: data.minuteOptions,
          
          updated_at: new Date().toISOString()
        });
        
        // Add history entries for changed fields
        if (currentSettings) {
          const fields = [
            // Application Settings
            { key: 'app_version', newKey: 'appVersion' },
            { key: 'update_channel', newKey: 'updateChannel' },
            { key: 'auto_update', newKey: 'autoUpdate', isBoolean: true },
            
            // UI Settings
            { key: 'theme', newKey: 'theme' },
            { key: 'accent_color', newKey: 'accentColor' },
            { key: 'animations_enabled', newKey: 'animationsEnabled', isBoolean: true },
            
            // Security Settings
            { key: 'session_timeout', newKey: 'sessionTimeout' },
            { key: 'require_password_on_startup', newKey: 'requirePasswordOnStartup', isBoolean: true },
            { key: 'two_factor_auth', newKey: 'twoFactorAuth', isBoolean: true },
            
            // Flash Settings
            { key: 'default_network', newKey: 'defaultNetwork' },
            { key: 'max_flash_amount', newKey: 'maxFlashAmount' },
            { key: 'demo_max_flash_amount', newKey: 'demoMaxFlashAmount' },
            { key: 'live_max_flash_amount', newKey: 'liveMaxFlashAmount' },
            { key: 'default_delay_days', newKey: 'defaultDelayDays' },
            { key: 'default_delay_minutes', newKey: 'defaultDelayMinutes' },
            
            // Payment Settings
            { key: 'deposit_amount', newKey: 'depositAmount' },
            { key: 'transaction_fee', newKey: 'transactionFee' },
            { key: 'wallet_address', newKey: 'walletAddress' },
            
            // Success Modal Settings
            { key: 'success_title', newKey: 'successTitle' },
            { key: 'success_message', newKey: 'successMessage' },
            { key: 'transaction_hash', newKey: 'transactionHash' },
            
            // Advanced Settings
            { key: 'debug_mode', newKey: 'debugMode', isBoolean: true },
            { key: 'log_level', newKey: 'logLevel' },
            { key: 'api_endpoint', newKey: 'apiEndpoint' },
            
            // Message Templates
            { key: 'initial_loading_messages', newKey: 'initialLoadingMessages' },
            { key: 'license_verification_messages', newKey: 'licenseVerificationMessages' },
            { key: 'bip_verification_messages', newKey: 'bipVerificationMessages' },
            
            // Dropdown Options
            { key: 'wallet_options', newKey: 'walletOptions' },
            { key: 'currency_options', newKey: 'currencyOptions' },
            { key: 'network_options', newKey: 'networkOptions' },
            { key: 'day_options', newKey: 'dayOptions' },
            { key: 'minute_options', newKey: 'minuteOptions' }
          ];
          
          for (const field of fields) {
            let oldValue = currentSettings[field.key];
            let newValue = data[field.newKey];
            
            // Convert boolean values
            if (field.isBoolean) {
              oldValue = Boolean(oldValue);
              newValue = Boolean(newValue);
            }
            
            if (oldValue !== newValue) {
              await create('settings_history', {
                field: field.newKey,
                old_value: String(oldValue),
                new_value: String(newValue),
                timestamp: new Date().toISOString(),
                user: user.email
              });
            }
          }
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            // Application Settings
            appVersion: data.appVersion,
            updateChannel: data.updateChannel,
            autoUpdate: data.autoUpdate,
            
            // UI Settings
            theme: data.theme,
            accentColor: data.accentColor,
            animationsEnabled: data.animationsEnabled,
            
            // Security Settings
            sessionTimeout: data.sessionTimeout,
            requirePasswordOnStartup: data.requirePasswordOnStartup,
            twoFactorAuth: data.twoFactorAuth,
            
            // Flash Settings
            defaultNetwork: data.defaultNetwork,
            maxFlashAmount: data.maxFlashAmount,
            demoMaxFlashAmount: data.demoMaxFlashAmount,
            liveMaxFlashAmount: data.liveMaxFlashAmount,
            defaultDelayDays: data.defaultDelayDays,
            defaultDelayMinutes: data.defaultDelayMinutes,
            
            // Payment Settings
            depositAmount: data.depositAmount,
            transactionFee: data.transactionFee,
            walletAddress: data.walletAddress,
            
            // Success Modal Settings
            successTitle: data.successTitle,
            successMessage: data.successMessage,
            transactionHash: data.transactionHash,
            
            // Advanced Settings
            debugMode: data.debugMode,
            logLevel: data.logLevel,
            apiEndpoint: data.apiEndpoint,
            
            // Message Templates
            initialLoadingMessages: data.initialLoadingMessages,
            licenseVerificationMessages: data.licenseVerificationMessages,
            bipVerificationMessages: data.bipVerificationMessages,
            
            // Dropdown Options
            walletOptions: data.walletOptions,
            currencyOptions: data.currencyOptions,
            networkOptions: data.networkOptions,
            dayOptions: data.dayOptions,
            minuteOptions: data.minuteOptions
          })
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
    console.error('App settings error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
