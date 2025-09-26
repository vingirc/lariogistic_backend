const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../src/config/swagger');
const { logger, requestLogger } = require('../src/middleware/logger');
const { errorHandler } = require('../src/middleware/error');
const { apiLimiter } = require('../src/middleware/rateLimit');
const indexRoutes = require('../src/routes/index');

logger.info('Starting api/index.js');

try {
  const app = express();

  // Enable trust proxy for Vercel
  app.set('trust proxy', 1);

  // Enable strict routing
  app.set('strict routing', true);

  // Initialize Passport for Google OAuth
  app.use(passport.initialize());

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://logistics-frontend.vercel.app', 'https://accounts.google.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'https://accounts.google.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
        connectSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", 'https://logistics-frontend.vercel.app', 'https://accounts.google.com']
          : ["'self'", 'http://localhost:3000', 'http://localhost:5173', 'https://accounts.google.com'],
        imgSrc: ["'self'", 'https://res.cloudinary.com', 'data:']
      }
    }
  }));

  // Parse JSON bodies
  app.use(express.json());

  // Logging
  app.use(requestLogger);

  // API Documentation
  const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL
  }));

  // Routes
  app.use('/api', apiLimiter, indexRoutes);

  // Error handling
  app.use(errorHandler);

  // Start server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
} catch (err) {
  logger.error(`Fatal error during initialization: ${err.message}`);
  process.exit(1);
}