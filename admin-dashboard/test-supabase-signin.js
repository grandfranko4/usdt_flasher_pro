const { createClient } = require('@supabase/supabase-js');

// Supabase URL and anon key from the project
const supabaseUrl = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email and password of the user to test
const userEmail = 'mikebtcretriever@gmail.com';
const userPassword = 'Gateway@523';

async function testSignIn() {
  try {
    console.log(`Signing in as ${userEmail}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (error) {
      console.error('Authentication error:', error);
      return;
    }
    
    console.log('Authentication successful!');
    console.log('Full data object:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\nUser object:');
    console.log(JSON.stringify(data.user, null, 2));
    
    console.log('\nSession object:');
    console.log(JSON.stringify(data.session, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error during sign in test:', error);
  }
}

// Execute the function
testSignIn()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
