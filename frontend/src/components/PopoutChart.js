import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainChart } from './MainChart';
import { VolumeFootprintChart } from './VolumeFootprintChart';
import { CVDPanel } from './CVDPanel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export const PopoutChart = () => {
    const [searchParams] = useSearchParams();
    const symbol = searchParams.get('symbol') || 'NIFTY';
    const [interval, setIntervalValue] = useState('5');
    const [candles, setCandles] = useState([]);
    const [oiData, setOiData] = useState(null);

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

    useEffect(() => {
        fetchCandles();
        fetchOIData();
        const timer = setInterval(() => {
            fetchCandles();
            fetchOIData();
        }, 5000);
        return () => clearInterval(timer);
    }, [fetchCandles, fetchOIData]);

    return (
        <div className="popout-view" style={{ padding: '10px', height: '100vh', display: 'flex', flexDirection: 'column', gap: '10px', background: '#05070f' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '10px', flex: '1' }}>
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
            </div>
            <div style={{ height: '300px' }}>
                <CVDPanel candles={candles} />
            </div>
        </div>
    );
};
