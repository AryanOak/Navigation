#!/bin/bash
# Quick start script for Video Call Feature

echo "=========================================="
echo "   React Native Video Call Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install socket.io-client react-native-webrtc
echo "✅ Frontend packages installed"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..
echo "✅ Server packages installed"
echo ""

# Get the local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows (if running in Git Bash or WSL)
    LOCAL_IP="192.168.1.XXX"
fi

echo "=========================================="
echo "   NEXT STEPS"
echo "=========================================="
echo ""
echo "1. UPDATE SERVER IP IN App.js"
echo "   Open: App.js (line ~151)"
echo "   Find: const serverURL = 'http://10.1.5.104:3000';"
if [ -z "$LOCAL_IP" ]; then
    echo "   Replace with: const serverURL = 'http://<YOUR_LAPTOP_IP>:3000';"
else
    echo "   Replace with: const serverURL = 'http://$LOCAL_IP:3000';"
fi
echo ""
echo "2. START THE SIGNALING SERVER"
echo "   Run: cd server && npm start"
echo "   Note the server IP displayed in console"
echo ""
echo "3. RUN THE APP ON YOUR PHONES"
echo "   Terminal 1 (Server): cd server && npm start"
echo "   Terminal 2 (App): npx react-native run-android"
echo ""
echo "4. TEST VIDEO CALLING"
echo "   - Open CommentScreen on both phones"
echo "   - Click 'Start Video Call'"
echo "   - Select user and initiate call"
echo "   - Accept on the other device"
echo ""
echo "=========================================="
echo ""
echo "For detailed setup instructions, see: VIDEO_CALL_SETUP.md"
