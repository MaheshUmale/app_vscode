import asyncio
import logging
import json
import io
import contextlib
from datetime import datetime
from tradingview_scraper.symbols.stream import Streamer

logger = logging.getLogger(__name__)

class DataEngine:
    def __init__(self, manager):
        self.manager = manager
        self.streamer = Streamer(export_result=False)
        self.running_tasks = {}
        self.lock = asyncio.Lock()

    async def start_streaming(self, symbol: str):
        async with self.lock:
            if symbol in self.running_tasks:
                return
            self.running_tasks[symbol] = asyncio.create_task(self._stream_loop(symbol))
            logger.info(f"Started streaming for {symbol}")

    async def stop_streaming(self, symbol: str):
        async with self.lock:
            if symbol in self.running_tasks:
                self.running_tasks[symbol].cancel()
                del self.running_tasks[symbol]
                logger.info(f"Stopped streaming for {symbol}")

    async def _stream_loop(self, symbol: str):
        tv_symbol = symbol
        tv_exchange = 'NSE'
        if ':' in symbol:
            parts = symbol.split(':')
            tv_exchange = parts[0].upper()
            tv_symbol = parts[1].upper()

        while True:
            try:
                def get_stream():
                    with contextlib.redirect_stdout(io.StringIO()):
                        return self.streamer.stream(
                            exchange=tv_exchange,
                            symbol=tv_symbol,
                            timeframe='1m',
                            numb_price_candles=1
                        )

                stream = await asyncio.to_thread(get_stream)

                for item in stream:
                    if 'ohlc' in item:
                        # This is the last candle
                        ohlc = item['ohlc'][-1]
                        tick_data = {
                            "type": "live_tick",
                            "symbol": symbol,
                            "ltp": float(ohlc['close']),
                            "open": float(ohlc['open']),
                            "high": float(ohlc['high']),
                            "low": float(ohlc['low']),
                            "volume": int(float(ohlc.get('volume', 0))),
                            "timestamp": datetime.now().isoformat()
                        }
                        await self.manager.broadcast_to_symbol(symbol, tick_data)

                    await asyncio.sleep(0.5) # Throttle
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in stream loop for {symbol}: {e}")
                await asyncio.sleep(5) # Backoff

data_engine = None # Will be initialized in server.py
