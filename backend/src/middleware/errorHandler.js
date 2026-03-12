const { ZodError } = require('zod');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        issues: err.issues,
      },
    });
  }

  const status = err.statusCode || err.status || 500;

  return res.status(status).json({
    error: {
      message: err.message || 'Internal server error',
    },
  });
}

module.exports = { errorHandler };
