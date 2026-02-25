# Video Call Feature Setup Guide

## Overview
This guide walks you through setting up the two-person video calling feature using WebRTC + Socket.io.

## Prerequisites
- Two Android phones on the same WiFi network
- Node.js installed on your laptop/desktop (for the signaling server)
- React Native development environment set up

## Step 1: Install Required NPM Packages

### Frontend (React Native App)
Install the video call dependencies:

```bash
npm install socket.io-client react-native-webrtc
# or
yarn add socket.io-client react-native-webrtc
```

If you encounter issues with react-native-webrtc, you may need peer dependencies:
```bash
npm install --legacy-peer-deps
```

### Backend (Node.js Signaling Server)
Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

This installs:
- `socket.io` (4.5.4) - WebSocket communication for signaling
- `express` (4.18.2) - HTTP server for connection info endpoint

## Step 2: Start the Signaling Server

1. On your laptop/desktop, navigate to the server directory:
```bash
cd server
npm start
```

2. The server will output something like:
```
Server is running on port 3000
Server IP: 192.168.1.100
Navigate to http://192.168.1.100:3000 to see connection details
```

**Important:** Note the server IP address displayed (e.g., `192.168.1.100`)

## Step 3: Configure the App Server URL

1. Open [App.js](App.js#L151)
2. Find the `serverURL` constant:
```javascript
const serverURL = 'http://10.1.5.104:3000'; // UPDATE WITH YOUR SERVER IP
```

3. Replace `192.168.1.100` with the actual server IP from Step 2

4. Save the file

## Step 4: Android Permissions

The app requires camera and microphone permissions. These are handled automatically via runtime permission requests in `VideoCallModal.js`.

If you want to add them to AndroidManifest.xml for clarity:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

## Step 5: Run the App

1. On your first phone:
```bash
npx react-native run-android
# or with Expo
expo start
```

2. The app will launch and initialize video calling

3. Close and re-open the CommentScreen to refresh the users list

## Step 6: Test the Video Call

### Scenario: Two phones with video calling

1. **Phone 1 (User A):**
   - Open the app and navigate to Comment Screen
   - Click "Start Video Call"
   - Wait for server connection (should show "Connecting to server...")
   - Your name is auto-generated

2. **Phone 2 (User B):**
   - Open the app and navigate to Comment Screen
   - Click "Start Video Call"
   - You should see User A in the "Available Users" list

3. **Phone 2 Initiates Call:**
   - On Phone 2, tap User A from the users list
   - Phone 2 shows "Calling User A..."
   - Phone 1 receives incoming call notification: "User B is calling..."

4. **Phone 1 Accepts Call:**
   - On Phone 1, tap the green call accept button
   - Video streams are established
   - Both phones can see local and remote video

5. **During Call:**
   - Phone 1 local video appears in top-right corner (small window)
   - Phone 2 video appears fullscreen
   - Tap the red end-call button to disconnect

## Architecture Overview

### Frontend Components

**VideoCallModal** ([components/VideoCallModal.js](components/VideoCallModal.js))
- Main UI for video calling
- States:
  - `idle`: Show available users list
  - `calling`: Show "Calling..." with cancel button
  - `incoming`: Show incoming call notification with Accept/Reject buttons
  - `active`: Show video streams with call controls
- Features:
  - User name input
  - Available users list
  - RTCView components for video display
  - Call control buttons
  - Error display

**VideoCallContext** ([context/VideoCallContext.js](context/VideoCallContext.js))
- Manages WebRTC peer connections
- Socket.io client for signaling
- State management:
  - `callState`: current call phase
  - `localStream`: user's camera/mic stream
  - `remoteStream`: other user's video stream
  - `users`: list of available users
  - `isConnected`: server connection status
- Functions:
  - `initializeSocket(userName)`: Connect to server
  - `initiateCall(user)`: Start a call to another user
  - `acceptCall()`: Accept incoming call
  - `rejectCall()`: Reject incoming call
  - `endCall()`: Terminate active call

### Backend

**Signaling Server** ([server/server.js](server/server.js))
- Node.js + Express + Socket.io
- Listens on port 3000
- Handles:
  - User registration and list management
  - SDP offer/answer exchange
  - ICE candidate relaying
  - Call rejection and termination
  - Automatic local IP detection

**Socket Events:**
- `register_user`: Client registers with username
- `call_user`: Initiator sends offer
- `incoming_call`: Target receives offer
- `accept_call`: Target sends answer
- `ice_candidate`: Exchange ICE candidates for NAT traversal
- `call_rejected`: Target rejects call
- `call_ended`: Either party ends call

## WebRTC Flow

```
┌─────────────┐                    ┌─────────────┐
│  User A     │                    │  User B     │
│  (Caller)   │                    │ (Recipient) │
└──────┬──────┘                    └──────┬──────┘
       │                                   │
       │ 1. initiate_call (offer)         │
       │──────────────────────────────────>│
       │                                   │
       │             2. incoming_call      │
       │<──────────────────────────────────│
       │                                   │
       │             3. accept_call        │
       │                (answer)           │
       │<──────────────────────────────────│
       │                                   │
       │ 4. ice_candidate (User A)        │
       │──────────────────────────────────>│
       │                                   │
       │     5. ice_candidate (User B)     │
       │<──────────────────────────────────│
       │                                   │
       │ 6. WebRTC Connection Established │
       │<──────────────────────────────────>│
       │      (Peer-to-peer video)         │
       │                                   │
```

## Troubleshooting

### "Connecting to server..." stays indefinitely
- Check that the server IP in App.js matches the actual server IP
- Ensure both phones are on the same WiFi network
- Verify the server is running with `npm start` in the server directory
- Check server console for connection logs

### "No other users available"
- Ensure the other phone has the app open and has navigated to CommentScreen
- Check that both phones are using the same server URL
- Wait a moment and refresh by closing/reopening the video call modal

### Video not displaying
- Check that runtime permissions for camera/microphone were granted
- On Android, go to Settings > App Permissions > YourApp and enable Camera & Microphone
- Verify both phones have working cameras

### Call gets disconnected
- Check WiFi signal strength
- Ensure both phones stay connected to the same WiFi
- Check for firewall blocking port 3000 on your laptop

### Socket.io connection errors
- Verify server is running: Check terminal where you ran `npm start`
- Check server IP address is correct in App.js
- Restart the server if you see connection attempts failing
- Check if port 3000 is already in use: `netstat -an | grep 3000` (or `netstat -ab` on Windows)

## File Structure

```
Navigation/
├── App.js (VideoCallProvider wrapper)
├── server/
│   ├── package.json (Video call dependencies)
│   ├── server.js (Socket.io signaling server)
│   └── node_modules/ (dependencies)
├── components/
│   └── VideoCallModal.js (Video call UI)
├── context/
│   ├── VideoCallContext.js (WebRTC + Socket.io management)
│   ├── ThemeContext.js (Theme management)
│   └── AppLifecycleContext.js (App state management)
└── screens/
    ├── CommentScreen.js (Video call button)
    └── ... (other screens)
```

## Next Steps

1. Install packages: `npm install socket.io-client react-native-webrtc`
2. Start server: `cd server && npm install && npm start`
3. Update App.js with server IP
4. Run the app on two phones
5. Test video calling from CommentScreen

## Features Implemented

✅ **WebRTC Peer-to-Peer Video**
- Direct video/audio streaming between phones
- STUN servers for NAT traversal
- ICE candidate exchange

✅ **Socket.io Signaling**
- Server-mediated offer/answer exchange
- Real-time user list updates
- Call invitation system

✅ **Call Flow Management**
- Idle → Calling → Active → Ended states
- Incoming call notifications
- Accept/Reject/End call buttons

✅ **Error Handling**
- Connection error display
- Automatic reconnection attempts
- Permission request handling

✅ **Theme Integration**
- Dark/light mode support
- Dynamic color palette
- Consistent UI styling

## Security Notes

- The signaling server stores user IDs in memory (not persistent)
- No user authentication is implemented (for demo purposes)
- Camera/microphone access requires explicit user permission
- WebRTC connections are peer-to-peer (not routed through server)

For production:
- Add user authentication
- Implement token-based authorization
- Use TLS/SSL for secure connections
- Add rate limiting and abuse prevention
- Implement user data persistence securely

---

**Happy video calling! 🎥📱**
