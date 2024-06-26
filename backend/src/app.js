const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const emailRoutes = require('./routes/email.routes');
const apiRoutes = require('./routes/api.routes');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to attach WebSocketServer instance to request
app.use((req, res, next) => {
    req.wss = wss;
    next();
});

// Use your routes
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);
app.use('/api', apiRoutes);


server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});


// Open websockets connection with client
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

module.exports = wss;