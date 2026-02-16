# Professional Trading Dashboard

A full-stack trading dashboard application with real-time data feeds, options analytics, and paper trading capabilities.

## Features

### 📊 Dashboard Panels

1. **Top Bar**
   - Symbol selector (NIFTY, BANKNIFTY, FINNIFTY)
   - Live price ticker with change percentage
   - Real-time account balance display

2. **Analytics & Sentiment Panel**
   - Live PCR (Put-Call Ratio) gauge with bearish/bullish indicators
   - Multi-strike OI analysis with visual bars
   - 5-minute change tracking

3. **Index Chart**
   - Real-time candlestick chart using Lightweight Charts
   - Multiple timeframe support (1m, 5m, 15m, 1h)
   - Professional trading view with grid and crosshair

4. **Execution & Liquidity Panel**
   - Order book heatmap visualization
   - Liquidity scoring by strike price
   - Session VWAP and POI Gen indicators

5. **Options Chart**
   - Dedicated options candlestick chart
   - Bullish/Bearish OB markers
   - Real-time updates

6. **Fast Order Entry Panel**
   - Quick BUY CALL/PUT buttons
   - Strike price selection
   - ATM +/- selection
   - Quantity input with quick values (50, 100, 250, Max)
   - Stop Loss and Take Profit options

7. **Total OI Change vs Price**
   - Visual representation of OI changes
   - Strike-wise delta display
   - MAX PAIN and ATM STRADDLE calculations

8. **Cumulative Volume Delta (CVD)**
   - Histogram chart showing volume delta
   - Real-time cumulative tracking

9. **Positions Table**
   - Live P&L tracking
   - Greek values (Delta, Gamma)
   - Individual position management

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **WebSocket**: Real-time data streaming
- **Data Providers**:
  - TradingView (Live & Historical data)
  - NSE API (Options chain data)
  - Trendlyne API (OI data)

### Frontend
- **Framework**: React 19
- **Charts**: Lightweight Charts v5
- **Styling**: Custom CSS with modern design system
- **WebSocket Client**: Native WebSocket API

## Configuration

### Data Provider Configuration
The system uses a configurable data provider system. Edit `/app/backend/config.py`:

```python
DATA_PROVIDER_CONFIG = {
    'live_feed': {
        'provider': 'tradingview',  # Switch providers
        'enabled': True
    },
    'historical': {
        'provider': 'tradingview',
        'enabled': True
    },
    'options': {
        'provider': 'nse',
        'fallback': 'trendlyne',
        'enabled': True
    }
}
```

### Paper Trading Configuration
```python
PAPER_TRADING_CONFIG = {
    'enabled': True,
    'initial_balance': 1000000,  # 10 Lakhs
    'max_position_size': 100000,  # 1 Lakh
    'trading_enabled': True
}
```

## API Endpoints

### Market Data
- `GET /api/market/candles` - Fetch candlestick data
- `GET /api/market/oi-data` - Get options OI data
- `GET /api/market/liquidity` - Get liquidity heatmap data

### Trading
- `GET /api/account` - Get account details
- `POST /api/order` - Place order
- `GET /api/positions` - Get open positions

### WebSocket
- `WS /ws` - Real-time data stream

## Design System

### Color Palette
- **Background**: `#0a0a0f` (Deep black)
- **Panel**: `#1a1a2e` to `#16213e` (Gradient)
- **Border**: `#6b46c1` (Purple accent)
- **Accent**: `#00d4ff` (Cyan)
- **Success**: `#22c55e` (Green)
- **Danger**: `#ef4444` (Red)

---

**Made with Emergent** 🚀
