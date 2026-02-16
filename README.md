# Trading Dashboard

A comprehensive trading dashboard built with React and Python, featuring real-time charts powered by `lightweight-charts` v5.1.0.

## Overview
This application provides a visual interface for monitoring market data, options, and Cumulative Volume Delta (CVD) panels. It supports both live data (via MongoDB and NSE API) and a standalone "Mock Mode" for testing and development.

## Features
-   **Main Chart:** Candlestick and volume visualization.
-   **Options Chart:** Call/Put open interest tracking.
-   **CVD Panel:** Cumulative Volume Delta analysis.
-   **Mock Mode:** Runs without external database or API dependencies.

## Frontend Migration (v5.1.0)
The frontend has been migrated to `lightweight-charts` v5.1.0, incorporating:
-   Updated series creation API (`addSeries`).
-   Refined initialization patterns for better stability.
-   Pinned `ajv` to `8.17.1` for dependency resolution.

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)

### Installation
1.  **Frontend:**
    ```bash
    cd frontend
    npm install
    ```
2.  **Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

### Running in Mock Mode (Recommended for testing)
To run the application without a live MongoDB instance or NSE API credentials:

1.  **Start the Backend:**
    ```bash
    export USE_MOCK_DB=true
    export USE_MOCK_DATA=true
    cd backend
    python server.py
    ```
2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm start
    ```
    The dashboard will be available at `http://localhost:3000`.

## Testing
To verify the application setup and rendering:
```bash
npx playwright test tests/e2e/final_verify.js
```
This script checks for the successful rendering of all charting components.

## Real Data Integration
To transition from mock data to real live market data, see the [Live Data Integration Guide](LIVE_DATA_INTEGRATION.md).

It covers integration with:
- **TradingView (OHLCV):** via `tvDatafeed` and `tv_live_wss`.
- **Trendlyne (OI/PCR):** via `trendlyne_api`.

## Screenshots
A sample screenshot of the running dashboard in mock mode is available as `dashboard_screenshot.png`.
