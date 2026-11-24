
jest.mock('../../../src/app', () => ({
    listen: jest.fn()
}));

jest.mock('../../../src/config/database.js', () => jest.fn());

jest.mock('mongoose', () => ({
    disconnect: jest.fn(),
    connection: {
        close: jest.fn()
    }
}));

const loadServer = () => {
    jest.resetModules();

    return {
        app: require('../../../src/app'),
        connectDB: require('../../../src/config/database.js'),
        mongoose: require('mongoose'),
        serverModule: require('../../../src/server')
    };
};

describe('Server Lifecycle', () => {
    let originalExitCode;
    let logSpy;
    let errorSpy;

    beforeEach(() => {
        originalExitCode = process.exitCode;

        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.exitCode = originalExitCode;

        jest.restoreAllMocks();
    });

    it('should connect to database before starting the server', async () => {
        const { app, connectDB, serverModule } = loadServer();

        connectDB.mockResolvedValue();
        app.listen.mockReturnValue({});

        await serverModule.startServer();

        expect(connectDB).toHaveBeenCalledTimes(1);
        expect(app.listen).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Function)
        );
    });

    it('should not start the server when database connection fails', async () => {
        const { app, connectDB, serverModule } = loadServer();

        connectDB.mockRejectedValue(new Error('Database connection failed'));

        await serverModule.startServer();

        expect(app.listen).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it('should close HTTP server and MongoDB connection during shutdown', async () => {
        const { app, connectDB, mongoose, serverModule } = loadServer();

        const mockServer = {
            close: jest.fn(callback => callback(null))
        };

        connectDB.mockResolvedValue();
        app.listen.mockReturnValue(mockServer);
        mongoose.connection.close.mockResolvedValue();

        await serverModule.startServer();
        serverModule.shutdown('SIGTERM');

        expect(mockServer.close).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setImmediate(resolve));

        expect(mongoose.connection.close).toHaveBeenCalledTimes(1);
    });

    it('should not execute shutdown more than once', async () => {
        const { app, connectDB, mongoose, serverModule } = loadServer();

        const mockServer = {
            close: jest.fn(callback => callback(null))
        };

        connectDB.mockResolvedValue();
        app.listen.mockReturnValue(mockServer);
        mongoose.connection.close.mockResolvedValue();

        await serverModule.startServer();

        serverModule.shutdown('SIGTERM');
        serverModule.shutdown('SIGINT');

        expect(mockServer.close).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setImmediate(resolve));

        expect(mongoose.connection.close).toHaveBeenCalledTimes(1);
    });

    it('should log when the HTTP server starts listening', async () => {
        const { app, connectDB, serverModule } = loadServer();

        connectDB.mockResolvedValue();
        app.listen.mockReturnValue({});

        await serverModule.startServer();

        const listenCallback = app.listen.mock.calls[0][1];
        listenCallback();

        expect(logSpy).toHaveBeenCalledWith(
            `Server is running on port ${process.env.PORT || 9000}`
        );
    });

    it('should handle HTTP server closing failure', async () => {
        const { app, connectDB, mongoose, serverModule } = loadServer();

        const closeError = new Error('HTTP server closing failed');

        const mockServer = {
            close: jest.fn(callback => callback(closeError))
        };

        connectDB.mockResolvedValue();
        app.listen.mockReturnValue(mockServer);
        mongoose.connection.close.mockResolvedValue();

        await serverModule.startServer();
        serverModule.shutdown('SIGTERM');

        await new Promise(resolve => setImmediate(resolve));

        expect(errorSpy).toHaveBeenCalledWith(
            'Error closing HTTP server:',
            closeError
        );
        expect(process.exitCode).toBe(1);
        expect(mongoose.connection.close).toHaveBeenCalledTimes(1);
    });

    it('should handle MongoDB connection closing failure', async () => {
        const { app, connectDB, mongoose, serverModule } = loadServer();

        const closeError = new Error('MongoDB closing failed');

        const mockServer = {
            close: jest.fn(callback => callback(null))
        };

        connectDB.mockResolvedValue();
        app.listen.mockReturnValue(mockServer);
        mongoose.connection.close.mockRejectedValue(closeError);

        await serverModule.startServer();
        serverModule.shutdown('SIGTERM');

        await new Promise(resolve => setImmediate(resolve));

        expect(errorSpy).toHaveBeenCalledWith(
            'Error closing MongoDB connection:',
            closeError
        );
        expect(process.exitCode).toBe(1);
    });


    it('should disconnect MongoDB when shutdown happens before server starts', () => {
        const { mongoose, serverModule } = loadServer();

        serverModule.shutdown('SIGTERM');

        expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
    });
});
