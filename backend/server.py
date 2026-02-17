from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import json
import asyncio
import random
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional

from sqlite_db import sqlite_db
from data_engine import DataEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Mock logic toggle
USE_MOCK_DATA = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscriptions: Dict[WebSocket, List[str]] = {}
        self.data_engine = None

    def set_data_engine(self, engine: DataEngine):
        self.data_engine = engine

    async def connect(self, websocket: WebSocket):
        try:
            # Important: Accept the connection before doing anything else
            await websocket.accept()
            self.active_connections.append(websocket)
            self.subscriptions[websocket] = []
            logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        except Exception as e:
            logger.error(f"Error during websocket accept: {e}")
            raise

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

    async def broadcast_to_symbol(self, symbol: str, message: dict):
        for connection, symbols in self.subscriptions.items():
            if symbol in symbols:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite
    logger.info("Starting up: Initializing database")
    await sqlite_db.init_db()

    # Initialize DataEngine
    engine = DataEngine(manager)
    manager.set_data_engine(engine)
    
    yield
    # Shutdown
    logger.info("Shutting down")

# Create the main app
app = FastAPI(lifespan=lifespan)

# API Routes
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Trading Dashboard API"}

@api_router.get("/market/candles")
async def get_candles(symbol: str = "NIFTY", interval: str = "1", n_bars: int = 100):
    if USE_MOCK_DATA:
        candles = generate_mock_candles(symbol, interval, n_bars)
    else:
        try:
            from data.tv_api import tv_api
            candles = await tv_api.get_hist_candles(symbol, interval, n_bars)
            if not candles:
                candles = generate_mock_candles(symbol, interval, n_bars)
        except Exception as e:
            logger.error(f"Error fetching real candles: {e}")
            candles = generate_mock_candles(symbol, interval, n_bars)
    return {"symbol": symbol, "interval": interval, "candles": candles}

def generate_mock_candles(symbol: str, interval: str = "1", n_bars: int = 100):
    base_price = 22150 if "NIFTY" in symbol else 10000
    candles = []
    current_time = int(datetime.now().timestamp())
    interval_seconds = int(interval) * 60 if interval.isdigit() else 3600
    for i in range(n_bars):
        ts = current_time - (n_bars - i) * interval_seconds
        open_price = base_price + random.uniform(-100, 100)
        close_price = open_price + random.uniform(-50, 50)
        high_price = max(open_price, close_price) + random.uniform(0, 30)
        low_price = min(open_price, close_price) - random.uniform(0, 30)
        volume = random.uniform(100000, 500000)
        candles.append({
            "time": ts,
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": int(volume)
        })
        base_price = close_price
    return candles

@api_router.get("/market/oi-data")
async def get_oi_data(symbol: str = "NIFTY"):
    try:
        if not USE_MOCK_DATA:
            from data.trendlyne_api import trendlyne_api
            stock_id = await trendlyne_api.get_stock_id(symbol)
            if stock_id:
                expiries = await trendlyne_api.get_expiry_dates(stock_id)
                if expiries:
                    data = await trendlyne_api.get_oi_data(stock_id, expiries[0], datetime.now().strftime("%H:%M"))
                    if data:
                        return data
    except Exception as e:
        logger.error(f"Error fetching real OI data: {e}")
    
    # Mock fallback
    return generate_mock_oi_data(symbol)

def generate_mock_oi_data(symbol: str = "NIFTY"):
    atm_strike = 22150
    strikes = []
    for i in range(-10, 11):
        strike = atm_strike + (i * 50)
        ce_oi = random.randint(10000, 100000)
        pe_oi = random.randint(10000, 100000)
        strikes.append({
            "strike": strike,
            "ce_oi": ce_oi,
            "pe_oi": pe_oi,
            "ce_change": random.randint(-5000, 5000),
            "pe_change": random.randint(-5000, 5000),
            "ce_ltp": round(strike - atm_strike + 100 + random.uniform(-50, 50), 2),
            "pe_ltp": round(atm_strike - strike + 100 + random.uniform(-50, 50), 2),
        })
    total_ce_oi = sum(s["ce_oi"] for s in strikes)
    total_pe_oi = sum(s["pe_oi"] for s in strikes)
    pcr = round(total_pe_oi / total_ce_oi if total_ce_oi > 0 else 0, 2)
    return {
        "symbol": symbol,
        "pcr": pcr,
        "strikes": strikes,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/account")
async def get_account():
    account_doc = await sqlite_db.get_account()
    if not account_doc:
        return {"balance": 1000000.0, "equity": 1000000.0}
    return account_doc

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                symbols = message.get("symbols", [])
                manager.subscriptions[websocket] = symbols

                # Start data engine for these symbols if not already running
                if manager.data_engine and not USE_MOCK_DATA:
                    for s in symbols:
                        await manager.data_engine.start_streaming(s)

                await manager.send_personal_message({
                    "type": "subscribed",
                    "symbols": symbols
                }, websocket)

                # If mock data is enabled, start a local mock stream for this connection
                if USE_MOCK_DATA:
                    asyncio.create_task(send_mock_updates(websocket, symbols))
            
            elif message.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def send_mock_updates(websocket: WebSocket, symbols: List[str]):
    try:
        while websocket in manager.active_connections:
            await asyncio.sleep(1)
            for symbol in symbols:
                live_data = {
                    "type": "live_tick",
                    "symbol": symbol,
                    "ltp": round(22150 + random.uniform(-50, 50), 2),
                    "change": round(random.uniform(-100, 100), 2),
                    "change_percent": round(random.uniform(-0.5, 0.5), 2),
                    "volume": random.randint(1000000, 5000000),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                await websocket.send_json(live_data)
    except Exception:
        pass

app.include_router(api_router)

# Allow ALL origins to avoid connection issues during development/proxying
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
