import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Supabase URL and anon key from the project
const supabaseUrl = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email and password of the user to test
const userEmail = 'mikebtcretriever@gmail.com';
const userPassword = 'Gateway@523';

// Base URL for API requests
const baseURL = 'http://localhost:9999/.netlify/functions';

async function testAuthFlow() {
  try {
    console.log('=== Testing Authentication Flow ===');
    
    // Step 1: Test direct Supabase authentication
    console.log('\n1. Testing direct Supabase authentication:');
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (supabaseError) {
      console.error('Supabase authentication error:', supabaseError);
      return;
    }
    
    console.log('Supabase authentication successful!');
    console.log('User metadata:', supabaseData.user.user_metadata);
    
    // Step 2: Test the auth serverless function
    console.log('\n2. Testing auth serverless function:');
    try {
      const response = await fetch(`${baseURL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Auth function error:', data);
        return;
      }
      
      console.log('Auth function response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('Auth function successful!');
        console.log('User role:', data.user.role);
        console.log('User display name:', data.user.displayName);
      } else {
        console.error('Auth function failed:', data.message);
      }
    } catch (error) {
      console.error('Error calling auth function:', error);
    }
    
    console.log('\n=== Authentication Flow Test Complete ===');
  } catch (error) {
    console.error('Error during auth flow test:', error);
  }
}

// Execute the function
testAuthFlow()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
