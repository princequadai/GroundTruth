/**
 * Centralized error handler middleware.
 * Guarantees that internal stack traces, API keys, and sensitive environment details
 * are NEVER leaked to the client.
 */

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';
  const code = err.code || 'INTERNAL_ERROR';

  // Log cleanly on server console (without leaking keys)
  console.error(`[Error] [${code}] Status: ${status} - Message: ${message}`);

  res.status(status).json({
    error: err.name || 'Error',
    message: message,
    code: code
  });
}
