import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export const OptionsChart = ({ candles, symbol }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6b46c1',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#6b46c1',
          width: 1,
          style: 3,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(107, 70, 193, 0.3)',
      },
      rightPriceScale: {
        borderColor: 'rgba(107, 70, 193, 0.3)',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
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
    if (candlestickSeriesRef.current && candles.length > 0) {
      candlestickSeriesRef.current.setData(candles);
    }
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
      <div className="chart-container" ref={chartContainerRef} data-testid="options-chart-container"></div>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a8a8b8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Session Vwap 22 190</span>
          <span style={{ color: '#22c55e' }}>80.00</span>
        </div>
      </div>
    </div>
  );
};
