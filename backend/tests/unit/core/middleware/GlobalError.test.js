
const GlobalError = require('../../../../src/core/middleware/GlobalError');
const AppError = require('../../../../src/core/utils/AppError');

describe('GlobalError Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should handle AppError correctly', () => {
        const error = new AppError(403, 'Access denied');

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Access denied'
        });
    });

    it('should handle CastError', () => {
        const error = {
            name: 'CastError',
            message: 'Cast failed'
        };

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid resource ID'
        });
    });

    it('should handle ValidationError', () => {
        const error = {
            name: 'ValidationError',
            errors: {
                name: { message: 'Name is required' },
                email: { message: 'Invalid email' }
            }
        };

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Name is required, Invalid email'
        });
    });

    it('should handle duplicate key errors', () => {
        const error = {
            code: 11000,
            keyValue: {
                email: 'test@example.com'
            }
        };

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'email already exists'
        });
    });

    it('should handle duplicate key errors without keyValue', () => {
        const error = {
            code: 11000
        };

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Duplicate value'
        });
    });

    it('should handle invalid JSON errors', () => {
        const error = {
            type: 'entity.parse.failed',
            message: 'Unexpected token'
        };

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid JSON request body'
        });
    });

    it('should handle oversized payload errors', () => {
        const error = {
            type: 'entity.too.large',
            message: 'Payload too large'
        };

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(413);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Request payload is too large'
        });
    });

    it('should hide unexpected internal errors', () => {
        const error = new Error('Database password leaked');

        GlobalError(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Internal Server Error'
        });
    });
});
