
const app = require('./app');
const connectDB = require('./config/database.js');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 9000;

let server;
let isShuttingDown = false;

const startServer = async () => {
    try {
        await connectDB();

        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exitCode = 1;
    }
};

const shutdown = (signal) => {
    if (isShuttingDown) return;

    isShuttingDown = true;
    console.log(`${signal} received. Shutting down gracefully...`);

    if (!server) {
        mongoose.disconnect();
        return;
    }

    server.close(async (error) => {
        if (error) {
            console.error('Error closing HTTP server:', error);
            process.exitCode = 1;
        } else {
            console.log('HTTP server closed');
        }

        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } catch (err) {
            console.error('Error closing MongoDB connection:', err);
            process.exitCode = 1;
        }
    });
};

if (require.main === module) {
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    startServer();
}

module.exports = { startServer, shutdown };
