const { createClient } = require('@supabase/supabase-js');

// Supabase URL and anon key from the project
const supabaseUrl = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email and password of the user to update
const userEmail = 'mikebtcretriever@gmail.com';
const userPassword = 'Gateway@523';

// New metadata to set
const newMetadata = {
  display_name: 'Admin User',
  role: 'admin'
};

async function updateUserMetadata() {
  try {
    // First, sign in as the user
    console.log(`Signing in as ${userEmail}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (authError) {
      throw authError;
    }
    
    if (!authData || !authData.user) {
      throw new Error('Failed to authenticate user');
    }
    
    console.log('Successfully authenticated');
    
    // Get the user's ID
    const userId = authData.user.id;
    console.log(`User ID: ${userId}`);
    
    // Update the user's metadata
    console.log('Updating user metadata...');
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: newMetadata
    });
    
    if (updateError) {
      throw updateError;
    }
    
    console.log('User metadata updated successfully:');
    console.log(JSON.stringify(updateData.user.user_metadata, null, 2));
    
    return updateData;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
}

// Execute the function
updateUserMetadata()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
