
jest.mock('mongoose', () => ({
    connect: jest.fn()
}));

const mongoose = require('mongoose');
const connectDB = require('../../../src/config/database');

describe('Database Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should connect to MongoDB successfully', async () => {
        mongoose.connect.mockResolvedValueOnce();

        await expect(connectDB()).resolves.toBeUndefined();

        expect(mongoose.connect).toHaveBeenCalledWith(
            process.env.DATABASE_URL
        );

        expect(console.log).toHaveBeenCalledWith(
            'DataBase connected Successfully'
        );
    });

    it('should log and throw an error if connection fails', async () => {
        const error = new Error('Database connection failed');

        mongoose.connect.mockRejectedValueOnce(error);

        await expect(connectDB()).rejects.toBe(error);

        expect(console.error).toHaveBeenCalledWith(
            'Error connecting to MongoDB:',
            error
        );
    });
});
