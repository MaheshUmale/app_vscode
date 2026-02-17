import logging
import asyncio
import os
import contextlib
import io
from datetime import datetime
from tradingview_scraper.symbols.stream import Streamer

try:
    from tvDatafeed import TvDatafeed, Interval
except ImportError:
    TvDatafeed = None
    Interval = None

logger = logging.getLogger(__name__)

class TradingViewAPI:
    def __init__(self):
        username = os.getenv('TV_USERNAME')
        password = os.getenv('TV_PASSWORD')
        if TvDatafeed:
            self.tv = TvDatafeed(username, password) if username and password else TvDatafeed()
            logger.info("TradingViewAPI initialized with tvDatafeed")
        else:
            self.tv = None
            logger.warning("tvDatafeed not installed, falling back to Streamer only")

        self.streamer = Streamer(export_result=False)
        self.symbol_map = {
            'NIFTY': {'symbol': 'NIFTY', 'exchange': 'NSE'},
            'BANKNIFTY': {'symbol': 'BANKNIFTY', 'exchange': 'NSE'},
            'FINNIFTY': {'symbol': 'CNXFINANCE', 'exchange': 'NSE'},
            'INDIA VIX': {'symbol': 'INDIAVIX', 'exchange': 'NSE'}
        }

    async def get_hist_candles(self, symbol: str, interval: str = '1', n_bars: int = 100):
        try:
            tv_symbol = symbol
            tv_exchange = 'NSE'

            if ':' in symbol:
                parts = symbol.split(':')
                tv_exchange = parts[0].upper()
                tv_symbol = parts[1].upper()

            clean_symbol = tv_symbol.upper()
            if clean_symbol in self.symbol_map:
                meta = self.symbol_map[clean_symbol]
                tv_symbol = meta['symbol']
                tv_exchange = meta['exchange']

            # Try Streamer first
            try:
                tf = f"{interval}m"
                if interval == '60': tf = '1h'
                elif interval == 'D': tf = '1d'

                def do_stream():
                    with contextlib.redirect_stdout(io.StringIO()):
                        return self.streamer.stream(
                            exchange=tv_exchange,
                            symbol=tv_symbol,
                            timeframe=tf,
                            numb_price_candles=n_bars
                        )

                stream = await asyncio.to_thread(do_stream)

                data = None
                for item in stream:
                    if 'ohlc' in item:
                        data = item
                        break

                if data and 'ohlc' in data:
                    candles = []
                    for row in data['ohlc']:
                        ts = row.get('timestamp') or row.get('datetime')
                        if not isinstance(ts, (int, float)):
                            try:
                                ts = int(datetime.fromisoformat(ts.replace('Z', '+00:00')).timestamp())
                            except:
                                pass

                        candles.append({
                            "time": ts,
                            "open": float(row['open']),
                            "high": float(row['high']),
                            "low": float(row['low']),
                            "close": float(row['close']),
                            "volume": int(float(row.get('volume', 0)))
                        })
                    logger.info(f"Retrieved {len(candles)} candles via Streamer")
                    return candles
            except Exception as e:
                logger.warning(f"Streamer failed for {tv_symbol}: {e}")

            # Fallback to tvDatafeed
            if self.tv:
                try:
                    tv_interval = Interval.in_1_minute
                    if interval == '5': tv_interval = Interval.in_5_minute
                    elif interval == '15': tv_interval = Interval.in_15_minute
                    elif interval == '60': tv_interval = Interval.in_1_hour
                    elif interval == 'D': tv_interval = Interval.in_daily

                    df = await asyncio.to_thread(self.tv.get_hist, symbol=tv_symbol, exchange=tv_exchange, interval=tv_interval, n_bars=n_bars)
                    if df is not None and not df.empty:
                        candles = []
                        for ts, row in df.iterrows():
                            candles.append({
                                "time": int(ts.timestamp()),
                                "open": float(row['open']),
                                "high": float(row['high']),
                                "low": float(row['low']),
                                "close": float(row['close']),
                                "volume": int(float(row.get('volume', 0)))
                            })
                        logger.info(f"Retrieved {len(candles)} candles via tvDatafeed")
                        return candles
                except Exception as e:
                    logger.warning(f"tvDatafeed failed: {e}")

            return None
        except Exception as e:
            logger.error(f"Error in get_hist_candles: {e}")
            return None

tv_api = TradingViewAPI()
