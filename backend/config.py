import os
from typing import Dict, Any

# Trading View Configuration
TV_COOKIE = {}
TV_STUDY_ID = None
TV_USERNAME = os.getenv('TV_USERNAME')
TV_PASSWORD = os.getenv('TV_PASSWORD')

# Data Provider Configuration
DATA_PROVIDER_CONFIG: Dict[str, Any] = {
    'live_feed': {
        'provider': 'tradingview',  # 'tradingview' | 'nse' | 'custom'
        'enabled': True
    },
    'historical': {
        'provider': 'tradingview',  # 'tradingview' | 'nse'
        'enabled': True
    },
    'options': {
        'provider': 'nse',  # 'nse' | 'trendlyne'
        'fallback': 'trendlyne',
        'enabled': True
    }
}

# Paper Trading Configuration
PAPER_TRADING_CONFIG = {
    'enabled': True,
    'initial_balance': 1000000,  # 10 Lakhs
    'max_position_size': 100000,  # 1 Lakh
    'trading_enabled': True
}

# WebSocket Configuration
WS_CONFIG = {
    'ping_interval': 20,
    'ping_timeout': 10,
    'reconnect_delay': 5
}
