# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import yfinance as yf
import pandas as pd
import numpy as np
from statsmodels.api import OLS, add_constant
import threading
import time
from datetime import datetime, timedelta
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')


class TradingStrategy:
    def __init__(self):
        self.data = None
        self.positions = 0
        self.beta = None
        self.intercepters = None
        self.rolling_window = 252
        self.volatility_factor = 0.5
        self.transaction_cost = 0.01
        self.trailing_stop_loss = 0.02
        self.is_running = False
        self.update_interval = 30

    def initialize_data(self):
        try:
            logger.info("Initializing trading strategy...")
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365*10)
            
            # Download data with auto_adjust=True to suppress warning
            logger.info("Downloading Brent data...")
            brent_data = yf.download('BZ=F', start=start_date, end=end_date, progress=False, auto_adjust=True)
            logger.info("Downloading WTI data...")
            wti_data = yf.download('CL=F', start=start_date, end=end_date, progress=False, auto_adjust=True)
            
            if brent_data.empty or wti_data.empty:
                logger.error("Failed to download data")
                return False
            
            # Extract Close prices
            if isinstance(brent_data, pd.DataFrame):
                brent = brent_data['Close'] if 'Close' in brent_data.columns else brent_data.iloc[:, 0]
            else:
                brent = brent_data
                
            if isinstance(wti_data, pd.DataFrame):
                wti = wti_data['Close'] if 'Close' in wti_data.columns else wti_data.iloc[:, 0]
            else:
                wti = wti_data
            
            # Ensure Series
            if hasattr(brent, 'squeeze'):
                brent = brent.squeeze()
            if hasattr(wti, 'squeeze'):
                wti = wti.squeeze()
            
            # Create DataFrames with dates as index
            brent_df = pd.DataFrame({'Brent': brent})
            wti_df = pd.DataFrame({'Wti': wti})
            
            # Merge on dates to ensure alignment
            self.data = pd.merge(brent_df, wti_df, left_index=True, right_index=True, how='inner')
            
            # Remove any remaining NaN values
            self.data = self.data.dropna()
            
            logger.info(f"Data shape after merging: {self.data.shape}")
            logger.info(f"Date range: {self.data.index[0]} to {self.data.index[-1]}")
            
            if len(self.data) < self.rolling_window:
                logger.error(f"Insufficient data: {len(self.data)} rows")
                return False
            
            # Calculate hedge ratio
            X = add_constant(self.data['Wti'])
            model = OLS(self.data['Brent'], X).fit()
            self.beta = model.params['Wti']
            self.intercepters = model.params['const']
            
            logger.info(f"Beta: {self.beta:.4f}, Intercept: {self.intercepters:.4f}")
            logger.info(f"R-squared: {model.rsquared:.4f}")
            
            self.calculate_signals()
            return True
            
        except Exception as e:
            logger.error(f"Error initializing data: {e}", exc_info=True)
            return False

    def calculate_signals(self):
        try:
            # Calculate spread
            self.data['Spread'] = self.data['Brent'] - (self.beta * self.data['Wti'] + self.intercepters)
            
            # Rolling statistics
            self.data['Spread_Mean'] = self.data['Spread'].rolling(window=self.rolling_window, min_periods=1).mean()
            self.data['Spread_Std'] = self.data['Spread'].rolling(window=self.rolling_window, min_periods=1).std()
            
            # Initialize z-score column
            self.data['Spread_z'] = 0.0
            
            # Calculate z-score where std > 0
            mask = self.data['Spread_Std'] > 0
            self.data.loc[mask, 'Spread_z'] = (
                (self.data.loc[mask, 'Spread'] - self.data.loc[mask, 'Spread_Mean']) /
                self.data.loc[mask, 'Spread_Std']
            )
            
            # Generate signals
            self.data['Valid_Signal'] = abs(self.data['Spread'].diff()) > self.volatility_factor
            self.data['Long_Signal'] = (self.data['Spread_z'] < -2) & self.data['Valid_Signal']
            self.data['Short_Signal'] = (self.data['Spread_z'] > 2) & self.data['Valid_Signal']
            self.data['Close_Signal'] = (self.data['Spread_z'] > -0.5) & (self.data['Spread_z'] < 0.5)
            
            logger.info("Signals calculated successfully")
            logger.info(f"Long signals: {self.data['Long_Signal'].sum()}")
            logger.info(f"Short signals: {self.data['Short_Signal'].sum()}")
            
        except Exception as e:
            logger.error(f"Error calculating signals: {e}", exc_info=True)
            raise

    def get_current_signal(self):
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=1)
            
            # Download minute data with auto_adjust=True
            brent_data = yf.download('BZ=F', start=start_date, end=end_date, interval='1m', progress=False, auto_adjust=True)
            wti_data = yf.download('CL=F', start=start_date, end=end_date, interval='1m', progress=False, auto_adjust=True)
            
            if brent_data.empty or wti_data.empty:
                logger.warning("No current price data available")
                return None
            
            # Extract last prices - fixed for deprecation warning
            if isinstance(brent_data, pd.DataFrame) and 'Close' in brent_data.columns:
                brent_price = float(brent_data['Close'].iloc[-1].item())
            else:
                brent_price = float(brent_data.iloc[-1].item())
                
            if isinstance(wti_data, pd.DataFrame) and 'Close' in wti_data.columns:
                wti_price = float(wti_data['Close'].iloc[-1].item())
            else:
                wti_price = float(wti_data.iloc[-1].item())
            
            # Calculate current spread and z-score
            current_spread = brent_price - (self.beta * wti_price + self.intercepters)
            recent_data = self.data.tail(self.rolling_window)
            spread_mean = recent_data['Spread'].mean()
            spread_std = recent_data['Spread'].std()
            
            current_z_score = (current_spread - spread_mean) / spread_std if spread_std > 0 else 0.0
            
            # Determine signal
            signal = 'HOLD'
            if current_z_score < -2:
                signal = 'LONG'
            elif current_z_score > 2:
                signal = 'SHORT'
            elif -0.5 < current_z_score < 0.5 and self.positions != 0:
                signal = 'CLOSE'
            
            return {
                'timestamp': datetime.now().isoformat(),
                'brent_price': float(brent_price),
                'wti_price': float(wti_price),
                'spread': float(current_spread),
                'spread_mean': float(spread_mean),
                'spread_std': float(spread_std),
                'z_score': float(current_z_score),
                'signal': signal,
                'current_position': self.positions
            }
            
        except Exception as e:
            logger.error(f"Error getting current signal: {e}", exc_info=True)
            return None

    def execute_trade(self, signal_data):
        signal = signal_data['signal']
        if signal == 'LONG' and self.positions != 1:
            self.positions = 1
            return {'action': 'BUY', 'details': 'Long spread: Buy Brent, Sell WTI'}
        elif signal == 'SHORT' and self.positions != -1:
            self.positions = -1
            return {'action': 'SELL', 'details': 'Short spread: Sell Brent, Buy WTI'}
        elif signal == 'CLOSE' and self.positions != 0:
            self.positions = 0
            return {'action': 'CLOSE', 'details': 'Close all positions'}
        return {'action': 'HOLD', 'details': 'No action required'}

    def run_strategy(self):
        logger.info("Strategy started running...")
        while self.is_running:
            try:
                signal_data = self.get_current_signal()
                if signal_data:
                    trade_action = self.execute_trade(signal_data)
                    logger.info(f"Signal: {signal_data['signal']}, Z: {signal_data['z_score']:.3f}, Action: {trade_action['action']}")
                    
                    # Emit to all connected clients - fixed broadcast parameter
                    socketio.emit('strategy_update', {
                        'signal_data': signal_data,
                        'trade_action': trade_action
                    })
                    
            except Exception as e:
                logger.error(f"Error in strategy loop: {e}", exc_info=True)
            time.sleep(self.update_interval)
        logger.info("Strategy stopped")


strategy = TradingStrategy()


@app.route('/api/initialize', methods=['POST'])
def initialize():
    try:
        if strategy.initialize_data():
            return jsonify({'status': 'success', 'message': 'Strategy initialized successfully'})
        return jsonify({'status': 'error', 'message': 'Initialization failed'}), 500
    except Exception as e:
        logger.error(f"Error in initialize: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/start', methods=['POST'])
def start_strategy():
    if not strategy.is_running:
        if strategy.data is None:
            return jsonify({'status': 'error', 'message': 'Strategy not initialized'}), 400
        strategy.is_running = True
        thread = threading.Thread(target=strategy.run_strategy)
        thread.daemon = True
        thread.start()
        return jsonify({'status': 'success', 'message': 'Strategy started'})
    return jsonify({'status': 'error', 'message': 'Strategy already running'}), 400


@app.route('/api/stop', methods=['POST'])
def stop_strategy():
    strategy.is_running = False
    return jsonify({'status': 'success', 'message': 'Strategy stopped'})


@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'is_running': strategy.is_running,
        'current_position': strategy.positions,
        'beta': float(strategy.beta) if strategy.beta else None,
        'intercept': float(strategy.intercepters) if strategy.intercepters else None,
        'data_loaded': strategy.data is not None,
        'data_count': len(strategy.data) if strategy.data is not None else 0
    })


@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    if strategy.data is not None:
        try:
            data_subset = strategy.data.tail(252).copy()
            data_subset['Positions'] = 0.0
            
            for i in range(1, len(data_subset)):
                if data_subset['Long_Signal'].iloc[i]:
                    data_subset.iloc[i, data_subset.columns.get_loc('Positions')] = 1.0
                elif data_subset['Short_Signal'].iloc[i]:
                    data_subset.iloc[i, data_subset.columns.get_loc('Positions')] = -1.0
                elif data_subset['Close_Signal'].iloc[i]:
                    data_subset.iloc[i, data_subset.columns.get_loc('Positions')] = 0.0
                else:
                    data_subset.iloc[i, data_subset.columns.get_loc('Positions')] = data_subset.iloc[i-1, data_subset.columns.get_loc('Positions')]
            
            data_subset['Spread_Changes'] = data_subset['Spread'].diff()
            data_subset['PnL'] = data_subset['Positions'].shift(1) * data_subset['Spread_Changes']
            data_subset['Cumulative_PnL'] = data_subset['PnL'].fillna(0).cumsum()
            
            response_data = {
                'dates': data_subset.index.strftime('%Y-%m-%d').tolist(),
                'spread': data_subset['Spread'].fillna(0).tolist(),
                'z_score': data_subset['Spread_z'].fillna(0).tolist(),
                'cumulative_pnl': data_subset['Cumulative_PnL'].fillna(0).tolist(),
                'positions': data_subset['Positions'].fillna(0).tolist()
            }
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"Error getting historical data: {e}", exc_info=True)
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'No data available'}), 404


# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'data': 'Connected to server'})


@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")


@socketio.on('ping')
def handle_ping():
    emit('pong', {'timestamp': datetime.now().isoformat()})


@socketio.on_error_default
def default_error_handler(e):
    logger.error(f"Socket.IO error: {e}")


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')