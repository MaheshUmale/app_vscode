import React from 'react';

export const AnalyticsPanel = ({ oiData, symbol }) => {
  const pcr = oiData?.pcr || 0.85;
  const strikes = oiData?.strikes || [];
  
  // Calculate gauge position
  const getGaugePosition = (value) => {
    // PCR range typically 0.5 to 1.5, map to 0-180 degrees
    const normalized = Math.max(0, Math.min(1.5, value));
    return (normalized / 1.5) * 180;
  };

  const angle = getGaugePosition(pcr);
  const isB earish = pcr < 0.7;
  const isBullish = pcr > 1.1;
  
  // Get top 5 strikes by volume for display
  const topStrikes = strikes.slice(0, 5);
  
  const getBarWidth = (value, max) => {
    return `${(Math.abs(value) / max) * 100}%`;
  };

  const maxOI = Math.max(...topStrikes.map(s => Math.max(s.ce_oi, s.pe_oi)), 100000);

  return (
    <div className="panel analytics-panel" data-testid="analytics-panel">
      <div className="panel-header">
        <div className="panel-title">ANALYTICS & SENTIMENT (30s)</div>
      </div>

      {/* PCR Gauge */}
      <div className="pcr-gauge" data-testid="pcr-gauge">
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#a8a8b8', marginBottom: '0.5rem' }}>Live PCR & Change</div>
        </div>
        
        <svg className="gauge-svg" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="rgba(107, 70, 193, 0.3)"
            strokeWidth="12"
          />
          
          {/* Bearish section (red) */}
          <path
            d="M 20 80 A 80 80 0 0 1 100 10"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            opacity="0.6"
          />
          
          {/* Bullish section (green) */}
          <path
            d="M 100 10 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            opacity="0.6"
          />
          
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2={100 + 60 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={80 + 60 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke="#00d4ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Center dot */}
          <circle cx="100" cy="80" r="5" fill="#00d4ff" />
          
          {/* Labels */}
          <text x="15" y="95" fill="#ef4444" fontSize="10" fontWeight="600">-0.7</text>
          <text x="90" y="15" fill="#a8a8b8" fontSize="10" fontWeight="600">1.1</text>
          <text x="170" y="95" fill="#22c55e" fontSize="10" fontWeight="600">&gt;1.1</text>
        </svg>
        
        <div className="gauge-value" data-testid="pcr-value">{pcr.toFixed(2)}</div>
        <div className="gauge-label" style={{ color: isBearish ? '#ef4444' : isBullish ? '#22c55e' : '#00d4ff' }}>
          {isBearish ? '(Bearish)' : isBullish ? '(Bullish)' : '(Neutral)'}
        </div>
        
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#a8a8b8' }}>
          <div>5min Change: <span style={{ color: '#ef4444' }}>-0.11</span></div>
        </div>
      </div>

      {/* Multi Strike Analysis */}
      <div style={{ marginTop: '2rem' }}>
        <div className="panel-title" style={{ marginBottom: '1rem' }}>Multi Strike OI Analysis</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.5rem', color: '#a8a8b8' }}>
          <span style={{ width: '50px' }}></span>
          <span style={{ flex: 1, textAlign: 'center' }}>Call OI</span>
          <span style={{ flex: 1, textAlign: 'center' }}>Put OI</span>
        </div>
        
        {topStrikes.map((strike, index) => (
          <div key={index} className="strike-row" data-testid={`strike-row-${strike.strike}`}>
            <div className="strike-label">{strike.strike}</div>
            <div className="strike-bars">
              <div 
                className="call-bar" 
                style={{ width: getBarWidth(strike.ce_oi, maxOI) }}
                title={`Call OI: ${strike.ce_oi.toLocaleString()}`}
              />
              <div 
                className="put-bar" 
                style={{ width: getBarWidth(strike.pe_oi, maxOI) }}
                title={`Put OI: ${strike.pe_oi.toLocaleString()}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
