from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Mock logic toggle
USE_MOCK_DB = os.environ.get('USE_MOCK_DB', 'false').lower() == 'true'
USE_MOCK_DATA = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'

# MongoDB connection Mock Classes
class MockCollection:
    def __init__(self):
        self.data = []

    async def find_one(self, query, projection=None):
        if not self.data:
            return None
        import copy
        return copy.deepcopy(self.data[0])

    async def find(self, *args, **kwargs):
        class AsyncCursor:
            def __init__(self, data): self.data = data
            def sort(self, *args, **kwargs): return self
            def limit(self, *args, **kwargs): return self
            def __aiter__(self): return self
            async def __anext__(self):
                if not self.data: raise StopAsyncIteration
                return self.data.pop(0)
            async def to_list(self, length): return self.data[:length]
        return AsyncCursor(list(self.data))

    async def insert_one(self, doc):
        self.data.append(doc)
        return type('obj', (object,), {'inserted_id': 'mock_id'})

    async def update_one(self, query, update, upsert=False):
        if upsert and not self.data:
            self.data.append(update['$set'])
        elif self.data:
            self.data[0].update(update['$set'])
        return type('obj', (object,), {'modified_count': 1})

class MockDB:
    def __init__(self):
        self._collections = {}

    def __getattr__(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollection()
        return self._collections[name]

    def __getitem__(self, name):
        return self.__getattr__(name)

class MockClient:
    def __init__(self, url):
        self.db = MockDB()
    def __getitem__(self, name):
        return self.db
    def __getattr__(self, name):
        return self.db
    def close(self):
        pass

# Database Initialization
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
if USE_MOCK_DB:
    client = MockClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]
else:
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscriptions: Dict[WebSocket, List[str]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.subscriptions[websocket] = []

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Models
class Position(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: str
    option_type: str  # CALL or PUT
    strike: float
    expiry: str
    quantity: int
    entry_price: float
    current_price: float = 0.0
    pnl: float = 0.0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    symbol: str
    option_type: str
    strike: float
    expiry: str
    quantity: int
    order_type: str  # BUY or SELL
    price: float

class Account(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    balance: float = 1000000.0
    equity: float = 1000000.0
    margin_used: float = 0.0
    positions: List[Position] = []
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Mock data generators
def generate_mock_candles(symbol: str, interval: str = "1", n_bars: int = 100):
    import random
    import time
    
    base_price = 22150 if "NIFTY" in symbol else 10000
    candles = []
    current_time = int(time.time())
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

def generate_mock_oi_data(symbol: str = "NIFTY"):
    import random
    
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

def generate_mock_liquidity_data():
    import random
    strikes = [22100, 22150, 22200, 22250, 22300, 22350]
    data = []
    
    for strike in strikes:
        data.append({
            "strike": strike,
            "bid_volume": random.randint(50, 500),
            "ask_volume": random.randint(50, 500),
            "liquidity_score": random.uniform(0.3, 1.0)
        })
    
    return data

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Trading Dashboard API"}

@api_router.get("/market/candles")
async def get_candles(symbol: str = "NIFTY", interval: str = "1", n_bars: int = 100):
    if USE_MOCK_DATA:
        candles = generate_mock_candles(symbol, interval, n_bars)
    else:
        # Placeholder for real data provider integration
        # from data.tradingview_api import fetch_tv_candles
        # candles = fetch_tv_candles(symbol, interval, n_bars)
        candles = generate_mock_candles(symbol, interval, n_bars)

    return {"symbol": symbol, "interval": interval, "candles": candles}

@api_router.get("/market/oi-data")
async def get_oi_data(symbol: str = "NIFTY"):
    if USE_MOCK_DATA:
        return generate_mock_oi_data(symbol)

    from data.nse_api import fetch_nse_oi_data
    
    try:
        data = fetch_nse_oi_data(symbol)
        if data:
            return data
    except Exception as e:
        logging.error(f"Error fetching OI data: {e}")
    
    return generate_mock_oi_data(symbol)

@api_router.get("/market/liquidity")
async def get_liquidity_data():
    return generate_mock_liquidity_data()

@api_router.get("/account")
async def get_account():
    account_doc = await db.accounts.find_one({}, {"_id": 0})
    if not account_doc:
        account = Account()
        doc = account.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.accounts.insert_one(doc)
        return account
    
    if isinstance(account_doc['timestamp'], str):
        account_doc['timestamp'] = datetime.fromisoformat(account_doc['timestamp'])
    
    return account_doc

@api_router.post("/order")
async def place_order(order: Order):
    account_doc = await db.accounts.find_one({}, {"_id": 0})
    if not account_doc:
        account = Account()
        account_doc = account.model_dump()
    
    if order.order_type == "BUY":
        cost = order.price * order.quantity
        if account_doc['balance'] >= cost:
            account_doc['balance'] -= cost
            position = Position(
                symbol=order.symbol,
                option_type=order.option_type,
                strike=order.strike,
                expiry=order.expiry,
                quantity=order.quantity,
                entry_price=order.price,
                current_price=order.price
            )
            account_doc['positions'].append(position.model_dump())
            
            await db.accounts.update_one({}, {"$set": account_doc}, upsert=True)
            return {"status": "success", "message": "Order executed", "order_id": str(uuid.uuid4())}
        else:
            return {"status": "error", "message": "Insufficient balance"}
    
    return {"status": "success", "message": "Order placed"}

@api_router.get("/positions")
async def get_positions():
    account_doc = await db.accounts.find_one({}, {"_id": 0})
    if account_doc and 'positions' in account_doc:
        return account_doc['positions']
    return []

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    async def send_live_updates():
        while True:
            try:
                await asyncio.sleep(1)
                
                import random
                live_data = {
                    "type": "live_tick",
                    "symbol": "NIFTY",
                    "ltp": round(22150 + random.uniform(-50, 50), 2),
                    "change": round(random.uniform(-100, 100), 2),
                    "change_percent": round(random.uniform(-0.5, 0.5), 2),
                    "volume": random.randint(1000000, 5000000),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                await manager.send_personal_message(live_data, websocket)
                
            except Exception as e:
                logging.error(f"Error sending updates: {e}")
                break
    
    try:
        update_task = asyncio.create_task(send_live_updates())
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                symbols = message.get("symbols", [])
                manager.subscriptions[websocket] = symbols
                await manager.send_personal_message({
                    "type": "subscribed",
                    "symbols": symbols
                }, websocket)
            
            elif message.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        update_task.cancel()
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    if not USE_MOCK_DB:
        client.close()
