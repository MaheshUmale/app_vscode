import React, { useState, useEffect } from 'react';

export const TopBar = ({ symbol, livePrice, account, onSymbolChange }) => {
  const symbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return price ? price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const currentPrice = livePrice?.ltp || 22150.50;
  const priceChange = livePrice?.change || 0;
  const changePercent = livePrice?.change_percent || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="top-bar" data-testid="top-bar">
      <div className="symbol-selector-container">
        <select
          className="symbol-selector"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          data-testid="symbol-selector"
        >
          {symbols.map(sym => (
            <option key={sym} value={sym}>{sym} | 23 FEB EXP</option>
          ))}
        </select>
      </div>

      <div className="price-info" data-testid="price-info">
        <span className="price-value" data-testid="price-value">{formatPrice(currentPrice)}</span>
        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`} data-testid="price-change">
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}% ↑
        </span>
        <span className="timestamp" style={{ fontSize: '0.9rem', color: '#a8a8b8', marginLeft: '1rem' }}>
          {livePrice?.timestamp ? new Date(livePrice.timestamp).toLocaleTimeString('en-IN') : (mounted ? getCurrentTime() : '--:--:--')}
        </span>
      </div>

      <div className="time-balance" data-testid="time-balance">
        <div className="latency-info" style={{ color: '#a8a8b8', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '0.5rem' }}>●</span>
          <span>-5ms</span>
        </div>
        <div className="balance-info" data-testid="balance-info">
          BAL: ₹{account ? formatPrice(account.balance) : '10,00,000'}
        </div>
      </div>
    </div>
  );
};
