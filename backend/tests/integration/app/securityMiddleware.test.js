
const request = require('supertest');
const app = require('../../../src/app');

describe('Security Middleware Integration', () => {
    describe('Helmet', () => {
        it('should include security headers in responses', async () => {
            const response = await request(app).get('/health');

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
            expect(response.headers['content-security-policy']).toBeDefined();
        });
    });

    describe('CORS', () => {
        it('should allow requests from configured origins', async () => {
            const response = await request(app)
                .get('/health')
                .set('Origin', 'http://localhost:5173');

            expect(response.headers['access-control-allow-origin'])
                .toBe('http://localhost:5173');
        });

        it('should not allow unconfigured origins', async () => {
            const response = await request(app)
                .get('/health')
                .set('Origin', 'http://untrusted.example');

            expect(response.headers['access-control-allow-origin'])
                .toBeUndefined();
        });
    });
});
