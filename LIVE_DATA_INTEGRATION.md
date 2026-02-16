# Live Data Integration Guide

This document outlines the interfaces and steps required to transition from Mock Data to Real Live Data using external APIs like TradingView (via `tvDatafeed` and `tv_live_wss`) and Trendlyne.

## 1. Interface Definition

To maintain a clean separation of concerns, it is recommended to implement a `DataProvider` interface.

### Python Data Provider Interface

```python
from abc import ABC, abstractmethod
import pandas as pd

class DataProvider(ABC):
    @abstractmethod
    async def get_historical_ohlcv(self, symbol: str, interval: str, n_bars: int) -> pd.DataFrame:
        """Fetch historical OHLCV data."""
        pass

    @abstractmethod
    async def get_historical_oi(self, symbol: str) -> pd.DataFrame:
        """Fetch historical Open Interest data."""
        pass

    @abstractmethod
    async def start_live_feed(self, symbols: list, callback):
        """Start a WSS feed and execute callback on new data."""
        pass
```

## 2. Implementing with TradingView (`tvDatafeed`)

For historical OHLCV data, use the `tvDatafeed` library.

```python
from tvDatafeed import TvDatafeed, Interval

class TradingViewProvider(DataProvider):
    def __init__(self):
        self.tv = TvDatafeed()

    async def get_historical_ohlcv(self, symbol: str, exchange: str, interval: str, n_bars: int):
        # Mapping interval strings to TvDatafeed Interval enum
        intervals = {
            "1m": Interval.in_1_minute,
            "5m": Interval.in_5_minute,
            "15m": Interval.in_15_minute,
            "1h": Interval.in_1_hour,
            "1d": Interval.in_daily,
        }
        tv_interval = intervals.get(interval, Interval.in_1_minute)

        df = self.tv.get_hist(
            symbol=symbol,
            exchange=exchange,
            interval=tv_interval,
            n_bars=n_bars
        )
        return df
```

## 3. Implementing Live Data (`tv_live_wss.py`)

Integrate the `tv_live_wss.py` logic to handle real-time updates via WebSockets.

```python
# Reference: backend/external/tv_live_wss.py
async def start_live_feed(self, symbols: list, callback):
    # Initialize your TV WSS client
    # Subscribe to symbols
    # On message:
    #    data = parse_wss_message(msg)
    #    await callback(data)
    pass
```

## 4. Integrating OI/PCR from Trendlyne

Use the Trendlyne API to fetch Open Interest and Put-Call Ratio data.

```python
# Reference: backend/external/trendlyne_api.py
class TrendlyneProvider:
    async def get_historical_oi(self, symbol: str):
        # Fetch from Trendlyne
        # Return formatted DataFrame or dict
        pass
```

## 5. Connecting to `server.py`

In `backend/server.py`, replace the `MockDB` calls with your new providers when `USE_MOCK_DATA` is `false`.

```python
# In server.py
if os.getenv("USE_MOCK_DATA") == "true":
    db = MockDB()
else:
    # Initialize real providers
    tv_provider = TradingViewProvider()
    trendlyne_provider = TrendlyneProvider()
    # Use these in your API endpoints
```

## 6. Required Libraries

Ensure these are added to your `requirements.txt`:
```text
tvDatafeed
pandas
websocket-client
```

> **Note:** For TradingView integration, ensure you have the necessary credentials if using a private API or the `tvDatafeed` library's authentication methods.
