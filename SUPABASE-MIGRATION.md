# Supabase Migration Guide

This document provides instructions for migrating the USDT-FLASHER-PRO project from Fauna DB to Supabase.

## Overview

The project has been updated to use Supabase as the database service instead of Fauna DB. Supabase is an open-source Firebase alternative built on PostgreSQL, providing a powerful and easy-to-use database service with built-in authentication, real-time subscriptions, and more.

## Setup Instructions

### 1. Supabase Project Setup

The Supabase project has already been created with the following details:

- **Project URL**: https://gtjeaazmelddcjwpsxvp.supabase.co
- **API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8

### 2. Database Schema Setup

You need to create the following tables in your Supabase project. For each table, navigate to the Table Editor in the Supabase dashboard and click "Create a new table".

#### license_keys

| Name         | Type      | Default Value              |
|--------------|-----------|----------------------------|
| id           | uuid      | uuid_generate_v4()         |
| key          | text      |                            |
| status       | text      | 'active'                   |
| created_at   | timestamp | now()                      |
| expires_at   | timestamp |                            |
| user         | text      |                            |
| type         | text      |                            |
| max_amount   | int8      |                            |

#### contact_info

| Name              | Type      | Default Value              |
|-------------------|-----------|----------------------------|
| id                | uuid      | uuid_generate_v4()         |
| primary_phone     | text      |                            |
| secondary_phone   | text      |                            |
| tertiary_phone    | text      |                            |
| email             | text      |                            |
| website           | text      |                            |
| telegram_username | text      |                            |
| discord_server    | text      |                            |
| created_at        | timestamp | now()                      |
| updated_at        | timestamp | now()                      |

#### contact_info_history

| Name        | Type      | Default Value              |
|-------------|-----------|----------------------------|
| id          | uuid      | uuid_generate_v4()         |
| field       | text      |                            |
| old_value   | text      |                            |
| new_value   | text      |                            |
| timestamp   | timestamp | now()                      |
| user        | text      |                            |

#### app_settings

| Name                        | Type      | Default Value              |
|-----------------------------|-----------|----------------------------|
| id                          | uuid      | uuid_generate_v4()         |
| app_version                 | text      |                            |
| update_channel              | text      | 'stable'                   |
| auto_update                 | int4      | 1                          |
| theme                       | text      | 'dark'                     |
| accent_color                | text      | '#00e6b8'                  |
| animations_enabled          | int4      | 1                          |
| session_timeout             | int4      | 30                         |
| require_password_on_startup | int4      | 1                          |
| two_factor_auth             | int4      | 0                          |
| default_network             | text      | 'trc20'                    |
| max_flash_amount            | int8      | 100000                     |
| demo_max_flash_amount       | int8      | 30                         |
| live_max_flash_amount       | int8      | 10000000                   |
| default_delay_days          | int4      | 0                          |
| default_delay_minutes       | int4      | 0                          |
| debug_mode                  | int4      | 0                          |
| log_level                   | text      | 'info'                     |
| api_endpoint                | text      |                            |
| deposit_amount              | int4      | 500                        |
| transaction_fee             | text      | 'Transaction Fee'          |
| wallet_address              | text      |                            |
| success_title               | text      | 'Success'                  |
| success_message             | text      |                            |
| transaction_hash            | text      |                            |
| initial_loading_messages    | text      |                            |
| license_verification_messages | text    |                            |
| bip_verification_messages   | text      |                            |
| wallet_options              | text      |                            |
| currency_options            | text      |                            |
| network_options             | text      |                            |
| day_options                 | text      |                            |
| minute_options              | text      |                            |
| created_at                  | timestamp | now()                      |
| updated_at                  | timestamp | now()                      |

#### settings_history

| Name        | Type      | Default Value              |
|-------------|-----------|----------------------------|
| id          | uuid      | uuid_generate_v4()         |
| field       | text      |                            |
| old_value   | text      |                            |
| new_value   | text      |                            |
| timestamp   | timestamp | now()                      |
| user        | text      |                            |

#### flash_transactions

| Name             | Type      | Default Value              |
|------------------|-----------|----------------------------|
| id               | uuid      | uuid_generate_v4()         |
| transaction_id   | text      |                            |
| license_key_id   | text      |                            |
| receiver_address | text      |                            |
| amount           | int8      |                            |
| wallet_type      | text      |                            |
| currency         | text      | 'USDT'                     |
| network          | text      | 'trc20'                    |
| delay_days       | int4      | 0                          |
| delay_minutes    | int4      | 0                          |
| use_proxy        | int4      | 0                          |
| transferable     | int4      | 0                          |
| swappable        | int4      | 0                          |
| p2p_tradable     | int4      | 0                          |
| splittable       | int4      | 0                          |
| timestamp        | timestamp | now()                      |

#### users

| Name         | Type      | Default Value              |
|--------------|-----------|----------------------------|
| id           | uuid      | uuid_generate_v4()         |
| email        | text      |                            |
| display_name | text      |                            |
| role         | text      | 'user'                     |
| created_at   | timestamp | now()                      |
| last_login   | timestamp |                            |

### 3. Authentication Setup

Supabase provides built-in authentication. The project has been updated to use Supabase Auth for user authentication.

To create an admin user:

1. Go to the Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter the admin user details:
   - Email: mikebtcretriever@gmail.com
   - Password: Gateway@523
5. After creating the user, edit the user and add the following metadata:
   ```json
   {
     "display_name": "Admin User",
     "role": "admin"
   }
   ```

### 4. Environment Variables

Update your environment variables in the Netlify dashboard:

1. Go to your Netlify site settings
2. Navigate to Build & deploy > Environment
3. Add the following environment variables:
   - `SUPABASE_URL`: https://gtjeaazmelddcjwpsxvp.supabase.co
   - `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8
   - `JWT_SECRET`: (keep your existing JWT_SECRET)
   - `INIT_KEY`: (keep your existing INIT_KEY)

### 5. Initialize the Database

After deploying the updated code to Netlify, you need to initialize the database:

1. Go to your Netlify site
2. Navigate to the admin dashboard
3. Use the initialization endpoint with your INIT_KEY:
   ```
   POST /.netlify/functions/initialize-db
   {
     "initKey": "your-init-key"
   }
   ```

This will create the default admin user, contact info, and app settings.

## Code Changes

The following files have been updated to use Supabase instead of Fauna DB:

1. `admin-dashboard/functions/utils/supabase.js` - New Supabase utility file
2. `admin-dashboard/functions/license-keys.js` - Updated to use Supabase
3. `admin-dashboard/functions/contact-info.js` - Updated to use Supabase
4. `admin-dashboard/functions/app-settings.js` - Updated to use Supabase
5. `admin-dashboard/functions/auth.js` - Updated to use Supabase Auth
6. `admin-dashboard/functions/initialize-db.js` - Updated to initialize Supabase tables
7. `admin-dashboard/src/services/supabase.js` - New frontend Supabase client

## Direct Supabase Access

For direct access to the Supabase database (bypassing the Netlify functions), you can use the new Supabase client:

```javascript
import supabaseService from '../services/supabase';

// Authentication
const { data, error } = await supabaseService.signIn('email', 'password');

// Data access
const licenseKeys = await supabaseService.fetchLicenseKeys();
```

## Benefits of Supabase

1. **PostgreSQL Database**: Supabase is built on PostgreSQL, a powerful and reliable database system.
2. **Built-in Authentication**: Supabase provides a complete authentication system with support for email/password, social logins, and more.
3. **Real-time Subscriptions**: Supabase supports real-time data subscriptions, allowing your app to receive updates when data changes.
4. **Row-Level Security**: Supabase provides row-level security policies for fine-grained access control.
5. **Storage**: Supabase includes a storage system for file uploads and downloads.
6. **Edge Functions**: Supabase supports serverless functions for custom backend logic.
7. **Free Tier**: Supabase offers a generous free tier with 500MB database, 2GB file storage, and more.

## Troubleshooting

If you encounter any issues with the Supabase integration, check the following:

1. **Database Tables**: Ensure all required tables are created in Supabase.
2. **Environment Variables**: Verify that the Supabase URL and API key are correctly set in your environment.
3. **Authentication**: Check that the admin user is created with the correct metadata.
4. **Netlify Functions**: Verify that the Netlify functions are deployed and working correctly.
5. **Logs**: Check the Netlify function logs and Supabase logs for any errors.

For more information, refer to the [Supabase documentation](https://supabase.io/docs).
