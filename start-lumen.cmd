@echo off
cd /d "%~dp0"

echo Starting Lumen Che companion dev server...
start "lumen-vite" /min "D:\New Folder\npm.cmd" run dev -- --host 127.0.0.1

timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5173/"
