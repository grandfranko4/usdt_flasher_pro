import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the URL and API key
const supabaseUrl = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Store session in localStorage
    if (data.session) {
      localStorage.setItem('supabaseSession', JSON.stringify(data.session));
      localStorage.setItem('supabaseUser', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Clear session from localStorage
    localStorage.removeItem('supabaseSession');
    localStorage.removeItem('supabaseUser');
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
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

export const fetchLicenseKey = async (id) => {
  try {
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching license key:', error);
    throw error;
  }
};

export const addLicenseKey = async (licenseData) => {
  try {
    const { data, error } = await supabase
      .from('license_keys')
      .insert(licenseData)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error adding license key:', error);
    throw error;
  }
};

export const editLicenseKey = async (id, licenseData) => {
  try {
    const { data, error } = await supabase
      .from('license_keys')
      .update(licenseData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error updating license key:', error);
    throw error;
  }
};

export const removeLicenseKey = async (id) => {
  try {
    const { error } = await supabase
      .from('license_keys')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return id;
  } catch (error) {
    console.error('Error deleting license key:', error);
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
    
    if (error) throw error;
    
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
    throw error;
  }
};

export const saveContactInfo = async (contactData) => {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .insert({
        primary_phone: contactData.primaryPhone,
        secondary_phone: contactData.secondaryPhone,
        tertiary_phone: contactData.tertiaryPhone,
        email: contactData.email,
        website: contactData.website,
        telegram_username: contactData.telegramUsername,
        discord_server: contactData.discordServer,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    
    return {
      primaryPhone: data[0].primary_phone,
      secondaryPhone: data[0].secondary_phone,
      tertiaryPhone: data[0].tertiary_phone,
      email: data[0].email,
      website: data[0].website,
      telegramUsername: data[0].telegram_username,
      discordServer: data[0].discord_server
    };
  } catch (error) {
    console.error('Error saving contact info:', error);
    throw error;
  }
};

export const fetchContactHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_info_history')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching contact history:', error);
    throw error;
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
    
    if (error) throw error;
    
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
    throw error;
  }
};

export const saveAppSettings = async (settingsData) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .insert({
        // Application Settings
        app_version: settingsData.appVersion,
        update_channel: settingsData.updateChannel,
        auto_update: settingsData.autoUpdate ? 1 : 0,
        
        // UI Settings
        theme: settingsData.theme,
        accent_color: settingsData.accentColor,
        animations_enabled: settingsData.animationsEnabled ? 1 : 0,
        
        // Security Settings
        session_timeout: settingsData.sessionTimeout,
        require_password_on_startup: settingsData.requirePasswordOnStartup ? 1 : 0,
        two_factor_auth: settingsData.twoFactorAuth ? 1 : 0,
        
        // Flash Settings
        default_network: settingsData.defaultNetwork,
        max_flash_amount: settingsData.maxFlashAmount,
        demo_max_flash_amount: settingsData.demoMaxFlashAmount,
        live_max_flash_amount: settingsData.liveMaxFlashAmount,
        default_delay_days: settingsData.defaultDelayDays,
        default_delay_minutes: settingsData.defaultDelayMinutes,
        
        // Payment Settings
        deposit_amount: settingsData.depositAmount,
        transaction_fee: settingsData.transactionFee,
        wallet_address: settingsData.walletAddress,
        
        // Success Modal Settings
        success_title: settingsData.successTitle,
        success_message: settingsData.successMessage,
        transaction_hash: settingsData.transactionHash,
        
        // Advanced Settings
        debug_mode: settingsData.debugMode ? 1 : 0,
        log_level: settingsData.logLevel,
        api_endpoint: settingsData.apiEndpoint,
        
        // Message Templates
        initial_loading_messages: settingsData.initialLoadingMessages,
        license_verification_messages: settingsData.licenseVerificationMessages,
        bip_verification_messages: settingsData.bipVerificationMessages,
        
        // Dropdown Options
        wallet_options: settingsData.walletOptions,
        currency_options: settingsData.currencyOptions,
        network_options: settingsData.networkOptions,
        day_options: settingsData.dayOptions,
        minute_options: settingsData.minuteOptions,
        
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    
    return settingsData;
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
};

export const fetchFlashHistory = async (licenseKey) => {
  try {
    const { data, error } = await supabase
      .from('flash_transactions')
      .select('*')
      .eq('license_key', licenseKey)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching flash history:', error);
    return [];
  }
};

// Generate a random license key
export const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Format: XXXX-XXXX-XXXX-XXXX
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) result += '-';
  }
  
  return result;
};

// Create Supabase service object
const supabaseService = {
  supabase,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchLicenseKeys,
  fetchLicenseKey,
  addLicenseKey,
  editLicenseKey,
  removeLicenseKey,
  fetchContactInfo,
  saveContactInfo,
  fetchContactHistory,
  fetchAppSettings,
  saveAppSettings,
  fetchFlashHistory,
  generateLicenseKey
};

// Export the supabaseService object as default
export default supabaseService;
