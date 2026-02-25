@echo off
REM Quick start script for Video Call Feature (Windows)

echo.
echo ==========================================
echo    React Native Video Call Setup
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.❌ Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed:
node --version
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install socket.io-client react-native-webrtc
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend packages
    pause
    exit /b 1
)
echo ✅ Frontend packages installed
echo.

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server packages
    pause
    exit /b 1
)
cd ..
echo ✅ Server packages installed
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)

:found_ip
setlocal enabledelayedexpansion
set LOCAL_IP=!LOCAL_IP:~1!
set LOCAL_IP=!LOCAL_IP: =!

echo ==========================================
echo    NEXT STEPS
echo ==========================================
echo.
echo 1. UPDATE SERVER IP IN App.js
echo    Open: App.js (line ~151)
echo    Find: const serverURL = 'http://10.1.5.104:3000';
echo    Replace with: const serverURL = 'http://!LOCAL_IP!:3000';
echo.
echo 2. START THE SIGNALING SERVER
echo    Run: cd server ^&^& npm start
echo    Note the server IP displayed in console
echo.
echo 3. RUN THE APP ON YOUR PHONES
echo    Terminal 1 (Server): cd server ^&^& npm start
echo    Terminal 2 (App): npx react-native run-android
echo.
echo 4. TEST VIDEO CALLING
echo    - Open CommentScreen on both phones
echo    - Click 'Start Video Call'
echo    - Select user and initiate call
echo    - Accept on the other device
echo.
echo ==========================================
echo.
echo For detailed setup instructions, see: VIDEO_CALL_SETUP.md
echo.
pause
