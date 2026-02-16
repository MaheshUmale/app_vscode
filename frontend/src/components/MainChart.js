import React, { useEffect, useRef } from 'react';

export const MainChart = ({ candles, symbol, interval }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Dynamically import lightweight-charts
    import('lightweight-charts').then(({ createChart, ColorType }) => {
      const chart = createChart(chartContainerRef.current, {
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
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }).catch(err => {
      console.error('Error loading chart:', err);
    });
  }, [candles]);

  return (
    <div className="panel main-chart" data-testid="main-chart">
      <div className="panel-header">
        <div className="panel-title">INDEX (Underly/lya) CHART</div>
        <div style={{ fontSize: '0.75rem', color: '#a8a8b8' }}>
          <select
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
            <option>1 minute</option>
            <option>5 minute</option>
            <option>15 minute</option>
            <option>1 hour</option>
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
