const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const emailRoutes = require('./routes/email.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();
const server = http.createServer(app);
require('./services/socket.service')(server);


// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Use your routes
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);
app.use('/api', apiRoutes);


server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});


