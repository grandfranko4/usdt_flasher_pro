import React from 'react';
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
  Divider
} from '@mui/material';
import { 
  VpnKey as VpnKeyIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const statsData = [
  { 
    title: 'Active Licenses', 
    value: '156', 
    icon: <VpnKeyIcon sx={{ fontSize: 40, color: '#00e6b8' }} />,
    color: '#00e6b8'
  },
  { 
    title: 'Total Users', 
    value: '243', 
    icon: <PeopleIcon sx={{ fontSize: 40, color: '#fbc531' }} />,
    color: '#fbc531'
  },
  { 
    title: 'Settings Changed', 
    value: '12', 
    icon: <SettingsIcon sx={{ fontSize: 40, color: '#7f8fa6' }} />,
    color: '#7f8fa6'
  },
  { 
    title: 'Flash Transactions', 
    value: '1,892', 
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#4cd137' }} />,
    color: '#4cd137'
  }
];

const recentActivities = [
  { action: 'License key created', user: 'Admin', time: '10 minutes ago' },
  { action: 'Contact information updated', user: 'Admin', time: '1 hour ago' },
  { action: 'New user registered', user: 'John Doe', time: '3 hours ago' },
  { action: 'Settings updated', user: 'Admin', time: '5 hours ago' },
  { action: 'License key activated', user: 'Jane Smith', time: '1 day ago' }
];

function DashboardHome() {
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
