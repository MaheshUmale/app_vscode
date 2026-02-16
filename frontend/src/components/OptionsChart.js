import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

export const OptionsChart = ({ candles, symbol }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

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

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
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
  }, [candles]);

  return (
    <div className="panel options-chart" data-testid="options-chart">
      <div className="panel-header">
        <div className="panel-title">OPTIONS CHART</div>
        <div style={{ fontSize: '0.75rem', color: '#a8a8b8' }}>
          <span style={{ marginRight: '1rem', color: '#ef4444' }}>Bearish OB</span>
          <span style={{ color: '#22c55e' }}>Bullish OB</span>
        </div>
      </div>
      <div className="chart-container" ref={chartContainerRef} data-testid="options-chart-container">
        {candles.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a8a8b8' }}>
            Loading chart data...
          </div>
        )}
      </div>
    </div>
  );
};
