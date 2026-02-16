import React from 'react';

export const ExecutionPanel = ({ liquidityData }) => {
  const getColor = (score) => {
    if (score > 0.7) return 'rgba(34, 197, 94, 0.8)';
    if (score > 0.4) return 'rgba(168, 85, 247, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };

  // Generate heatmap data from liquidity data
  const heatmapData = liquidityData.slice(0, 24).map((item, index) => ({
    value: item.liquidity_score || Math.random(),
    label: item.strike || (22100 + index * 50),
  }));

  return (
    <div className="panel execution-panel" data-testid="execution-panel">
      <div className="panel-header">
        <div className="panel-title">EXECUTION & LIQUIDITY (25s)</div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#a8a8b8', marginBottom: '0.5rem' }}>
          Liquidity / Order Book Heatmap
        </div>
      </div>

      <div className="heatmap-grid" data-testid="heatmap-grid">
        {heatmapData.map((cell, index) => (
          <div
            key={index}
            className="heatmap-cell"
            style={{
              background: getColor(cell.value),
            }}
            data-testid={`heatmap-cell-${index}`}
          >
            <div style={{ color: 'white', fontWeight: '700' }}>{cell.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: '#a8a8b8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Session Vwap 22190</span>
          <span style={{ color: '#22c55e' }}>80.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>POI Gen 22160</span>
          <span style={{ color: '#00d4ff' }}>401.60</span>
        </div>
      </div>
    </div>
  );
};
