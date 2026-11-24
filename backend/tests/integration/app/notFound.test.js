
const request = require('supertest');
const app = require('../../../src/app');

describe('Not Found Handler', () => {
    it('should return 404 for an unknown route', async () => {
        const response = await request(app).get('/unknown-route');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: 'Route not found'
        });
    });

    it('should return 404 for an unknown API endpoint', async () => {
        const response = await request(app).get('/api/unknown-endpoint');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: 'Route not found'
        });
    });
});
