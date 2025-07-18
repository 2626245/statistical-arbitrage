import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PlayArrow, Stop, Refresh, TrendingUp, TrendingDown, CheckCircle } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const API_URL = 'http://localhost:5000/api';

// Styled components
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const PriceDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
}));

const SignalChip = styled(Chip)(({ theme, signal }) => {
  let color = theme.palette.info.main;
  if (signal === 'LONG') color = theme.palette.success.main;
  if (signal === 'SHORT') color = theme.palette.error.main;
  if (signal === 'CLOSE') color = theme.palette.warning.main;

  return {
    backgroundColor: 'transparent',
    color: color,
    border: `1px solid ${color}`,
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: theme.spacing(2),
  };
});

function RuleBasedDashboard() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSignal, setCurrentSignal] = useState(null);
  const [tradeAction, setTradeAction] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [status, setStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      showAlert('Connected to server', 'success');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      showAlert('Disconnected from server', 'error');
    });

    newSocket.on('strategy_update', (data) => {
      console.log('Received strategy update:', data);
      setCurrentSignal(data.signal_data);
      setTradeAction(data.trade_action);

      const logEntry = {
        timestamp: new Date().toLocaleString(),
        signal: data.signal_data.signal,
        action: data.trade_action.action,
        details: data.trade_action.details,
        zScore: data.signal_data.z_score.toFixed(3),
      };
      setLogs((prev) => [logEntry, ...prev.slice(0, 49)]);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      showAlert('Connection error', 'error');
    });

    setSocket(newSocket);
    fetchStatus();

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/status`);
      setStatus(response.data);
      setIsRunning(response.data.is_running);
      setIsInitialized(response.data.beta !== null);
    } catch (error) {
      console.error('Error fetching status:', error);
      showAlert('Error fetching status', 'error');
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`${API_URL}/historical`);
      const data = response.data;
      const formattedData = data.dates.map((date, index) => ({
        date,
        spread: data.spread[index],
        zScore: data.z_score[index],
        cumulativePnL: data.cumulative_pnl[index],
        position: data.positions[index],
      }));
      setHistoricalData(formattedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      showAlert('Error fetching historical data', 'error');
    }
  };

  const handleInitialize = async () => {
    try {
      showAlert('Initializing strategy...', 'info');
      await axios.post(`${API_URL}/initialize`);
      await fetchStatus();
      await fetchHistoricalData();
      setIsInitialized(true);
      showAlert('Strategy initialized successfully', 'success');
    } catch (error) {
      console.error('Error initializing strategy:', error);
      showAlert('Error initializing strategy', 'error');
    }
  };

  const handleStart = async () => {
    try {
      await axios.post(`${API_URL}/start`);
      setIsRunning(true);
      showAlert('Strategy started successfully', 'success');
    } catch (error) {
      console.error('Error starting strategy:', error);
      showAlert('Error starting strategy', 'error');
    }
  };

  const handleStop = async () => {
    try {
      await axios.post(`${API_URL}/stop`);
      setIsRunning(false);
      showAlert('Strategy stopped successfully', 'success');
    } catch (error) {
      console.error('Error stopping strategy:', error);
      showAlert('Error stopping strategy', 'error');
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY':
        return 'success';
      case 'SELL':
        return 'error';
      case 'CLOSE':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* Connection Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: isConnected ? 'success.dark' : 'error.dark' }}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <CheckCircle sx={{ mr: 1 }} />
              <Typography variant="body1">
                {isConnected ? 'Connected to Trading Server' : 'Disconnected from Trading Server'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Strategy Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Strategy Controls" />
            <CardContent>
              <Box display="flex" flexDirection="column">
                <StyledButton
                  variant="outlined"
                  color="primary"
                  startIcon={<Refresh />}
                  onClick={handleInitialize}
                  disabled={isRunning}
                >
                  Initialize Strategy
                </StyledButton>
                <StyledButton
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={handleStart}
                  disabled={isRunning || !isInitialized || !isConnected}
                >
                  Start Trading
                </StyledButton>
                <StyledButton
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={handleStop}
                  disabled={!isRunning}
                >
                  Stop Trading
                </StyledButton>
              </Box>

              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Strategy Status
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(23,42,69,0.5)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Strategy:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Chip label={isRunning ? 'RUNNING' : 'STOPPED'} color={isRunning ? 'success' : 'default'} size="small" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Current Position:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">{status.current_position || 0}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Beta:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">{status.beta?.toFixed(4) || 'N/A'}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Intercept:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">{status.intercept?.toFixed(4) || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Performance Summary */}
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Performance Summary
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(23,42,69,0.5)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Total Trades:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">{logs.length}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Last Update:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        {currentSignal ? new Date(currentSignal.timestamp).toLocaleTimeString() : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Market Signal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Current Market Signal" />
            <CardContent>
              {currentSignal ? (
                <Box>
                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} sm={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Brent Crude
                        </Typography>
                        <PriceDisplay color="primary">${currentSignal.brent_price?.toFixed(2)}</PriceDisplay>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          WTI Crude
                        </Typography>
                        <PriceDisplay color="primary">${currentSignal.wti_price?.toFixed(2)}</PriceDisplay>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Current Spread
                        </Typography>
                        <Typography variant="h6">{currentSignal.spread?.toFixed(3)}</Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Z-Score
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            currentSignal.z_score > 2
                              ? 'error.main'
                              : currentSignal.z_score < -2
                              ? 'success.main'
                              : 'inherit'
                          }
                        >
                          {currentSignal.z_score?.toFixed(3)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box textAlign="center" mt={3}>
                    <SignalChip
                      label={currentSignal.signal}
                      signal={currentSignal.signal}
                      icon={
                        currentSignal.signal === 'LONG' ? (
                          <TrendingUp />
                        ) : currentSignal.signal === 'SHORT' ? (
                          <TrendingDown />
                        ) : null
                      }
                      size="large"
                    />
                  </Box>

                  {tradeAction && (
                    <Box
                      mt={3}
                      p={2}
                      sx={{
                        backgroundColor: 'rgba(23,42,69,0.5)',
                        borderRadius: '8px',
                        border: `1px solid ${getActionColor(tradeAction.action)}`,
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Trade Action
                      </Typography>
                      <Typography variant="h6" color={`${getActionColor(tradeAction.action)}.main`}>
                        {tradeAction.action}: {tradeAction.details}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No current signal data. Please initialize and start the strategy.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Z-Score Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px' }}>
            <CardHeader title="Z-Score & Position" />
            <CardContent sx={{ height: '340px' }}>
              {historicalData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,255,218,0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#8892b0' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fill: '#8892b0' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#172a45',
                        borderColor: '#64ffda',
                        color: '#ccd6f6',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="zScore" stroke="#8884d8" name="Z-Score" dot={false} />
                    <Line type="monotone" dataKey="position" stroke="#4CAF50" name="Position" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No historical data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Cumulative PnL Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px' }}>
            <CardHeader title="Cumulative PnL" />
            <CardContent sx={{ height: '340px' }}>
              {historicalData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,255,218,0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#8892b0' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fill: '#8892b0' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#172a45',
                        borderColor: '#64ffda',
                        color: '#ccd6f6',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cumulativePnL"
                      stroke="#82ca9d"
                      fill="rgba(130, 202, 157, 0.2)"
                      name="Cumulative PnL"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No historical data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trading Logs */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Trading Logs" subheader={`Total logs: ${logs.length}`} />
            <CardContent>
              <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(23,42,69,0.5)', maxHeight: 400 }}>
                <Table sx={{ minWidth: 650 }} size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Signal</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Z-Score</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{log.timestamp}</TableCell>
                          <TableCell>
                            <Chip
                              label={log.signal}
                              size="small"
                              color={
                                log.signal === 'LONG'
                                  ? 'success'
                                  : log.signal === 'SHORT'
                                  ? 'error'
                                  : log.signal === 'CLOSE'
                                  ? 'warning'
                                  : 'info'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={log.action} size="small" color={getActionColor(log.action)} variant="outlined" />
                          </TableCell>
                          <TableCell>{log.zScore}</TableCell>
                          <TableCell>{log.details}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No trading logs available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default RuleBasedDashboard;
