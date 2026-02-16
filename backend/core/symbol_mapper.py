class SymbolMapper:
    def __init__(self):
        self.symbol_map = {
            'NIFTY': 'NSE:NIFTY',
            'BANKNIFTY': 'NSE:BANKNIFTY',
            'CNXFINANCE': 'NSE:CNXFINANCE',
            'FINNIFTY': 'NSE:CNXFINANCE',
            'INDIA VIX': 'NSE:INDIAVIX'
        }

    def get_hrn(self, symbol: str) -> str:
        """Get Human Readable Name for symbol"""
        clean_symbol = symbol.upper().replace('NSE:', '')
        return self.symbol_map.get(clean_symbol, f'NSE:{clean_symbol}')

    def get_tv_symbol(self, symbol: str) -> str:
        """Get TradingView format symbol"""
        if ':' in symbol:
            return symbol
        return self.symbol_map.get(symbol.upper(), f'NSE:{symbol.upper()}')

symbol_mapper = SymbolMapper()
