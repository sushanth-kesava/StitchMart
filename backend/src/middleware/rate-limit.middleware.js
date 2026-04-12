const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

function createRateLimiter({
  windowMs = DEFAULT_WINDOW_MS,
  max = 20,
  keyGenerator = (req) => req.ip || "unknown",
  message = "Too many requests. Please try again later.",
} = {}) {
  const store = new Map();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = String(keyGenerator(req) || "unknown");
    const current = store.get(key);

    if (!current || current.expiresAt <= now) {
      store.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return next();
    }

    current.count += 1;
    store.set(key, current);

    if (current.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.expiresAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    return next();
  };
}

const authRouteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyGenerator: (req) => `auth:${req.ip || "unknown"}`,
  message: "Too many authentication requests. Please try again shortly.",
});

const credentialsAttemptLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 12,
  keyGenerator: (req) => {
    const ip = req.ip || "unknown";
    const route = req.path || "credentials";
    const email = String(req.body?.email || "").trim().toLowerCase() || "anonymous";
    return `cred:${route}:${ip}:${email}`;
  },
  message: "Too many attempts for this account. Please wait before trying again.",
});

module.exports = {
  createRateLimiter,
  authRouteLimiter,
  credentialsAttemptLimiter,
};
