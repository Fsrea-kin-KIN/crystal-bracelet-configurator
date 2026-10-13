@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required to reset the password.
  pause
  exit /b 1
)
node "%~dp0reset-admin-password.mjs"
echo.
pause
