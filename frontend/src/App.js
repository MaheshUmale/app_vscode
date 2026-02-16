import React, { useState, useEffect, useCallback } from 'react';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [symbol, setSymbol] = useState('NIFTY');
  const [interval, setInterval] = useState('1');
  const [livePrice, setLivePrice] = useState(null);
  const [candles, setCandles] = useState([]);
  const [oiData, setOiData] = useState(null);
  const [liquidityData, setLiquidityData] = useState([]);
  const [positions, setPositions] = useState([]);
  const [account, setAccount] = useState(null);

  // WebSocket connection
  const { lastMessage, sendMessage } = useWebSocket(
    BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws'
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'live_tick') {
        setLivePrice(lastMessage);
      }
    }
  }, [lastMessage]);

  // Subscribe to symbols on WebSocket connect
  useEffect(() => {
    if (sendMessage) {
      sendMessage({
        type: 'subscribe',
        symbols: [symbol]
      });
    }
  }, [symbol, sendMessage]);

  // Fetch initial data
  useEffect(() => {
    fetchCandles();
    fetchOIData();
    fetchLiquidityData();
    fetchAccount();
    fetchPositions();

    const interval = setInterval(() => {
      fetchOIData();
      fetchLiquidityData();
      fetchPositions();
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  const fetchCandles = async () => {
    try {
      const response = await fetch(`${API}/market/candles?symbol=${symbol}&interval=${interval}&n_bars=100`);
      const data = await response.json();
      setCandles(data.candles || []);
    } catch (error) {
      console.error('Error fetching candles:', error);
    }
  };

  const fetchOIData = async () => {
    try {
      const response = await fetch(`${API}/market/oi-data?symbol=${symbol}`);
      const data = await response.json();
      setOiData(data);
    } catch (error) {
      console.error('Error fetching OI data:', error);
    }
  };

  const fetchLiquidityData = async () => {
    try {
      const response = await fetch(`${API}/market/liquidity`);
      const data = await response.json();
      setLiquidityData(data);
    } catch (error) {
      console.error('Error fetching liquidity data:', error);
    }
  };

  const fetchAccount = async () => {
    try {
      const response = await fetch(`${API}/account`);
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Error fetching account:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API}/positions`);
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

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
      } else {
        return { success: false, message: data.message };
      }
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
        
        <div className="dashboard-grid">
          <AnalyticsPanel 
            oiData={oiData}
            symbol={symbol}
          />
          
          <MainChart 
            candles={candles}
            symbol={symbol}
            interval={interval}
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
