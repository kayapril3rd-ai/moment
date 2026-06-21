@echo off
cd /d "%~dp0"

echo Starting Lumen Che companion dev server...

where npm >nul 2>nul
if %errorlevel%==0 (
  start "lumen-vite" /min npm run dev -- --host 127.0.0.1 --port 5173
  goto open_app
)

set "NODE_EXE=node"
where node >nul 2>nul
if not %errorlevel%==0 (
  set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Missing local dependencies. Please install dependencies first.
  pause
  exit /b 1
)

start "lumen-vite" /min "%NODE_EXE%" "%~dp0node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173

:open_app
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5173/"
