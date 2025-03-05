import React, { useState, useEffect } from 'react';
import { 
  fetchLicenseKeys, 
  addLicenseKey, 
  removeLicenseKey,
  generateLicenseKey
} from '../../services/database';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';


function LicenseKeys() {
  const [licenseKeys, setLicenseKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newLicenseData, setNewLicenseData] = useState({
    user: '',
    expiryMonths: 12
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewLicenseData({
      user: '',
      expiryMonths: 12
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLicenseData({
      ...newLicenseData,
      [name]: value
    });
  };


  // Fetch license keys on component mount
  useEffect(() => {
    const loadLicenseKeys = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const keys = await fetchLicenseKeys();
        setLicenseKeys(keys);
      } catch (error) {
        console.error('Error fetching license keys:', error);
        setError('Failed to load license keys. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLicenseKeys();
  }, []);

  const handleCreateLicense = async () => {
    if (!newLicenseData.user) {
      setSnackbar({
        open: true,
        message: 'Please enter a user email',
        severity: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setMonth(today.getMonth() + parseInt(newLicenseData.expiryMonths));

      const newLicense = {
        key: generateLicenseKey(),
        status: 'active',
        createdAt: today.toISOString(),
        expiresAt: expiryDate.toISOString(),
        user: newLicenseData.user
      };

      const createdLicense = await addLicenseKey(newLicense);
      
      // Add the new license to the state
      setLicenseKeys([createdLicense, ...licenseKeys]);
      handleCloseDialog();
      
      setSnackbar({
        open: true,
        message: 'License key created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating license key:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create license key. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLicense = async (id) => {
    try {
      setIsLoading(true);
      await removeLicenseKey(id);
      
      // Remove the deleted license from the state
      setLicenseKeys(licenseKeys.filter(license => license.id !== id));
      
      setSnackbar({
        open: true,
        message: 'License key deleted',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error deleting license key:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete license key. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLicense = (key) => {
    navigator.clipboard.writeText(key);
    
    setSnackbar({
      open: true,
      message: 'License key copied to clipboard',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const filteredLicenseKeys = filterStatus === 'all' 
    ? licenseKeys 
    : licenseKeys.filter(license => license.status === filterStatus);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          License Keys Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenDialog}
          sx={{ 
            backgroundColor: '#00e6b8',
            '&:hover': {
              backgroundColor: '#00c9a0',
            }
          }}
        >
          Create New License
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#222222' }}>
            <Typography variant="h6" sx={{ color: '#00e6b8', mb: 1 }}>
              License Key Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${licenseKeys.length}`} 
                sx={{ backgroundColor: '#353b48', color: '#f5f6fa' }}
              />
              <Chip 
                label={`Active: ${licenseKeys.filter(l => l.status === 'active').length}`} 
                sx={{ backgroundColor: 'rgba(76, 209, 55, 0.2)', color: '#4cd137' }}
              />
              <Chip 
                label={`Inactive: ${licenseKeys.filter(l => l.status === 'inactive').length}`} 
                sx={{ backgroundColor: 'rgba(127, 143, 166, 0.2)', color: '#7f8fa6' }}
              />
              <Chip 
                label={`Expired: ${licenseKeys.filter(l => l.status === 'expired').length}`} 
                sx={{ backgroundColor: 'rgba(232, 65, 24, 0.2)', color: '#e84118' }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#222222', height: '100%', display: 'flex', alignItems: 'center' }}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="status-filter-label" sx={{ color: '#f5f6fa' }}>Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
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
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <IconButton 
              sx={{ ml: 1, color: '#f5f6fa' }}
              onClick={() => setFilterStatus('all')}
            >
              <RefreshIcon />
            </IconButton>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ backgroundColor: '#222222' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(0, 230, 184, 0.1)' }}>
            <TableRow>
              <TableCell sx={{ color: '#00e6b8', fontWeight: 'bold' }}>License Key</TableCell>
              <TableCell sx={{ color: '#00e6b8', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#00e6b8', fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ color: '#00e6b8', fontWeight: 'bold' }}>Expires</TableCell>
              <TableCell sx={{ color: '#00e6b8', fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ color: '#00e6b8', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLicenseKeys.length > 0 ? (
              filteredLicenseKeys.map((license) => (
                <TableRow key={license.id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } }}>
                  <TableCell sx={{ color: '#f5f6fa', fontFamily: 'monospace' }}>{license.key}</TableCell>
                  <TableCell>
                    <Chip 
                      label={license.status} 
                      size="small"
                      sx={{ 
                        backgroundColor: 
                          license.status === 'active' ? 'rgba(76, 209, 55, 0.2)' : 
                          license.status === 'inactive' ? 'rgba(127, 143, 166, 0.2)' : 
                          'rgba(232, 65, 24, 0.2)',
                        color: 
                          license.status === 'active' ? '#4cd137' : 
                          license.status === 'inactive' ? '#7f8fa6' : 
                          '#e84118',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#f5f6fa' }}>{license.createdAt}</TableCell>
                  <TableCell sx={{ color: '#f5f6fa' }}>{license.expiresAt}</TableCell>
                  <TableCell sx={{ color: '#f5f6fa' }}>{license.user}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyLicense(license.key)}
                      sx={{ color: '#f5f6fa' }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteLicense(license.id)}
                      sx={{ color: '#e84118' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#7f8fa6' }}>
                  No license keys found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create License Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#222222',
            color: '#f5f6fa',
            minWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#00e6b8' }}>Create New License Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="user"
            label="User Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newLicenseData.user}
            onChange={handleInputChange}
            sx={{
              mt: 2,
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
          <FormControl 
            fullWidth 
            variant="outlined" 
            margin="dense"
            sx={{
              mt: 2,
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
              '& .MuiSvgIcon-root': {
                color: '#f5f6fa',
              }
            }}
          >
            <InputLabel id="expiry-label">Expiry Period</InputLabel>
            <Select
              labelId="expiry-label"
              name="expiryMonths"
              value={newLicenseData.expiryMonths}
              onChange={handleInputChange}
              label="Expiry Period"
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>1 Year</MenuItem>
              <MenuItem value={24}>2 Years</MenuItem>
              <MenuItem value={36}>3 Years</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#7f8fa6' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateLicense}
            variant="contained"
            sx={{ 
              backgroundColor: '#00e6b8',
              '&:hover': {
                backgroundColor: '#00c9a0',
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

export default LicenseKeys;
