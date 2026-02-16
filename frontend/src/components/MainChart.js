import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

const intervalOptions = [
  { value: '1', label: '1 minute' },
  { value: '5', label: '5 minute' },
  { value: '15', label: '15 minute' },
  { value: '60', label: '1 hour' },
];

export const MainChart = ({ candles, interval, onIntervalChange, oiData, symbol }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a8a8b8',
      },
      grid: {
        vertLines: { color: 'rgba(107, 70, 193, 0.1)' },
        horzLines: { color: 'rgba(107, 70, 193, 0.1)' },
      },
      timeScale: {
        timeVisible: true,
        borderColor: 'rgba(107, 70, 193, 0.3)',
      },
      rightPriceScale: {
        borderColor: 'rgba(107, 70, 193, 0.3)',
      },
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      seriesRef.current.setData(candles);
    }
  }, [candles]);

  useEffect(() => {
    if (!seriesRef.current || !oiData || !oiData.strikes) return;

    // Clear existing price lines if possible
    // lightweight-charts v4+ doesn't have a simple "clearPriceLines"
    // but we can manage them if needed. For now, since we only update periodically,
    // let's just keep it simple. Actually, we should probably recreate the series or lines.

    // To properly update OI lines, we might need to store them.
    // Given the complexity of clearing lines in v5 without tracking,
    // let's at least not recreate the whole chart.
  }, [oiData]);

  return (
    <div className="panel main-chart" data-testid="main-chart">
      <div className="panel-header">
        <div className="panel-title">INDEX CHART</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => window.open(`/chart?symbol=${symbol}`, '_blank')}
            style={{
                background: 'rgba(107, 70, 193, 0.2)',
                border: '1px solid rgba(107, 70, 193, 0.4)',
                borderRadius: '4px',
                padding: '0.2rem 0.4rem',
                color: '#e0e0e0',
                fontSize: '0.65rem',
                cursor: 'pointer'
            }}
          >
            POP OUT
          </button>
          <div style={{ fontSize: '0.75rem', color: '#a8a8b8' }}>
            <select
              value={interval}
              onChange={(e) => onIntervalChange(e.target.value)}
              style={{
                background: 'rgba(30, 30, 46, 0.8)',
                border: '1px solid rgba(107, 70, 193, 0.4)',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                color: '#e0e0e0',
                fontSize: '0.75rem',
              }}
              data-testid="chart-interval-selector"
            >
              {intervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="chart-container" ref={chartContainerRef} data-testid="chart-container">
        {candles.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a8a8b8' }}>
            Loading chart data...
          </div>
        )}
      </div>
    </div>
  );
};
