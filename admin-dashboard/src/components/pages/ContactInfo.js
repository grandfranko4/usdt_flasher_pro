import React, { useState, useEffect } from 'react';
import { fetchContactInfo, saveContactInfo, fetchContactHistory } from '../../services/database';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';


function ContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    primaryPhone: '',
    secondaryPhone: '',
    tertiaryPhone: '',
    email: '',
    website: '',
    telegramUsername: '',
    discordServer: ''
  });
  const [originalInfo, setOriginalInfo] = useState({});
  const [changeHistory, setChangeHistory] = useState([]);
  // State for tracking loading status and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };

  // Fetch contact info on component mount
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get contact info
        const info = await fetchContactInfo();
        setContactInfo(info);
        setOriginalInfo(info);
        
        // Get change history
        const history = await fetchContactHistory();
        setChangeHistory(history);
      } catch (error) {
        console.error('Error fetching contact info:', error);
        setError('Failed to load contact information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContactInfo();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Update contact info in the database
      await saveContactInfo(contactInfo);
      
      // Update local state
      setOriginalInfo(contactInfo);
      
      // Refresh change history
      const history = await fetchContactHistory();
      setChangeHistory(history);
      
      setSnackbar({
        open: true,
        message: 'Contact information updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating contact info:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update contact information. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setContactInfo(originalInfo);
    
    setSnackbar({
      open: true,
      message: 'Changes discarded',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const hasChanges = JSON.stringify(contactInfo) !== JSON.stringify(originalInfo);

  // Helper function to format field names for display
  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Contact Information Management
      </Typography>
      
      {/* Display error message if there's an error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Display loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading contact information...</Typography>
        </Box>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#222222' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00e6b8' }}>
              Update Contact Information
            </Typography>
            <Typography variant="body2" paragraph sx={{ color: '#7f8fa6' }}>
              These contact details will be displayed in the desktop application for users to reach support.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Phone"
                  name="primaryPhone"
                  value={contactInfo.primaryPhone}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: '#00e6b8' }} />,
                  }}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Phone"
                  name="secondaryPhone"
                  value={contactInfo.secondaryPhone}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: '#00e6b8' }} />,
                  }}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tertiary Phone"
                  name="tertiaryPhone"
                  value={contactInfo.tertiaryPhone}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: '#00e6b8' }} />,
                  }}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={contactInfo.website}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telegram Username"
                  name="telegramUsername"
                  value={contactInfo.telegramUsername}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discord Server"
                  name="discordServer"
                  value={contactInfo.discordServer}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  sx={{
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
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={!hasChanges}
                sx={{
                  borderColor: hasChanges ? '#7f8fa6' : '#353b48',
                  color: hasChanges ? '#7f8fa6' : '#353b48',
                  '&:hover': {
                    borderColor: '#00e6b8',
                    backgroundColor: 'rgba(0, 230, 184, 0.1)',
                  },
                }}
              >
                Discard Changes
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!hasChanges}
                sx={{
                  backgroundColor: hasChanges ? '#00e6b8' : '#353b48',
                  '&:hover': {
                    backgroundColor: '#00c9a0',
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#222222', height: '100%' }}>
            <CardHeader 
              title="Change History" 
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)', 
                borderBottom: '1px solid #353b48',
                '& .MuiCardHeader-title': {
                  color: '#00e6b8',
                  fontSize: '1.1rem'
                }
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ width: '100%' }}>
                {changeHistory.map((change, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: '40px' }}>
                        <HistoryIcon sx={{ color: '#00e6b8' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ color: '#f5f6fa' }}>
                            {formatFieldName(change.field)} changed
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" sx={{ color: '#7f8fa6', display: 'block' }}>
                              From: {change.oldValue}
                            </Typography>
                            <Typography component="span" variant="body2" sx={{ color: '#00e6b8', display: 'block' }}>
                              To: {change.newValue}
                            </Typography>
                            <Typography component="span" variant="caption" sx={{ color: '#7f8fa6', display: 'block', mt: 0.5 }}>
                              {change.timestamp} by {change.user}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < changeHistory.length - 1 && <Divider component="li" sx={{ backgroundColor: '#353b48' }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview section */}
      <Paper sx={{ mt: 3, p: 3, backgroundColor: '#222222' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00e6b8' }}>
          Desktop Application Preview
        </Typography>
        <Typography variant="body2" paragraph sx={{ color: '#7f8fa6' }}>
          This is how the contact information will appear in the desktop application.
        </Typography>
        
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: '#1a1a1a', 
            borderRadius: 1,
            border: '1px dashed #353b48',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}
        >
          <Typography variant="body1" sx={{ color: '#f5f6fa' }}>
            support: {contactInfo.primaryPhone} | {contactInfo.secondaryPhone} | {contactInfo.tertiaryPhone}
          </Typography>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ContactInfo;
