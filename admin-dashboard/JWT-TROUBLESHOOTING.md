# JWT Authentication Troubleshooting Guide

## 401 Unauthorized Error When Accessing Admin Dashboard

If you're experiencing a 401 Unauthorized error when accessing the admin dashboard, particularly when trying to access the license-keys endpoint, follow these troubleshooting steps:

## Issue: JWT Token Mismatch

The most common cause of 401 Unauthorized errors is a mismatch between the JWT token used by the frontend and the JWT secret expected by the backend. This can happen when:

1. The JWT_SECRET environment variable in Netlify doesn't match the one used to generate the token
2. The hardcoded JWT token in the frontend has expired
3. The JWT token in the frontend was generated with a different secret than what's configured in the backend

## Solution Steps

### 1. Generate a New JWT Token

Run the following command to generate a new JWT token using the current JWT_SECRET from your .env file:

```bash
cd admin-dashboard
node generate-jwt.js
```

This will output a new JWT token that is valid for 24 hours.

### 2. Update the Frontend JWT Token

Update the hardcoded JWT token in `src/utils/jwt.js` with the newly generated token:

```javascript
export const generateAdminToken = () => {
  return 'your-newly-generated-token';
};
```

### 3. Update the JWT Secret in Netlify

Make sure the JWT_SECRET environment variable in Netlify matches the one in your local .env file. You can use the provided script to update it:

```bash
cd admin-dashboard
./update-jwt-secret.js
```

### 4. Redeploy the Admin Dashboard

After updating the JWT token and ensuring the JWT_SECRET is correctly set in Netlify, redeploy the admin dashboard:

```bash
cd admin-dashboard
npm run build
netlify deploy --prod
```

### 5. Clear Browser Cache and Local Storage

Before testing the admin dashboard again:

1. Open your browser's developer tools (F12 or Ctrl+Shift+I)
2. Go to the Application tab
3. Select "Local Storage" from the left sidebar
4. Clear the local storage for the admin dashboard site
5. Refresh the page and log in again

## Verifying the Fix

After completing these steps, you should be able to access the license-keys endpoint without getting a 401 Unauthorized error. If you're still experiencing issues, check the browser console for more detailed error messages.

## JWT Secret Management

For security reasons, it's important to keep your JWT_SECRET secure and consistent across environments. Consider using a secure secret management solution for production environments.

## Additional Resources

- [JWT.io](https://jwt.io/) - Useful for debugging JWT tokens
- [Netlify Environment Variables Documentation](https://docs.netlify.com/configure-builds/environment-variables/)
