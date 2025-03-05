#!/usr/bin/env node

/**
 * This script tests the connection to Fauna DB with the provided secret key.
 */

const faunadb = require('faunadb');
const q = faunadb.query;

// The Fauna DB secret key
const FAUNA_SECRET_KEY = 'fnAF5HLcMsAAQkqqX6yAJzPlbXsy753velbBs0Y0';

// Initialize the FaunaDB client with the secret
const client = new faunadb.Client({
  secret: FAUNA_SECRET_KEY
});

async function testConnection() {
  try {
    console.log('Testing connection to Fauna DB...');
    
    // Try to list all collections
    const collections = await client.query(
      q.Map(
        q.Paginate(q.Collections()),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );
    
    console.log('Connection successful!');
    
    if (collections.data.length === 0) {
      console.log('No collections found in the database.');
      console.log('You need to initialize the database by running:');
      console.log('curl -X POST https://usdtflasherpro.netlify.app/.netlify/functions/initialize-db \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"initKey":"42afc2bc2080de90d16f0b53a4736fb9e6edc859df5b34318bc0af2d389c6070"}\'');
    } else {
      console.log('Collections in the database:');
      collections.data.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Try to create a test collection
    await client.query(
      q.If(
        q.Exists(q.Collection('test_collection')),
        true,
        q.CreateCollection({ name: 'test_collection' })
      )
    );
    
    console.log('Successfully created or verified test_collection');
    
  } catch (error) {
    console.error('Error testing Fauna DB connection:');
    console.error(error);
  }
}

// Run the test
testConnection().catch(console.error);
