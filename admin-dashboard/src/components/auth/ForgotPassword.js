import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#222222',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#f5f6fa' }}>
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8fa6', textAlign: 'center' }}>
              Enter your email address and we'll send you a link to reset your password
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#7f8fa6' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#353b48',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00e6b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00e6b8',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7f8fa6',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#00e6b8',
                },
                '& .MuiInputBase-input': {
                  color: '#f5f6fa',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#00e6b8',
                '&:hover': {
                  backgroundColor: '#00c9a0',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 230, 184, 0.3)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#f5f6fa' }} />
              ) : (
                'Reset Password'
              )}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  sx={{ color: '#00e6b8' }}
                >
                  Back to Login
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;
