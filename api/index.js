const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../src/config/swagger');
const { logger, requestLogger } = require('../src/middleware/logger');
const { errorHandler } = require('../src/middleware/error');
const { apiLimiter, docsLimiter } = require('../src/middleware/rateLimit');
const indexRoutes = require('../src/routes/index');

logger.info('Starting api/index.js');

try {
  const app = express();

  // Enable trust proxy for Vercel
  app.set('trust proxy', 1);

  // Enable strict routing
  app.set('strict routing', true);

  // Middleware to enforce trailing slash for /api-docs
  app.use((req, res, next) => {
    if (req.path === '/api-docs' && !req.originalUrl.endsWith('/')) {
      logger.info('Redirecting /api-docs to /api-docs/');
      res.redirect(301, '/api-docs/');
    } else {
      next();
    }
  });

  // Initialize Passport
  app.use(passport.initialize());

  // Serve OpenAPI JSON spec
  app.get('/api-docs.json', docsLimiter, (req, res) => {
    logger.info('Serving /api-docs.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API Documentation (Swagger)
  const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
  app.use('/api-docs', docsLimiter, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://your-frontend.com', 'https://your-backend.com', 'https://accounts.google.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'https://accounts.google.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
        connectSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", 'https://your-frontend.com', 'https://your-backend.com', 'https://accounts.google.com']
          : ["'self'", 'http://localhost:3000', 'http://localhost:5173', 'https://accounts.google.com'],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        imgSrc: ["'self'", 'https://res.cloudinary.com', 'data:']
      },
    },
  }));

  app.use(express.json());

  // Logging
  app.use(requestLogger);

  // Base route
  app.get('/', apiLimiter, (req, res) => {
    res.json({
      message: 'Bienvenido a la API lariogistic',
      status: 'OK',
      version: '1.0.0',
      documentation: '/api-docs/',
      timestamp: new Date().toISOString(),
    });
  });

  // Routes
  app.use('/api', apiLimiter, indexRoutes);

  // Handle unmatched routes
  app.use(apiLimiter, (req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      code: 404,
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling
  app.use(errorHandler);

  // Start server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
} catch (err) {
  logger.error('Fatal error during initialization', { error: err.message });
  process.exit(1);
}