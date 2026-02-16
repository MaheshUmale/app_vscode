import React from 'react';

export const OIChangePanel = ({ oiData }) => {
  const strikes = oiData?.strikes?.slice(0, 6) || [];

  return (
    <div className="panel oi-change-panel" data-testid="oi-change-panel">
      <div className="panel-header">
        <div className="panel-title">Total OI Change vs. Price</div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '10px', height: '10px', background: '#facc15', borderRadius: '50%', marginRight: '0.5rem' }}></div>
          <span style={{ fontSize: '0.75rem', color: '#a8a8b8' }}>Spot Price</span>
          <div style={{ width: '10px', height: '10px', background: '#a855f7', borderRadius: '50%', marginLeft: 'auto', marginRight: '0.5rem' }}></div>
          <span style={{ fontSize: '0.75rem', color: '#a8a8b8' }}>Cumulative OI Change</span>
        </div>

        {/* Simple visualization */}
        <div style={{ marginTop: '1.5rem' }}>
          {strikes.map((strike, index) => {
            const totalChange = strike.ce_change + strike.pe_change;
            const changeColor = totalChange > 0 ? '#22c55e' : '#ef4444';
            const changeWidth = Math.min(Math.abs(totalChange) / 10000 * 100, 100);
            
            return (
              <div key={index} style={{ marginBottom: '1rem' }} data-testid={`oi-change-${strike.strike}`}>
                <div style={{ fontSize: '0.75rem', color: '#a8a8b8', marginBottom: '0.25rem' }}>
                  {strike.strike}
                </div>
                <div style={{ 
                  height: '20px', 
                  background: 'rgba(107, 70, 193, 0.2)', 
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${changeWidth}%`,
                    background: changeColor,
                    transition: 'width 0.3s ease'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0.5rem',
                    transform: 'translateY(-50%)',
                    fontSize: '0.7rem',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {totalChange > 0 ? '+' : ''}{totalChange.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: '#a8a8b8', padding: '0.75rem', background: 'rgba(107, 70, 193, 0.1)', borderRadius: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>MAX PAIN: <span style={{ color: '#ef4444', fontWeight: '600' }}>22,100</span> (Cryp)</span>
          <span>ATM STRADDLE: <span style={{ color: '#facc15', fontWeight: '600' }}>146.50 (W-35%)</span></span>
        </div>
      </div>
    </div>
  );
};
