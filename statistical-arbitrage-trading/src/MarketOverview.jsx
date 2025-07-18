// components/MarketOverview.js
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, Box, Divider } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const PriceChange = styled(Box)(({ theme, positive }) => ({
  display: 'flex',
  alignItems: 'center',
  color: positive ? theme.palette.success.main : theme.palette.error.main,
  fontWeight: 500,
}));

const commodities = [
  { symbol: 'BZ=F', name: 'Brent Crude Oil' },
  { symbol: 'CL=F', name: 'WTI Crude Oil' },
  { symbol: 'NG=F', name: 'Natural Gas' },
  { symbol: 'GC=F', name: 'Gold' },
];

function MarketOverview() {
  const [marketData, setMarketData] = useState({});
  
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchMarketData = async () => {
    try {
      const promises = commodities.map(commodity => 
        axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${commodity.symbol}?interval=1d&range=1d`)
      );
      
      const responses = await Promise.all(promises);
      console.log(responses)
      
      const newMarketData = {};
      responses.forEach((response, index) => {
        const data = response.data.chart.result[0];
        const quote = data.indicators.quote[0];
        const symbol = commodities[index].symbol;
        
        
        const currentPrice = quote.close[quote.close.length - 1];
        const previousClose = data.meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        newMarketData[symbol] = {
          name: commodities[index].name,
          price: currentPrice,
          change,
          changePercent,
          timestamp: new Date(data.meta.regularMarketTime * 1000).toLocaleString(),
        };
      });
      
      setMarketData(newMarketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader title="Market Overview" />
      <CardContent>
        <Grid container spacing={2}>
          {commodities.map(commodity => (
            <Grid item xs={12} sm={6} md={3} key={commodity.symbol}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(23, 42, 69, 0.5)', borderRadius: '8px' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {commodity.name}
                </Typography>
                <Typography variant="h5" sx={{ my: 1 }}>
                  ${marketData[commodity.symbol]?.price?.toFixed(2) || '—'}
                </Typography>
                {marketData[commodity.symbol] && (
                  <PriceChange positive={marketData[commodity.symbol].change >= 0}>
                    {marketData[commodity.symbol].change >= 0 ? (
                      <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                    ) : (
                      <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />
                    )}
                    {marketData[commodity.symbol].change.toFixed(2)} ({marketData[commodity.symbol].changePercent.toFixed(2)}%)
                  </PriceChange>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" color="textSecondary">
            Brent-WTI Spread
          </Typography>
          {marketData['BZ=F'] && marketData['CL=F'] && (
            <>
              <Typography variant="h5" sx={{ my: 1 }}>
                ${(marketData['BZ=F'].price - marketData['CL=F'].price).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Last updated: {marketData['BZ=F'].timestamp}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default MarketOverview;