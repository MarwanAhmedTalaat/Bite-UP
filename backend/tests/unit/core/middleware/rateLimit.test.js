
const express = require('express');
const request = require('supertest');
const limiter = require('../../../../src/core/middleware/rateLimit');

describe('Rate Limit Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();

        app.use(limiter);

        app.get('/test', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Request successful'
            });
        });
    });

    it('should allow requests within the limit', async () => {
        const response = await request(app).get('/test');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: 'Request successful'
        });
    });

    it('should return rate limit headers', async () => {
        const response = await request(app).get('/test');

        expect(response.headers['ratelimit-limit']).toBeDefined();
        expect(response.headers['ratelimit-remaining']).toBeDefined();
    });

    it('should reject requests after exceeding the limit', async () => {
        let response;

        for (let i = 0; i < 101; i++) {
            response = await request(app).get('/test');
        }

        expect(response.status).toBe(429);
        expect(response.body).toEqual({
            success: false,
            message: 'Too many requests, please try again later'
        });
    });
});
