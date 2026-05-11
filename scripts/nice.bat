@echo off
setlocal EnableDelayedExpansion
title nice - localhost:3030

REM === Standalone launcher ===
REM Copy this file anywhere (Desktop, Start menu, etc.). On first run it asks
REM where the repo is and remembers it. Double-click after that to launch.

set "CONFIG_DIR=%APPDATA%\nice"
set "CONFIG_FILE=%CONFIG_DIR%\repo-path.txt"

REM Try repo path next to this .bat first (works if launcher lives inside the repo)
set "REPO="
if exist "%~dp0..\package.json" set "REPO=%~dp0.."
if exist "%~dp0package.json" set "REPO=%~dp0"

REM Otherwise read saved path
if "!REPO!"=="" if exist "%CONFIG_FILE%" set /p REPO=<"%CONFIG_FILE%"

REM Otherwise ask the user
if "!REPO!"=="" goto ask_path
if not exist "!REPO!\package.json" goto ask_path
goto run

:ask_path
echo.
echo === First-time setup ===
echo Where is the "nice" repo folder on your computer?
echo (the folder that contains package.json - e.g. C:\Users\You\code\nice)
echo.
set /p REPO=Path:
REM Strip surrounding quotes if pasted
set "REPO=!REPO:"=!"
if not exist "!REPO!\package.json" (
  echo.
  echo [ERROR] No package.json found at "!REPO!".
  echo Make sure you point to the repo folder itself.
  echo.
  pause
  exit /b 1
)
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"
>"%CONFIG_FILE%" echo !REPO!
echo Saved. You won't be asked again.
echo.

:run
cd /d "!REPO!"
echo === nice ===
echo Repo: !REPO!
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not on your PATH.
  echo Install Node 22 from https://nodejs.org and re-run this shortcut.
  echo.
  pause
  exit /b 1
)

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

if not exist ".env.local" (
  echo [WARN] .env.local not found.
  echo Copy .env.example to .env.local and set ANTHROPIC_API_KEY,
  echo otherwise Chat and Lenses will fail.
  echo.
  timeout /t 4 >nul
)

REM Open the browser after a short delay
start "" /b cmd /c "timeout /t 4 >nul && start http://localhost:3030"

echo Starting dev server on http://localhost:3030
echo Press Ctrl+C in this window to stop.
echo.

call npm run dev

echo.
echo === Server stopped ===
pause
