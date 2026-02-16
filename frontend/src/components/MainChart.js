import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export const MainChart = ({ candles, symbol, interval }) => {
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
          <button
            style={{
              marginLeft: '0.5rem',
              background: 'transparent',
              border: '1px solid rgba(107, 70, 193, 0.4)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: '#e0e0e0',
              cursor: 'pointer',
            }}
            data-testid="chart-fullscreen-btn"
          >
            ⛶
          </button>
        </div>
      </div>
      <div className="chart-container" ref={chartContainerRef} data-testid="chart-container"></div>
    </div>
  );
};
