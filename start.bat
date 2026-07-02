@echo off
echo Starting CryptoTrade Pro...
echo.

echo Starting server on port 3001...
start "Server" cmd /c "cd /d "%~dp0server" && node index.js"

timeout /t 2 /nobreak >nul

echo Starting client on port 5173...
start "Client" cmd /c "cd /d "%~dp0client" && npx vite --host"

echo.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Close the windows to stop the servers.
pause
