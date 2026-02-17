import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export const OptionsChart = ({ candles, symbol }) => {
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

    seriesRef.current = chartRef.current.addHistogramSeries({
      color: '#8f7cff',
      priceFormat: {
        type: 'volume',
      },
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
      if (chartRef.current) chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const data = candles.map(candle => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? 'rgba(57, 229, 140, 0.5)' : 'rgba(255, 91, 127, 0.5)',
      }));
      seriesRef.current.setData(data);
    }
  }, [candles]);

  return (
    <div className="panel options-chart" data-testid="options-chart">
      <div className="panel-header">
        <div className="panel-title">VOLUME ANALYSIS: {symbol}</div>
      </div>
      <div className="chart-container" ref={chartContainerRef} data-testid="options-chart-container">
        {candles.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a8a8b8' }}>
            Waiting for market data...
          </div>
        )}
      </div>
    </div>
  );
};
