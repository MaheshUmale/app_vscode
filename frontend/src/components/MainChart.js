import React, { useEffect, useRef } from 'react';

const intervalOptions = [
  { value: '1', label: '1 minute' },
  { value: '5', label: '5 minute' },
  { value: '15', label: '15 minute' },
  { value: '60', label: '1 hour' },
];

export const MainChart = ({ candles, interval, onIntervalChange }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    let chart;
    let removeResizeListener;

    import('lightweight-charts').then(({ createChart, ColorType }) => {
      if (!chartContainerRef.current) return;

      chart = createChart(chartContainerRef.current, {
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

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      candlestickSeries.setData(candles);

      const handleResize = () => {
        if (chart && chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener('resize', handleResize);
      removeResizeListener = () => window.removeEventListener('resize', handleResize);
    }).catch((err) => {
      console.error('Error loading chart:', err);
    });

    return () => {
      if (removeResizeListener) {
        removeResizeListener();
      }
      if (chart) {
        chart.remove();
      }
    };
  }, [candles]);

  return (
    <div className="panel main-chart" data-testid="main-chart">
      <div className="panel-header">
        <div className="panel-title">INDEX CHART</div>
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
