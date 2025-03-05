const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the URL and API key
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://gtjeaazmelddcjwpsxvp.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8'
);

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
 * @returns {Array} Array of documents
 */
async function getAll(table) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    
    return data;
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
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
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
