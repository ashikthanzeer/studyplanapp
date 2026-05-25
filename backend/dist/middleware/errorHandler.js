"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.message === 'Unauthorized') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.message === 'Not Found') {
        return res.status(404).json({ error: 'Resource not found' });
    }
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Route not found' });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map