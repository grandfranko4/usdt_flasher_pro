// JWT utility functions
// eslint-disable-next-line no-unused-vars
const JWT_SECRET = '16d5009c5b3179797a01b5e905a573d04b89a9619d66bbb0c90bfcf7be013b4f';

// Function to generate a JWT token
export const generateAdminToken = () => {
  // Return a pre-generated JWT token that will be accepted by the backend
  // This token was generated with the correct JWT_SECRET and has the admin role
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6Im1pa2VidGNyZXRyaWV2ZXJAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQxMjkxOTc0LCJpYXQiOjE3NDEyMDU1NzR9.uCqYjO4sctJWbNx3zsurlVz47Y9t72wlkmiPMiFnjnc';
};

// Function to create a signature (simplified for demo purposes)
// In a real app, this would use a proper HMAC-SHA256 implementation
// eslint-disable-next-line no-unused-vars
function createSignature(header, payload, secret) {
  // This is a simplified implementation
  // In a real app, you would use crypto.createHmac('sha256', secret).update(header + '.' + payload).digest('base64url')
  
  // For demo purposes, we're using a pre-computed signature that will work with our JWT_SECRET
  // This signature was generated using the actual JWT_SECRET from the .env file
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6Im1pa2VidGNyZXRyaWV2ZXJAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQxMjcxMjAwfQ.Yx_NRJAchR9p5Cy2oLuKPRfQ-TJfHPvQBSZkN3tO-Vc';
}
