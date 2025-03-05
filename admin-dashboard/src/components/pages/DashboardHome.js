import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  VpnKey as VpnKeyIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { 
  fetchLicenseKeys, 
  fetchAppSettings, 
  fetchFlashHistory 
} from '../../services/database';

function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch license keys
        const licenseKeys = await fetchLicenseKeys();
        const activeLicenses = licenseKeys.filter(key => key.status === 'active').length;
        
        // Fetch app settings
        const settings = await fetchAppSettings();
        setAppVersion(settings.appVersion || '4.8');
        
        // Fetch flash history (this might need to be adjusted based on your API)
        const flashHistory = await fetchFlashHistory();
        
        // Set stats data
        setStatsData([
          { 
            title: 'Active Licenses', 
            value: activeLicenses.toString(), 
            icon: <VpnKeyIcon sx={{ fontSize: 40, color: '#00e6b8' }} />,
            color: '#00e6b8'
          },
          { 
            title: 'Total Users', 
            value: licenseKeys.length.toString(), 
            icon: <PeopleIcon sx={{ fontSize: 40, color: '#fbc531' }} />,
            color: '#fbc531'
          },
          { 
            title: 'Settings Changed', 
            value: '12', // This could be fetched from a settings history endpoint if available
            icon: <SettingsIcon sx={{ fontSize: 40, color: '#7f8fa6' }} />,
            color: '#7f8fa6'
          },
          { 
            title: 'Flash Transactions', 
            value: Array.isArray(flashHistory) ? flashHistory.length.toString() : '0', 
            icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#4cd137' }} />,
            color: '#4cd137'
          }
        ]);
        
        // Create recent activities from the data
        // This is a simplified example - you would need to adapt this to your actual data structure
        const activities = [];
        
        // Add license key activities
        licenseKeys.slice(0, 3).forEach(key => {
          activities.push({
            action: `License key ${key.status}`,
            user: key.user || 'User',
            time: new Date(key.created_at).toLocaleString()
          });
        });
        
        // Add more activities if needed
        setRecentActivities(activities.length > 0 ? activities : [
          { action: 'No recent activities', user: '', time: '' }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                backgroundColor: '#222222',
                border: `1px solid ${stat.color}`,
                boxShadow: `0 0 10px rgba(0, 0, 0, 0.2)`,
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                {stat.icon}
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ color: '#dcdde1' }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ backgroundColor: '#222222', p: 0 }}>
            <CardHeader 
              title="Recent Activities" 
              sx={{ 
                backgroundColor: 'rgba(0, 230, 184, 0.1)', 
                borderBottom: '1px solid #353b48',
                '& .MuiCardHeader-title': {
                  color: '#00e6b8'
                }
              }}
            />
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={activity.action}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" sx={{ color: '#00e6b8' }}>
                            {activity.user}
                          </Typography>
                          {` — ${activity.time}`}
                        </React.Fragment>
                      }
                      primaryTypographyProps={{ color: 'text.primary' }}
                      secondaryTypographyProps={{ color: 'text.secondary', sx: { color: '#7f8fa6' } }}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider component="li" sx={{ backgroundColor: '#353b48' }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ backgroundColor: '#222222', p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00e6b8' }}>
              Quick Actions
            </Typography>
            <Typography paragraph>
              Welcome to the USDT FLASHER PRO Admin Dashboard. From here, you can manage license keys, 
              update contact information, and configure application settings.
            </Typography>
            <Typography paragraph>
              Use the sidebar navigation to access different sections of the admin panel.
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8fa6', mt: 2 }}>
              Current Version: 4.8
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardHome;
