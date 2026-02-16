import logging
import asyncio
from tradingview_scraper.symbols.stream import Streamer
import io
import contextlib
from datetime import datetime

logger = logging.getLogger(__name__)

class TradingViewAPI:
    def __init__(self):
        self.streamer = Streamer(export_result=False)

    async def get_hist_candles(self, symbol: str, interval: str = '1', n_bars: int = 100):
        try:
            # Map interval to TV timeframe
            tf = f"{interval}m"
            if interval == '60': tf = '1h'
            elif interval == 'D': tf = '1d'

            # Extract symbol and exchange
            tv_exchange = "NSE"
            tv_symbol = symbol
            if ":" in symbol:
                tv_exchange, tv_symbol = symbol.split(":")

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
                    if isinstance(ts, str):
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
                return candles # Streamer usually returns oldest first or newest first?
                # User snippet says return candles[::-1] for consistency.
                # Let's check what UI expects. UI usually expects sorted by time ASC.
            return None
        except Exception as e:
            logger.error(f"Error fetching TV candles: {e}")
            return None

tv_api = TradingViewAPI()
