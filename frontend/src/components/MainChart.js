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

    console.log('MainChart: createChart');
    console.log('CandlestickSeries:', CandlestickSeries);

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

    if (chartRef.current.addSeries) {
        seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
    } else if (chartRef.current.addCandlestickSeries) {
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
    } else {
        console.error('MainChart: No addSeries or addCandlestickSeries found on chart object');
    }

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

  const oiLinesRef = useRef([]);

  useEffect(() => {
    if (!seriesRef.current || !oiData || !oiData.strikes) return;

    // Clear existing price lines
    oiLinesRef.current.forEach(line => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch (e) {
        // Line might have already been removed
      }
    });
    oiLinesRef.current = [];

    // Find top strikes by OI
    const sortedStrikes = [...oiData.strikes].sort((a, b) =>
      (b.ce_oi + b.pe_oi) - (a.ce_oi + a.pe_oi)
    ).slice(0, 5); // Show top 5 OI strikes

    sortedStrikes.forEach(strike => {
      const isCEHigher = strike.ce_oi > strike.pe_oi;
      const line = seriesRef.current.createPriceLine({
        price: strike.strike,
        color: isCEHigher ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `${isCEHigher ? 'CE' : 'PE'} OI: ${Math.round((isCEHigher ? strike.ce_oi : strike.pe_oi) / 1000)}k`,
      });
      oiLinesRef.current.push(line);
    });
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
