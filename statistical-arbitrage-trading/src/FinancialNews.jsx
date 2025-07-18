// components/FinancialNews.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, Link, Divider, Avatar, Chip } from '@mui/material';
import { ArticleOutlined } from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const NewsItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(23, 42, 69, 0.5)',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(23, 42, 69, 0.7)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }
}));

// In a real application, you would use a proper API key and service
// This is a mock implementation
function FinancialNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mock news data for demonstration
    const mockNews = [
      {
        id: 1,
        title: "Oil prices rise as Middle East tensions escalate",
        source: "Financial Times",
        url: "#",
        publishedAt: "2023-05-15T10:30:00Z",
        category: "Oil"
      },
      {
        id: 2,
        title: "OPEC+ production cuts impact global crude supplies",
        source: "Reuters",
        url: "#",
        publishedAt: "2023-05-14T14:45:00Z",
        category: "Oil"
      },
      {
        id: 3,
        title: "Brent-WTI spread narrows on increased US exports",
        source: "Bloomberg",
        url: "#",
        publishedAt: "2023-05-14T09:15:00Z",
        category: "Trading"
      },
      {
        id: 4,
        title: "Statistical arbitrage strategies gain popularity in commodity markets",
        source: "Wall Street Journal",
        url: "#",
        publishedAt: "2023-05-13T16:20:00Z",
        category: "Trading"
      },
      {
        id: 5,
        title: "US crude inventories fall more than expected",
        source: "CNBC",
        url: "#",
        publishedAt: "2023-05-12T18:30:00Z",
        category: "Oil"
      }
    ];
    
    setNews(mockNews);
    setLoading(false);
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Oil': return 'success';
      case 'Trading': return 'primary';
      default: return 'default';
    }
  };
  
  return (
    <Card>
      <CardHeader title="Market News" />
      <CardContent>
        {loading ? (
          <Typography variant="body2" color="textSecondary" align="center">
            Loading news...
          </Typography>
        ) : (
          news.map((item) => (
            <NewsItem key={item.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Chip 
                  size="small" 
                  label={item.category} 
                  color={getCategoryColor(item.category)}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="textSecondary">
                  {formatDate(item.publishedAt)}
                </Typography>
              </Box>
              <Typography variant="subtitle1" gutterBottom component="div">
                <Link href={item.url} color="inherit" underline="hover" target="_blank" rel="noopener">
                  {item.title}
                </Link>
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Source: {item.source}
              </Typography>
            </NewsItem>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default FinancialNews;