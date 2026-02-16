# Trading Dashboard

A comprehensive trading dashboard built with React and Python, featuring real-time charts powered by `lightweight-charts` v5.1.0, Volume Footprint, and CVD panels.

## Features
-   **Main Chart:** Candlestick visualization with **OI Profile** integration.
-   **Volume Footprint:** Detailed buy/sell volume at each price level, POC (Point of Control), and Value Area. Available on 5m timeframe and above.
-   **CVD Panel:** Cumulative Volume Delta analysis.
-   **Pop-out Feature:** Open a dedicated view of Candlestick + Footprint + CVD in a new tab.
-   **Real Data Integration:** Supports TradingView (via scraper) and Trendlyne/NSE APIs.
-   **SQLite Backend:** Uses SQLite for local storage of accounts and positions.

## Prerequisites
-   Node.js (v18+)
-   Python (v3.12+)

## Installation

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
```

### 2. Frontend
```bash
cd frontend
npm install
```

## Running the Application

### On Windows
Simply run the `run.bat` file in the root directory:
```cmd
run.bat
```

### On Linux/macOS
1.  **Start the Backend:**
    ```bash
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

## Pop-out View
You can open a specific chart view by navigating to:
`http://localhost:3000/chart?symbol=NIFTY`

## Real Data Integration
To transition from mock data to real market data:
1. Set `USE_MOCK_DATA=false` in your environment.
2. Refer to `LIVE_DATA_INTEGRATION.md` for more details on API configurations.

## Screenshots
A sample screenshot of the running dashboard is available as `dashboard_screenshot.png`.
