const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store active users
const users = new Map();

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Priority list for adapter names
  const priorityAdapters = ['Wi-Fi', 'Ethernet', 'wlan', 'eth'];
  
  // First, try to find a priority adapter
  for (const priority of priorityAdapters) {
    for (const name of Object.keys(interfaces)) {
      if (name.toLowerCase().includes(priority.toLowerCase())) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('192.168.137')) {
            return iface.address;
          }
        }
      }
    }
  }
  
  // Fallback: get any non-virtual IPv4 address
  for (const name of Object.keys(interfaces)) {
    // Skip virtual adapters
    if (name.toLowerCase().includes('vethernet') || 
        name.toLowerCase().includes('docker') ||
        name.toLowerCase().includes('virtualbox') ||
        name.toLowerCase().includes('vmware')) {
      continue;
    }
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('192.168.137')) {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

const localIP = getLocalIP();
const PORT = 3000;

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user registers
  socket.on('register_user', (userData) => {
    users.set(socket.id, {
      id: socket.id,
      name: userData.name || 'Anonymous',
      socketId: socket.id,
    });
    
    console.log(`User registered: ${userData.name} (${socket.id})`);
    
    // Broadcast updated user list
    io.emit('users_list', Array.from(users.values()));
  });

  // When a user initiates a call
  socket.on('call_user', (data) => {
    if (!data?.targetUserId || !data?.offer) {
      socket.emit('call_error', { message: 'Invalid call request payload' });
      return;
    }

    const targetUser = users.get(data.targetUserId);
    
    if (targetUser) {
      io.to(data.targetUserId).emit('incoming_call', {
        from: socket.id,
        fromName: users.get(socket.id)?.name || 'Anonymous',
        offer: data.offer,
      });
      console.log(`Call from ${socket.id} to ${data.targetUserId}`);
    } else {
      socket.emit('call_error', { message: 'User not found' });
    }
  });

  // When a user accepts a call
  socket.on('accept_call', (data) => {
    if (!data?.to || !data?.answer) {
      socket.emit('call_error', { message: 'Invalid call answer payload' });
      return;
    }

    io.to(data.to).emit('call_accepted', {
      from: socket.id,
      answer: data.answer,
    });
    console.log(`Call accepted: ${socket.id} accepted from ${data.to}`);
  });

  // Send ICE candidate
  socket.on('ice_candidate', (data) => {
    if (!data?.to || !data?.candidate) {
      return;
    }

    io.to(data.to).emit('ice_candidate', {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  // Reject call
  socket.on('reject_call', (data) => {
    if (!data?.to) {
      return;
    }

    io.to(data.to).emit('call_rejected', {
      from: socket.id,
    });
    console.log(`Call rejected: ${socket.id} rejected call from ${data.to}`);
  });

  // End call
  socket.on('end_call', (data) => {
    if (!data?.to) {
      return;
    }

    io.to(data.to).emit('call_ended', {
      from: socket.id,
    });
    console.log(`Call ended: ${socket.id}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    users.delete(socket.id);
    io.emit('user_disconnected', socket.id);
    io.emit('users_list', Array.from(users.values()));
    console.log(`User disconnected: ${user?.name || 'Unknown'} (${socket.id})`);
  });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WebRTC Video Call Server</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; }
          .status { font-size: 18px; margin: 20px 0; }
          .info { background: #f0f0f0; padding: 20px; border-radius: 8px; }
          code { background: #e0e0e0; padding: 10px; display: block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>✓ WebRTC Signaling Server Running</h1>
        <div class="status">
          <p><strong>Server IP:</strong> <code>${localIP}</code></p>
          <p><strong>Port:</strong> <code>${PORT}</code></p>
          <p><strong>Status:</strong> <span style="color: green;">✓ Active</span></p>
        </div>
        <div class="info">
          <h3>Configure in your React Native app:</h3>
          <p>Socket.io Server URL: <code>http://${localIP}:${PORT}</code></p>
        </div>
      </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          WebRTC Signaling Server Started                   ║
╠════════════════════════════════════════════════════════════╣
║ Server IP:  ${localIP}${' '.repeat(42 - localIP.length)} ║
║ Port:       ${PORT}${' '.repeat(47)}  ║
║ Status:     ✓ Running${' '.repeat(43)}  ║
╠════════════════════════════════════════════════════════════╣
║ Connect from your phone:                                   ║
║ Socket: http://${localIP}:${PORT}${' '.repeat(30)} ║
╚════════════════════════════════════════════════════════════╝
  `);
});
