/**
 * Lightweight in-memory rate limiter middleware.
 * Prevents API abuse and token exhaustion without heavy external dependencies.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 30; // Max requests per window per IP

const requestCounts = new Map();

// Periodic cleanup of stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip) || { count: 0, startTime: now };

  // Reset window if expired
  if (now - record.startTime > WINDOW_MS) {
    record.count = 0;
    record.startTime = now;
  }

  record.count += 1;
  requestCounts.set(ip, record);

  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  const resetSeconds = Math.ceil((record.startTime + WINDOW_MS - now) / 1000);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetSeconds);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many report generation requests from this IP. Please wait ${resetSeconds} seconds before trying again.`
    });
  }

  next();
}
