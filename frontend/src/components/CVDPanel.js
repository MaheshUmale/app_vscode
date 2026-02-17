import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export const CVDPanel = ({ candles }) => {
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
      color: '#22c55e',
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
      let cumulative = 0;
      const cvdData = candles.map(candle => {
        const delta = candle.close > candle.open ? candle.volume : -candle.volume;
        cumulative += delta;
        return {
          time: candle.time,
          value: cumulative,
          color: delta > 0 ? '#22c55e' : '#ef4444',
        };
      });
      seriesRef.current.setData(cvdData);
    }
  }, [candles]);

  return (
    <div className="panel cvd-panel" data-testid="cvd-panel">
      <div className="panel-header">
        <div className="panel-title">CUMULATIVE VOLUME DELTA (CVD)</div>
      </div>
      <div className="chart-container" ref={chartContainerRef} data-testid="cvd-chart-container">
        {candles.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a8a8b8' }}>
            Loading chart data...
          </div>
        )}
      </div>
    </div>
  );
};
