import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineIcon from '@mui/icons-material/Timeline';

function AppSidebar({ open }) {
  const location = useLocation();
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Rule-Based Strategy',
      icon: <ShowChartIcon />,
      path: '/rule-based',
    },
    {
      text: 'Risk Management',
      icon: <SecurityIcon />,
      path: '/risk',
    },
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid rgba(100, 255, 218, 0.1)',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(100, 255, 218, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(100, 255, 218, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(100, 255, 218, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2, backgroundColor: 'rgba(100, 255, 218, 0.1)' }} />
      <List>
        <ListItem>
          <ListItemIcon>
            <AccountBalanceIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Market Data" 
            secondary="Brent & WTI Crude Oil"
            secondaryTypographyProps={{ sx: { fontSize: '0.875rem' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <TimelineIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Correlation" 
            secondary="0.9899"
            secondaryTypographyProps={{ sx: { color: 'success.main', fontSize: '0.875rem' } }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default AppSidebar;