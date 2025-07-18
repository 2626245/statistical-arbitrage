// components/RiskManagement.js
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, Grid, Paper, Slider, TextField, Button, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Security, TrendingUp, Money, Warning } from '@mui/icons-material';

const RiskParameterBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(23, 42, 69, 0.7)',
  marginBottom: theme.spacing(2),
}));

function RiskManagement() {
  const [riskParams, setRiskParams] = useState({
    positionSize: 10000,
    maxDrawdown: 20,
    stopLoss: 2,
    takeProfit: 5,
    maxPositions: 3,
    riskPerTrade: 2,
  });
  
  const [alerts, setAlerts] = useState([]);
  
  const handleSliderChange = (field) => (event, newValue) => {
    setRiskParams({
      ...riskParams,
      [field]: newValue,
    });
  };
  
  const handleInputChange = (field) => (event) => {
    setRiskParams({
      ...riskParams,
      [field]: Number(event.target.value),
    });
  };
  
  const applyRiskSettings = () => {
    // In a real application, this would send the settings to your backend
    setAlerts([{
      type: 'success',
      message: 'Risk parameters updated successfully!'
    }]);
    
    setTimeout(() => {
      setAlerts([]);
    }, 3000);
  };
  
  return (
    <Card>
      <CardHeader title="Risk Management" />
      <CardContent>
        {alerts.map((alert, index) => (
          <Alert key={index} severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        ))}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RiskParameterBox>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Money sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Position Sizing</Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Position Size per Trade
              </Typography>
              <TextField
                value={riskParams.positionSize}
                onChange={handleInputChange('positionSize')}
                type="number"
                fullWidth
                InputProps={{ startAdornment: '$' }}
                sx={{ mb: 3 }}
              />
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Risk per Trade: {riskParams.riskPerTrade}%
              </Typography>
              <Slider
                value={riskParams.riskPerTrade}
                onChange={handleSliderChange('riskPerTrade')}
                min={0.5}
                max={5}
                step={0.5}
                marks
                valueLabelDisplay="auto"
                sx={{ color: 'primary.main' }}
              />
            </RiskParameterBox>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <RiskParameterBox>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Stop Loss & Take Profit</Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Stop Loss: {riskParams.stopLoss}%
              </Typography>
              <Slider
                value={riskParams.stopLoss}
                onChange={handleSliderChange('stopLoss')}
                min={0.5}
                max={10}
                step={0.5}
                marks
                valueLabelDisplay="auto"
                sx={{ color: 'error.main', mb: 3 }}
              />
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Take Profit: {riskParams.takeProfit}%
              </Typography>
              <Slider
                value={riskParams.takeProfit}
                onChange={handleSliderChange('takeProfit')}
                min={1}
                max={20}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{ color: 'success.main' }}
              />
            </RiskParameterBox>
          </Grid>
          
          <Grid item xs={12}>
            <RiskParameterBox>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Portfolio Limits</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Maximum Drawdown: {riskParams.maxDrawdown}%
                  </Typography>
                  <Slider
                    value={riskParams.maxDrawdown}
                    onChange={handleSliderChange('maxDrawdown')}
                    min={5}
                    max={50}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ color: 'warning.main' }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Maximum Open Positions: {riskParams.maxPositions}
                  </Typography>
                  <Slider
                    value={riskParams.maxPositions}
                    onChange={handleSliderChange('maxPositions')}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ color: 'info.main' }}
                  />
                </Grid>
              </Grid>
            </RiskParameterBox>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={applyRiskSettings}
                size="large"
              >
                Apply Risk Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default RiskManagement;