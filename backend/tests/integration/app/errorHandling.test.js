
const express = require('express');
const request = require('supertest');
const AppError = require('../../../src/core/utils/AppError');
const GlobalError = require('../../../src/core/middleware/GlobalError');

const app = express();

app.use(express.json());

app.post('/app-error', (req, res, next) => {
    next(new AppError(403, 'Access denied'));
});

app.post('/unexpected-error', (req, res, next) => {
    next(new Error('Sensitive internal details'));
});

app.use(GlobalError);

describe('Error Handling Integration', () => {
    it('should handle operational AppError correctly', async () => {
        const response = await request(app)
            .post('/app-error')
            .send({});

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            success: false,
            message: 'Access denied'
        });
    });

    it('should hide unexpected internal errors', async () => {
        const response = await request(app)
            .post('/unexpected-error')
            .send({});

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: 'Internal Server Error'
        });
        expect(response.body.message).not.toContain(
            'Sensitive internal details'
        );
    });

    it('should handle invalid JSON request bodies', async () => {
        const response = await request(app)
            .post('/app-error')
            .set('Content-Type', 'application/json')
            .send('{"invalid": json}');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Invalid JSON request body'
        });
    });
});
