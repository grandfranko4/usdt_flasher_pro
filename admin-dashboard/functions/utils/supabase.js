const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the URL and API key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Log environment variables (safely)
console.log('Supabase environment variables:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing required Supabase environment variables');
}

// Initialize Supabase client with additional options
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session in Netlify functions
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'usdt-flasher-pro'
    }
  }
});

// Test the Supabase connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('license_keys').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}

// Run the connection test
testConnection().then(connected => {
  console.log('Supabase connection status:', connected ? 'Connected' : 'Failed to connect');
});

/**
 * Initialize the Supabase database with tables
 */
async function initializeDatabase() {
  try {
    // Note: Table creation is typically done through the Supabase dashboard
    // or using migrations, not programmatically in production.
    // This function is kept for API compatibility with the previous Fauna implementation.
    
    console.log('Database initialization should be done through Supabase dashboard');
    console.log('Checking if tables exist...');
    
    // We can check if tables exist and create them if needed
    // But for now, we'll just log a message
    
    return { success: true, message: 'Database initialization check completed' };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Create a document in a table
 * @param {string} table - Table name
 * @param {object} data - Document data
 * @returns {object} Created document
 */
async function create(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    
    return result[0];
  } catch (error) {
    console.error(`Error creating document in ${table}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a table
 * @param {string} table - Table name
 * @param {object} query - Optional query parameters
 * @returns {Array} Array of documents
 */
async function getAll(table, query = {}) {
  try {
    console.log(`Getting all documents from ${table} with query:`, query);
    
    let request = supabase.from(table).select('*');
    
    // Apply query filters if provided
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        request = request.eq(key, value);
      });
    }
    
    console.log(`Executing Supabase query for ${table}...`);
    const { data, error } = await request;
    
    if (error) {
      console.error(`Supabase error getting all documents from ${table}:`, error);
      throw error;
    }
    
    console.log(`Successfully retrieved ${data?.length || 0} documents from ${table}`);
    return data || [];
  } catch (error) {
    console.error(`Error getting all documents from ${table}:`, error);
    throw error;
  }
}

/**
 * Get a document by ID
 * @param {string} table - Table name
 * @param {string} id - Document ID
 * @returns {object} Document
 */
async function getById(table, id) {
  try {
    console.log(`Getting document ${id} from ${table}`);
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Supabase error getting document ${id} from ${table}:`, error);
      throw error;
    }
    
    console.log(`Successfully retrieved document ${id} from ${table}`);
    return data;
  } catch (error) {
    console.error(`Error getting document ${id} from ${table}:`, error);
    throw error;
  }
}

/**
 * Get documents by a field value
 * @param {string} table - Table name
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @returns {Array} Array of documents
 */
async function getByField(table, field, value) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(field, value);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error getting documents by field ${field}=${value}:`, error);
    throw error;
  }
}

/**
 * Update a document
 * @param {string} table - Table name
 * @param {string} id - Document ID
 * @param {object} data - Document data
 * @returns {object} Updated document
 */
async function update(table, id, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return result[0];
  } catch (error) {
    console.error(`Error updating document ${id} in ${table}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * @param {string} table - Table name
 * @param {string} id - Document ID
 * @returns {boolean} Success
 */
async function remove(table, id) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id} from ${table}:`, error);
    throw error;
  }
}

/**
 * Get the latest document from a table
 * @param {string} table - Table name
 * @returns {object} Latest document
 */
async function getLatest(table) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error getting latest document from ${table}:`, error);
    throw error;
  }
}

/**
 * Authenticate a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} Authentication result
 */
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} userData - Additional user data
 * @returns {object} Sign up result
 */
async function signUp(email, password, userData = {}) {
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
}

/**
 * Get the current user
 * @returns {object} Current user
 */
async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}

module.exports = {
  supabase,
  initializeDatabase,
  create,
  getAll,
  getById,
  getByField,
  update,
  remove,
  getLatest,
  signIn,
  signUp,
  getCurrentUser
};
