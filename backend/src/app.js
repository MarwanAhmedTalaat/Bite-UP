const express = require('express');
const morgan = require('morgan');
const routes = require('./routes/index.js');
const limiter = require('./core/middleware/rateLimit.js')
const GlobalError = require('./core/middleware/GlobalError.js');
const mongoose = require('mongoose');
const helmet = require('helmet');
require('dotenv').config();
const app = express();
const cors = require('cors');
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
const allowedOrigins = (process.env.CLIENT_ORIGINS).split(',').map(origin => origin.trim());
app.use(cors({
        origin: allowedOrigins
    }));

app.use('/health', (req, res,next) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;
    res.status(isDatabaseConnected ? 200 : 503).json({
        success: isDatabaseConnected,
        status: isDatabaseConnected ? 'healthy' : 'unavailable',
        database: isDatabaseConnected ? 'connected' : 'disconnected'
    });
});

app.use('/api', limiter, routes);
app.use((req,res,next)=>{
    res.status(404).json(
        {
        success : false,
        message: 'Route not found'
        })
    })
app.use(GlobalError);
    module.exports = app;


