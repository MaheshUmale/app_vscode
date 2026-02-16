import React, { useState } from 'react';

export const OrderPanel = ({ symbol, oiData, onPlaceOrder }) => {
  const [strike, setStrike] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [atmValue, setAtmValue] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleOrder = async (optionType) => {
    if (!strike) {
      alert('Please select a strike price');
      return;
    }

    setLoading(true);
    const order = {
      symbol,
      option_type: optionType,
      strike: parseFloat(strike),
      expiry: '2025-02-23',
      quantity,
      order_type: 'BUY',
      price: optionType === 'CALL' ? 150 : 180,
    };

    const result = await onPlaceOrder(order);
    setLoading(false);
    
    if (result.success) {
      alert(`${optionType} order placed successfully!`);
    } else {
      alert(`Order failed: ${result.message}`);
    }
  };

  const strikes = oiData?.strikes?.slice(0, 10).map(s => s.strike) || [];

  return (
    <div className="panel order-panel" data-testid="order-panel">
      <div className="panel-header">
        <div className="panel-title">Fast Order Entry Panel</div>
      </div>

      <div className="order-buttons">
        <button 
          className="order-btn call"
          onClick={() => handleOrder('CALL')}
          disabled={loading}
          data-testid="buy-call-btn"
        >
          BUY CALL (GREEN)
        </button>
        <button 
          className="order-btn put"
          onClick={() => handleOrder('PUT')}
          disabled={loading}
          data-testid="buy-put-btn"
        >
          BUY PUT (RED)
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Strike - ATM</label>
        <select
          className="form-input"
          value={strike}
          onChange={(e) => setStrike(e.target.value)}
          data-testid="strike-select"
        >
          <option value="">Select Strike</option>
          {strikes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">ATM+/-</label>
        <select
          className="form-input"
          value={atmValue}
          onChange={(e) => setAtmValue(e.target.value)}
          data-testid="atm-select"
        >
          <option value="1">ATM + 1</option>
          <option value="0">ATM</option>
          <option value="-1">ATM - 1</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          className="form-input"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          data-testid="quantity-input"
        />
        <div className="quick-values">
          <button className="quick-btn" onClick={() => setQuantity(50)} data-testid="qty-50">50</button>
          <button className="quick-btn" onClick={() => setQuantity(100)} data-testid="qty-100">100</button>
          <button className="quick-btn" onClick={() => setQuantity(250)} data-testid="qty-250">250</button>
          <button className="quick-btn" onClick={() => setQuantity(500)} data-testid="qty-max">Max</button>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#a8a8b8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Add SL: 15 pts (Trail)</span>
          <input type="checkbox" data-testid="trailing-sl-checkbox" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Add TP: 20 pts</span>
          <input type="checkbox" data-testid="take-profit-checkbox" />
        </div>
      </div>
    </div>
  );
};
