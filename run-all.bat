@echo off
cd /d "%~dp0"
echo ============================================
echo  SkyFlow Pro - Starting Backend + Frontend
echo ============================================
echo.
echo [1/2] Starting backend on http://localhost:8081 ...
start "SkyFlow Backend" cmd /k "cd /d %~dp0backend-server && mvnw.cmd spring-boot:run"
echo.
echo Waiting for backend to be ready (about 25 seconds)...
timeout /t 25 /nobreak > nul
echo.
echo [2/2] Starting frontend on http://localhost:5173 ...
cd /d "%~dp0skyflow-pro"
call npm run dev
