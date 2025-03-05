#!/usr/bin/env node

const faunadb = require('faunadb');
const q = faunadb.query;

// The Fauna DB secret key
const FAUNA_SECRET_KEY = 'fnAF5HLcMsAAQkqqX6yAJzPlbXsy753velbBs0Y0';

console.log('Creating Fauna client with API version 10...');
const client = new faunadb.Client({
  secret: FAUNA_SECRET_KEY,
  apiVersion: '10'
});

console.log('Attempting to ping Fauna DB...');
client.query(q.Do(q.Now()))
  .then(result => {
    console.log('Connection successful!');
    console.log('Current time from Fauna:', result);
  })
  .catch(error => {
    console.error('Error connecting to Fauna DB:');
    console.error(error);
  });
