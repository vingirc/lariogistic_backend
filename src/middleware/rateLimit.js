const rateLimit = require('express-rate-limit');

const createRateLimiter = (options) => rateLimit({
  windowMs: options.windowMs || 15 * 60 * 1000, // Default to 15 minutes
  max: options.max,
  message: options.message || 'Demasiadas peticiones, intenta de nuevo más tarde.',
  keyGenerator: options.keyGenerator || ((req) => req.ip),
  skip: options.skip || (() => false),
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});

// Specific limiters
const loginLimiter = createRateLimiter({
  max: 5, 
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo más tarde.',
  keyGenerator: (req) => req.body.email || req.ip,
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Demasiados intentos de registro, intenta de nuevo más tarde.',
  keyGenerator: (req) => req.body.email || req.ip,
});

const updateLimiter = createRateLimiter({
  max: 5,
  message: 'Demasiadas solicitudes de actualización, intenta de nuevo más tarde.',
  skip: (req) => req.user && req.user.idRol === 1, // Skip for admin users
});

const passwordChangeLimiter = createRateLimiter({
  max: 3,
  message: 'Demasiados intentos de cambio de contraseña, intenta de nuevo más tarde.',
  skip: (req) => req.user && req.user.idRol === 1, // Skip for admin users
});

const refreshLimiter = createRateLimiter({
  max: 5,
  message: 'Demasiados intentos de refresco de token, intenta de nuevo más tarde.',
});

const publicLimiter = createRateLimiter({
  max: 200,
  message: 'Límite de solicitudes públicas alcanzado, intenta de nuevo más tarde.',
});

const adminLimiter = createRateLimiter({
  max: 500,
  message: 'Límite de solicitudes alcanzado, contacte al soporte.',
  skip: (req) => req.user && req.user.idRol === 1, // Skip for admin users
});

const apiLimiter = createRateLimiter({
  max: 100, // General API limit
  message: 'Límite de solicitudes a la API alcanzado, intenta de nuevo más tarde.',
});

const docsLimiter = createRateLimiter({
  max: 50, // Lower limit for documentation to prevent abuse
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Límite de solicitudes a la documentación alcanzado, intenta de nuevo más tarde.',
});

const createLimiter = createRateLimiter({
  max: 100, // Lo aumenté para desarrollo
  message: 'Demasiadas solicitudes de creación, intenta de nuevo más tarde.',
});

const deleteLimiter = createRateLimiter({
  max: 100,
  message: 'Demasiadas solicitudes de eliminación, intenta de nuevo más tarde.',
});

module.exports = {
  loginLimiter,
  registerLimiter,
  updateLimiter,
  passwordChangeLimiter,
  refreshLimiter,
  publicLimiter,
  adminLimiter,
  apiLimiter,
  docsLimiter,
  createLimiter,
  deleteLimiter,
};
