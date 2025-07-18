// components/Dashboard.js - A shared landing page for the application
import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import MarketOverview from './MarketOverview';
import FinancialNews from './FinancialNews';
import TradingStats from './TradingStats';

function Dashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Trading Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Statistical Arbitrage Strategy for Brent-WTI Crude Oil Spread
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <MarketOverview />
      </Grid>
      
      <Grid item xs={12} md={8}>
        <TradingStats />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FinancialNews />
      </Grid>
    </Grid>
  );
}

export default Dashboard;