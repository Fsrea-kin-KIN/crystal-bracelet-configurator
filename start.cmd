@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required to run this tool.
  pause
  exit /b 1
)
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4181/api/catalog' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } }; exit 1" >nul 2>&1
if errorlevel 1 (
  start "Bracelet Tool" /min node "%~dp0server.mjs"
  timeout /t 3 /nobreak >nul
)
start "" "http://127.0.0.1:4181/"
exit /b 0
