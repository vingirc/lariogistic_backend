const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const loadRoute = (routeName) => {
  const isVercel = process.env.VERCEL === '1';
  const env = isVercel ? 'Vercel' : 'Local';
  const relativePath = `./${routeName}`;
  const projectRootPath = path.resolve(process.cwd(), 'src', 'routes', `${routeName}.js`);

  // Log environment and paths
  console.log(`[${new Date().toISOString()}] [${env}] Working directory: ${process.cwd()}`);
  console.log(`[${new Date().toISOString()}] [${env}] Attempting to load route: ${routeName} (relative=${relativePath}, projectRoot=${projectRootPath})`);

  // Try relative path (local)
  try {
    const route = require(relativePath);
    console.log(`[${new Date().toISOString()}] [${env}] Successfully loaded route: ${routeName} (relative)`);
    return route;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [${env}] Failed to load route ${routeName} with relative path ${relativePath}: ${err.message}`);
    console.error(`[${new Date().toISOString()}] [${env}] Relative path error stack: ${err.stack}`);

    // Try project root path (Vercel)
    console.log(`[${new Date().toISOString()}] [${env}] Attempting to load route: ${routeName} (projectRoot: ${projectRootPath})`);
    try {
      if (fs.existsSync(projectRootPath)) {
        const route = require(projectRootPath);
        console.log(`[${new Date().toISOString()}] [${env}] Successfully loaded route: ${routeName} (projectRoot)`);
        return route;
      } else {
        console.error(`[${new Date().toISOString()}] [${env}] Route file does not exist at project root path: ${projectRootPath}`);
      }
    } catch (projErr) {
      console.error(`[${new Date().toISOString()}] [${env}] Failed to load route ${routeName} with project root path ${projectRootPath}: ${projErr.message}`);
      console.error(`[${new Date().toISOString()}] [${env}] Project root path error stack: ${projErr.stack}`);
    }

    // Fallback to static loading using __dirname
    console.log(`[${new Date().toISOString()}] [${env}] Attempting to load route ${routeName} with static path: ${path.join(__dirname, `${routeName}.js`)}`);
    try {
      if (fs.existsSync(path.join(__dirname, `${routeName}.js`))) {
        const route = require(path.join(__dirname, routeName));
        console.log(`[${new Date().toISOString()}] [${env}] Successfully loaded route: ${routeName} (static)`);
        return route;
      } else {
        console.error(`[${new Date().toISOString()}] [${env}] Route file does not exist at static path: ${path.join(__dirname, `${routeName}.js`)}`);
      }
    } catch (staticErr) {
      console.error(`[${new Date().toISOString()}] [${env}] Failed to load route ${routeName} with static path: ${staticErr.message}`);
      console.error(`[${new Date().toISOString()}] [${env}] Static path error stack: ${staticErr.stack}`);
    }

    // Final fallback response
    console.error(`[${new Date().toISOString()}] [${env}] All attempts to load route ${routeName} failed. Returning error handler.`);
    return (req, res) => res.status(500).json({
      error: `Route ${routeName} not available`,
      details: `Failed to load route in ${env} environment. Check server logs for details.`,
      timestamp: new Date().toISOString()
    });
  }
};

// Base route
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API lariogistic' });
});

// Cargar rutas
router.use('/usuarios', loadRoute('usuariosRoutes'));
router.use('/auth', loadRoute('authRoutes'));

module.exports = router;