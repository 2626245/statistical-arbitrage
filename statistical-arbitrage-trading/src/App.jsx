import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Dashboard from './Dashboard';
import RiskManagement from './RiskManagement';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import RuleBasedDashboard from './RuleBasedDashboard';

// Create a dark theme with financial accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64ffda',
    },
    secondary: {
      main: '#0a192f',
    },
    background: {
      default: '#0a192f',
      paper: '#172a45',
    },
    text: {
      primary: '#ccd6f6',
      secondary: '#8892b0',
    },
    success: {
      main: '#4CAF50',
      dark: '#388E3C',
    },
    error: {
      main: '#F44336',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FFC107',
      dark: '#FFA000',
    },
    info: {
      main: '#2196F3',
      dark: '#1976D2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#64ffda',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(23, 42, 69, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(100, 255, 218, 0.1)',
          borderRadius: '8px',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
          padding: '16px',
        },
        title: {
          fontSize: '1.1rem',
          color: '#64ffda',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          padding: '8px 16px',
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#172a45',
          color: '#64ffda',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
          <AppHeader toggleDrawer={toggleDrawer} />
          <AppSidebar open={drawerOpen} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8,
              ml: drawerOpen ? '240px' : 0,
              transition: theme => theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              backgroundColor: 'background.default',
              minHeight: '100vh',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rule-based" element={<RuleBasedDashboard />} />
              <Route path="/risk" element={<RiskManagement />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;