import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '@/App.css';
import { TopBar } from './components/TopBar';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { MainChart } from './components/MainChart';
import { ExecutionPanel } from './components/ExecutionPanel';
import { OptionsChart } from './components/OptionsChart';
import { OrderPanel } from './components/OrderPanel';
import { OIChangePanel } from './components/OIChangePanel';
import { CVDPanel } from './components/CVDPanel';
import { PositionsPanel } from './components/PositionsPanel';
import { useWebSocket } from './hooks/useWebSocket';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

function App() {
  const [symbol, setSymbol] = useState('NIFTY');
  const [interval, setIntervalValue] = useState('1');
  const [livePrice, setLivePrice] = useState(null);
  const [candles, setCandles] = useState([]);
  const [oiData, setOiData] = useState(null);
  const [liquidityData, setLiquidityData] = useState([]);
  const [positions, setPositions] = useState([]);
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

  const netExposure = useMemo(() => {
    if (!positions.length) return 0;
    return positions.reduce((acc, pos) => acc + (pos.quantity || 0) * (pos.current_price || 0), 0);
  }, [positions]);

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

  const fetchLiquidityData = useCallback(async () => {
    try {
      const response = await fetch(`${API}/market/liquidity`);
      const data = await response.json();
      setLiquidityData(data);
    } catch (error) {
      console.error('Error fetching liquidity data:', error);
    }
  }, []);

  const fetchAccount = useCallback(async () => {
    try {
      const response = await fetch(`${API}/account`);
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Error fetching account:', error);
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch(`${API}/positions`);
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error('Error fetching positions:', error);
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
    fetchLiquidityData();
    fetchAccount();
    fetchPositions();

    const refreshTimer = setInterval(() => {
      fetchCandles();
      fetchOIData();
      fetchLiquidityData();
      fetchPositions();
    }, 5000);

    return () => clearInterval(refreshTimer);
  }, [fetchAccount, fetchCandles, fetchLiquidityData, fetchOIData, fetchPositions]);

  const handlePlaceOrder = async (order) => {
    try {
      const response = await fetch(`${API}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      const data = await response.json();

      if (data.status === 'success') {
        await fetchAccount();
        await fetchPositions();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error placing order:', error);
      return { success: false, message: 'Order failed' };
    }
  };

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
          <div className="pulse-chip">
            <span className="pulse-label">Open Positions</span>
            <span className="pulse-value">{positions.length}</span>
          </div>
          <div className="pulse-chip">
            <span className="pulse-label">Net Exposure</span>
            <span className="pulse-value">₹{netExposure.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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
            onIntervalChange={setIntervalValue}
          />

          <ExecutionPanel
            liquidityData={liquidityData}
          />

          <OptionsChart
            candles={candles}
            symbol={symbol}
          />

          <OrderPanel
            symbol={symbol}
            oiData={oiData}
            onPlaceOrder={handlePlaceOrder}
          />

          <OIChangePanel
            oiData={oiData}
          />

          <CVDPanel
            candles={candles}
          />

          <PositionsPanel
            positions={positions}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
