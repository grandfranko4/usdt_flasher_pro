import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(formData.email, formData.password, formData.displayName);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'Email is already in use'
          : error.code === 'auth/weak-password'
          ? 'Password is too weak'
          : 'Failed to create an account. Please try again.'
      );
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
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: '#00e6b8' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#f5f6fa' }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8fa6', textAlign: 'center' }}>
              Register to access the USDT FLASHER PRO admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="Full Name"
              name="displayName"
              autoComplete="name"
              autoFocus
              value={formData.displayName}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#7f8fa6' }} />
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
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#7f8fa6' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: '#7f8fa6' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#7f8fa6' }} />
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
                'Register'
              )}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#7f8fa6' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography component="span" variant="body2" sx={{ color: '#00e6b8' }}>
                    Sign In
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
