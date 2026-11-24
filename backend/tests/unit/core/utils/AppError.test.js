
const AppError = require('../../../../src/core/utils/AppError');

describe('AppError', () => {
    it('should create an error with the provided status and message', () => {
        const error = new AppError(400, 'Invalid request');

        expect(error.status).toBe(400);
        expect(error.message).toBe('Invalid request');
    });

    it('should extend the native Error class', () => {
        const error = new AppError(400, 'Invalid request');

        expect(error).toBeInstanceOf(Error);
    });

    it('should mark the error as operational', () => {
        const error = new AppError(400, 'Invalid request');

        expect(error.operational).toBe(true);
    });
});
