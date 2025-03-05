import { initializeDatabase } from '../services/api';

// This script initializes the FaunaDB database with the required collections and indexes
// It should be run once before using the admin dashboard

// The initialization key should match the INIT_KEY environment variable in your Netlify functions
const INIT_KEY = 'f2e7b3d9a5c8f4e1d6b7c9a3f5d2e8c4a1b9d7e6c3a5f2b8d4c7e9a1f6b3d2c5'; // Replace with your actual initialization key

async function initializeDB() {
  try {
    console.log('Initializing database...');
    const result = await initializeDatabase(INIT_KEY);
    console.log('Database initialization result:', result);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Execute the function
initializeDB()
  .then(() => {
    console.log('Script completed');
  })
  .catch(error => {
    console.error('Script failed:', error);
  });
