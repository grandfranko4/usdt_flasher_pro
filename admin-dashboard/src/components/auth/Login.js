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
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
      try {
        console.log('Login component: Attempting login with email:', email);
        setError('');
        setLoading(true);
        const user = await login(email, password);
        console.log('Login component: Login successful, user:', user);
        navigate('/');
      } catch (error) {
        console.error('Login component: Login error:', error);
        setError('Invalid email or password');
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
              <LockIcon sx={{ fontSize: 40, color: '#00e6b8' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#f5f6fa' }}>
              Admin Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8fa6', textAlign: 'center' }}>
              Enter your credentials to access the USDT FLASHER PRO admin dashboard
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                'Sign In'
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ color: '#00e6b8' }}>
                  Forgot password?
                </Typography>
              </Link>
            </Box>

          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
