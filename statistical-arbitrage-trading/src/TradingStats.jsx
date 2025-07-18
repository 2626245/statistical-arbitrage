// components/TradingStats.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowUpward, ArrowDownward, ShowChart, Timeline, AttachMoney, Warning } from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: 'rgba(23, 42, 69, 0.7)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette[color || 'primary'].dark + '22',
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
}));

function TradingStats() {
  const [stats, setStats] = useState({
    totalPnL: 140.27,
    sharpeRatio: 1.87,
    maxDrawdown: -16.3,
    winRate: 68.2,
    correlation: 0.9899
  });
  
  const [performanceData, setPerformanceData] = useState([]);
  
  useEffect(() => {
    // In a real app, fetch actual data from your API
    const mockPerformanceData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2023, 4, i + 1).toISOString().split('T')[0],
      pnl: Math.random() * 10 - 3 + i * 0.5,
      cumulative: (Math.random() * 10 - 3 + i * 5),
    })).map(item => ({
      ...item,
      cumulative: item.cumulative > 0 ? item.cumulative : 0
    }));
    
    setPerformanceData(mockPerformanceData);
  }, []);
  
  return (
    <Card>
      <CardHeader title="Strategy Performance" />
      <CardContent>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatCard>
              <IconWrapper color="success">
                <AttachMoney fontSize="medium" color="success" />
              </IconWrapper>
              <Typography variant="h5" gutterBottom>
                ${stats.totalPnL.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total PnL
              </Typography>
            </StatCard>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StatCard>
              <IconWrapper color="primary">
                <ShowChart fontSize="medium" color="primary" />
              </IconWrapper>
              <Typography variant="h5" gutterBottom>
                {stats.sharpeRatio.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sharpe Ratio
              </Typography>
            </StatCard>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StatCard>
              <IconWrapper color="error">
                <Warning fontSize="medium" color="error" />
              </IconWrapper>
              <Typography variant="h5" gutterBottom>
                {stats.maxDrawdown.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Max Drawdown
              </Typography>
            </StatCard>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StatCard>
              <IconWrapper color="info">
                <Timeline fontSize="medium" color="info" />
              </IconWrapper>
              <Typography variant="h5" gutterBottom>
                {stats.correlation.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Correlation
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
        
        <Box sx={{ height: 300, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Cumulative Performance
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 255, 218, 0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#8892b0' }} />
              <YAxis tick={{ fill: '#8892b0' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#172a45', 
                  borderColor: '#64ffda',
                  color: '#ccd6f6'
                }}
              />
              <Area  
                type="monotone" 
                dataKey="cumulative" 
                stroke="#64ffda" 
                fill="rgba(100, 255, 218, 0.2)" 
                name="Cumulative PnL"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Daily Returns
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 255, 218, 0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#8892b0' }} />
              <YAxis tick={{ fill: '#8892b0' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#172a45', 
                  borderColor: '#64ffda',
                  color: '#ccd6f6'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="#82ca9d" 
                fill={(entry) => entry.pnl >= 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'} 
                name="Daily PnL"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TradingStats;