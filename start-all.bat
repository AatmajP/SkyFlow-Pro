@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo ========================================
echo   SkyFlow - Backend + Frontend Launcher
echo ========================================
echo.
echo Backend:  http://localhost:8081
echo Frontend: http://localhost:5173
echo.

REM Ensure frontend dependencies are installed
if not exist "%ROOT%skyflow-pro\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%ROOT%skyflow-pro"
    call npm install
    cd /d "%ROOT%"
)

REM Start backend in a new window
echo [1/2] Starting backend...
start "SkyFlow Backend" cmd /k "cd /d %~dp0backend-server && mvnw.cmd spring-boot:run"

REM Wait for backend to initialize
echo Waiting for backend to start (~25 sec)...
timeout /t 25 /nobreak > nul

REM Start frontend in a new window
echo [2/2] Starting frontend...
start "SkyFlow Frontend" cmd /k "cd /d %~dp0skyflow-pro && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   Backend:  http://localhost:8081
echo   Frontend: http://localhost:5173
echo.
echo   Open http://localhost:5173 in your browser
echo ========================================
echo.
echo Press any key to close this window...
echo (Backend and frontend will keep running in separate windows)
pause > nul
