@echo off
echo Starting Trading Dashboard...

:: Start Backend
start cmd /k "echo Starting Backend... && cd backend && set USE_MOCK_DATA=true && python server.py"

:: Start Frontend
start cmd /k "echo Starting Frontend... && cd frontend && npm start"

echo Dashboard is starting. Please wait for the browser to open at http://localhost:3001
