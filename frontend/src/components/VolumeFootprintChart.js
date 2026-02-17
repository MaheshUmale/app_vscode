import React, { useMemo } from 'react';

export const VolumeFootprintChart = ({ candles, interval }) => {
  const isEnabled = useMemo(() => {
    const intVal = parseInt(interval);
    return isNaN(intVal) || intVal >= 5;
  }, [interval]);

  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  const footprintData = useMemo(() => {
    if (!latestCandle) return { levels: [], poc: null, va: { vh: null, vl: null }, delta: 0, total: 0 };
    const { high, low, close, open, volume } = latestCandle;
    const step = 5;
    const levels = [];
    let totalVol = 0;
    let maxLevelVol = 0;
    let pocPrice = null;

    const midPoint = (open + close) / 2;
    const range = high - low || 1;

    for (let p = Math.floor(low / step) * step; p <= Math.ceil(high / step) * step; p += step) {
      const isBullish = close >= open;

      // Improved distribution: higher volume near the midpoint of the candle body
      const distance = Math.abs(p - midPoint);
      const weight = Math.exp(-0.5 * Math.pow(distance / (range / 4), 2));

      const avgVolPerLevel = volume / ((high - low) / step + 1);
      const levelVol = Math.floor(avgVolPerLevel * weight * 1.5) + 10;

      // Distribution between buy and sell based on price position relative to open/close
      let buyRatio = 0.5;
      if (p > open && p < close) buyRatio = 0.7; // Inside bullish body
      else if (p < open && p > close) buyRatio = 0.3; // Inside bearish body
      else if (p > Math.max(open, close)) buyRatio = 0.4; // Upper wick
      else buyRatio = 0.6; // Lower wick

      const buyVol = Math.floor(levelVol * buyRatio);
      const sellVol = levelVol - buyVol;

      if (levelVol > maxLevelVol) {
        maxLevelVol = levelVol;
        pocPrice = p;
      }
      totalVol += levelVol;

      levels.push({
        price: p,
        buyVol,
        sellVol,
        totalVol: levelVol
      });
    }

    // Sort levels descending for display
    levels.sort((a, b) => b.price - a.price);

    // Mock Value Area (70% of volume)
    // In a real app we would sort by volume and pick levels until 70%
    const vaCount = Math.floor(levels.length * 0.7);
    const vaStartIndex = Math.floor((levels.length - vaCount) / 2);
    const vavh = levels[vaStartIndex]?.price;
    const vavl = levels[vaStartIndex + vaCount]?.price;

    // Delta
    const totalBuy = levels.reduce((acc, l) => acc + l.buyVol, 0);
    const totalSell = levels.reduce((acc, l) => acc + l.sellVol, 0);
    const delta = totalBuy - totalSell;

    // Imbalances (Diagonal comparison: Buy(P) vs Sell(P-step))
    levels.forEach((l, i) => {
        // Buy imbalance: Buy at this level vs Sell at level below
        const levelBelow = levels[i + 1];
        if (levelBelow) {
            l.buyImbalance = l.buyVol > levelBelow.sellVol * 3;
        }
        // Sell imbalance: Sell at this level vs Buy at level above
        const levelAbove = levels[i - 1];
        if (levelAbove) {
            l.sellImbalance = l.sellVol > levelAbove.buyVol * 3;
        }
    });

    return { levels, poc: pocPrice, va: { vh: vavh, vl: vavl }, delta, total: totalVol };
  }, [latestCandle]);

  if (!isEnabled) {
    return (
      <div className="panel footprint-chart" data-testid="footprint-chart">
        <div className="panel-header">
          <div className="panel-title">VOLUME FOOTPRINT</div>
        </div>
        <div className="footprint-empty">
          Footprint available on 5m timeframe and above.
        </div>
      </div>
    );
  }

  const { levels, poc, va, delta, total } = footprintData;

  return (
    <div className="panel footprint-chart" data-testid="footprint-chart">
      <div className="panel-header">
        <div className="panel-title">FOOTPRINT (LATEST BAR)</div>
        <div className="panel-info">TF: {interval}m</div>
      </div>
      <div className="footprint-scroll">
        {latestCandle ? (
          <div className="footprint-content">
            <table className="footprint-table">
              <thead>
                <tr>
                  <th>SELL</th>
                  <th>PRICE</th>
                  <th>BUY</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((d, i) => {
                  const isPOC = d.price === poc;
                  const inVA = d.price <= va.vh && d.price >= va.vl;

                  return (
                    <tr key={i} className={`${isPOC ? 'poc-level' : ''} ${inVA ? 'va-level' : ''}`}>
                      <td className={`sell-vol ${d.sellImbalance ? 'imbalance' : ''}`}>
                        {d.sellVol.toLocaleString()}
                      </td>
                      <td className="price-level">
                        {d.price}
                        {d.price === va.vh && <span className="va-label vh">VAH</span>}
                        {d.price === va.vl && <span className="va-label vl">VAL</span>}
                      </td>
                      <td className={`buy-vol ${d.buyImbalance ? 'imbalance' : ''}`}>
                        {d.buyVol.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="footprint-summary">
                <div className="summary-item">
                    <span>Delta:</span>
                    <span className={delta >= 0 ? 'pos' : 'neg'}>{delta.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                    <span>Total:</span>
                    <span>{total.toLocaleString()}</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="footprint-empty">No data available</div>
        )}
      </div>
    </div>
  );
};
