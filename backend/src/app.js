const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const emailRoutes = require('./routes/email.routes');
const apiRoutes = require('./routes/api.routes');

const { client, checkConnection } = require('./services/elasticSearch.service');

require('./services/crone.service')(client, checkConnection);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Use your routes
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);
app.use('/api', apiRoutes);


app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});

