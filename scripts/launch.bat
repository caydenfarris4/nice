@echo off
setlocal
title nice - localhost:3030

REM Always run from the repo root, regardless of where the shortcut lives.
cd /d "%~dp0\.."

echo.
echo === nice ===
echo Working dir: %CD%
echo.

REM Sanity check: node + npm
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not on your PATH.
  echo Install Node 22 from https://nodejs.org and re-run this shortcut.
  echo.
  pause
  exit /b 1
)

REM First-run: install deps if node_modules is missing
if not exist "node_modules" (
  echo node_modules not found - running "npm install" once...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. See output above.
    pause
    exit /b 1
  )
)

REM Warn if env file is missing - the chat / lenses need ANTHROPIC_API_KEY
if not exist ".env.local" (
  echo [WARN] .env.local not found.
  echo Copy .env.example to .env.local and set ANTHROPIC_API_KEY,
  echo otherwise Chat and Lenses will fail.
  echo.
  timeout /t 4 >nul
)

REM Open the browser after a short delay (server takes a few seconds to boot).
start "" /b cmd /c "timeout /t 4 >nul && start http://localhost:3030"

echo Starting dev server on http://localhost:3030
echo Press Ctrl+C in this window to stop.
echo.

call npm run dev

REM If npm run dev exits (error or Ctrl+C), keep the window open so you can read it.
echo.
echo === Server stopped ===
pause
