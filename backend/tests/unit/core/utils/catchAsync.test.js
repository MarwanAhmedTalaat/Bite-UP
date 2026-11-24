
const catchAsync = require('../../../../src/core/utils/catchAsync');

describe('catchAsync', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {};
        next = jest.fn();
    });

    it('should execute the async handler successfully', async () => {
        const handler = jest.fn().mockResolvedValue('Success');

        const wrappedHandler = catchAsync(handler);

        wrappedHandler(req, res, next);

        await Promise.resolve();

        expect(handler).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
    });

    it('should pass rejected errors to next', async () => {
        const error = new Error('Something went wrong');

        const handler = jest.fn().mockRejectedValue(error);

        const wrappedHandler = catchAsync(handler);

        wrappedHandler(req, res, next);

        await Promise.resolve();

        expect(next).toHaveBeenCalledWith(error);
    });
});
