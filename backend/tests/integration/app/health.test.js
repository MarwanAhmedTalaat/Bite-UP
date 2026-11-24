
const request = require('supertest');

jest.mock('mongoose', () => ({
    connection: {
        readyState: 0
    }
}));

const mongoose = require('mongoose');
const app = require('../../../src/app');

describe('Health Check API', () => {
    afterEach(() => {
        mongoose.connection.readyState = 0;
    });

    it('should return 200 when database is connected', async () => {
        mongoose.connection.readyState = 1;

        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            status: 'healthy',
            database: 'connected'
        });
    });

    it('should return 503 when database is disconnected', async () => {
        mongoose.connection.readyState = 0;

        const response = await request(app).get('/health');

        expect(response.status).toBe(503);
        expect(response.body).toEqual({
            success: false,
            status: 'unavailable',
            database: 'disconnected'
        });
    });
});
