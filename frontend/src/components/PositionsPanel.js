import React from 'react';

export const PositionsPanel = ({ positions }) => {
  const calculatePnL = (position) => {
    const diff = position.current_price - position.entry_price;
    return (diff * position.quantity).toFixed(2);
  };

  return (
    <div className="panel positions-panel" data-testid="positions-panel">
      <div className="panel-header">
        <div className="panel-title">Positions Table</div>
        <button
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            padding: '0.25rem 0.75rem',
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          data-testid="close-all-btn"
        >
          CLOSE ALL
        </button>
      </div>

      {positions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#a8a8b8', fontSize: '0.85rem' }} data-testid="no-positions">
          No open positions
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="positions-table" data-testid="positions-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Strike</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>P&L</th>
                <th>Delta</th>
                <th>Gamma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => {
                const pnl = calculatePnL(position);
                const isProfitable = parseFloat(pnl) > 0;
                
                return (
                  <tr key={index} data-testid={`position-row-${index}`}>
                    <td>{position.symbol}</td>
                    <td>{position.strike}</td>
                    <td style={{ color: position.option_type === 'CALL' ? '#22c55e' : '#ef4444' }}>
                      {position.option_type}
                    </td>
                    <td>{position.quantity}</td>
                    <td>₹{position.entry_price}</td>
                    <td className={isProfitable ? 'pnl-positive' : 'pnl-negative'}>
                      {isProfitable ? '+' : ''}₹{pnl}
                    </td>
                    <td>0.52</td>
                    <td>0.01</td>
                    <td>
                      <button
                        style={{
                          background: 'transparent',
                          border: '1px solid #ef4444',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          color: '#ef4444',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                        data-testid={`close-position-${index}`}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
