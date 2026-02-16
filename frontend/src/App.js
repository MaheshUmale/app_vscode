import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import '@/App.css';
import { TopBar } from './components/TopBar';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { MainChart } from './components/MainChart';
import { VolumeFootprintChart } from './components/VolumeFootprintChart';
import { OptionsChart } from './components/OptionsChart';
import { OIChangePanel } from './components/OIChangePanel';
import { CVDPanel } from './components/CVDPanel';
import { PopoutChart } from './components/PopoutChart';
import { useWebSocket } from './hooks/useWebSocket';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chart" element={<PopoutChart />} />
    </Routes>
  );
}

function Dashboard() {
  const [symbol, setSymbol] = useState('NIFTY');
  const [interval, setIntervalValue] = useState('1');
  const [livePrice, setLivePrice] = useState(null);
  const [candles, setCandles] = useState([]);
  const [oiData, setOiData] = useState(null);
  const [account, setAccount] = useState(null);

  const websocketUrl = useMemo(
    () => BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws',
    []
  );

  const marketRegime = useMemo(() => {
    const pcr = oiData?.pcr ?? 0.85;
    if (pcr < 0.8) return { label: 'Risk-Off Bearish', tone: 'negative' };
    if (pcr > 1.1) return { label: 'Risk-On Bullish', tone: 'positive' };
    return { label: 'Balanced / Range', tone: 'neutral' };
  }, [oiData]);

  const { lastMessage, sendMessage, readyState } = useWebSocket(websocketUrl);

  const fetchCandles = useCallback(async () => {
    try {
      const response = await fetch(`${API}/market/candles?symbol=${symbol}&interval=${interval}&n_bars=100`);
      const data = await response.json();
      setCandles(data.candles || []);
    } catch (error) {
      console.error('Error fetching candles:', error);
    }
  }, [interval, symbol]);

  const fetchOIData = useCallback(async () => {
    try {
      const response = await fetch(`${API}/market/oi-data?symbol=${symbol}`);
      const data = await response.json();
      setOiData(data);
    } catch (error) {
      console.error('Error fetching OI data:', error);
    }
  }, [symbol]);

  const fetchAccount = useCallback(async () => {
    try {
      const response = await fetch(`${API}/account`);
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Error fetching account:', error);
    }
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'live_tick') {
      setLivePrice(lastMessage);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === 1) {
      sendMessage({
        type: 'subscribe',
        symbols: [symbol]
      });
    }
  }, [readyState, sendMessage, symbol]);

  useEffect(() => {
    fetchCandles();
    fetchOIData();
    fetchAccount();

    const refreshTimer = setInterval(() => {
      fetchCandles();
      fetchOIData();
    }, 5000);

    return () => clearInterval(refreshTimer);
  }, [fetchAccount, fetchCandles, fetchOIData]);

  return (
    <div className="App">
      <div className="dashboard">
        <TopBar
          symbol={symbol}
          livePrice={livePrice}
          account={account}
          onSymbolChange={setSymbol}
        />

        <div className="market-pulse-row" data-testid="market-pulse-row">
          <div className="pulse-chip">
            <span className="pulse-label">Feed</span>
            <span className="pulse-value">{readyState === 1 ? 'Live WSS' : 'Polling Backup'}</span>
          </div>
          <div className={`pulse-chip ${marketRegime.tone}`}>
            <span className="pulse-label">Regime</span>
            <span className="pulse-value">{marketRegime.label}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <AnalyticsPanel
            oiData={oiData}
            symbol={symbol}
          />

          <MainChart
            candles={candles}
            symbol={symbol}
            interval={interval}
            oiData={oiData}
            onIntervalChange={setIntervalValue}
          />

          <VolumeFootprintChart
            candles={candles}
            interval={interval}
          />

          <OptionsChart
            candles={candles}
            symbol={symbol}
          />

          <OIChangePanel
            oiData={oiData}
          />

          <CVDPanel
            candles={candles}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
