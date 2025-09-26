const mysql = require('mysql2/promise');
const { validateEnv } = require('../utils/env');

console.log(`[${new Date().toISOString()}] Initializing database pool`);

try {
  validateEnv(['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']);

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 10000, // 10s timeout
    acquireTimeout: 10000,
    timezone: 'America/Mexico_City', // Set session time zone to CST
    retry: { // Add retry logic
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
    },
  });

  console.log(`[${new Date().toISOString()}] Database pool initialized`);

  if (process.env.NODE_ENV !== 'production') {
    (async () => {
      const startTime = Date.now();
      try {
        const connection = await pool.getConnection();
        console.log(`[${new Date().toISOString()}] Database connected successfully in ${Date.now() - startTime}ms`);
        // Verify time zone
        const [rows] = await connection.query('SELECT NOW() AS currentTime, @@session.time_zone AS timeZone');
        console.log(`[${new Date().toISOString()}] Database time: ${rows[0].currentTime}, Time zone: ${rows[0].timeZone}`);
        connection.release();
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Database connection error: ${err.message}`);
      }
    })();
  }

  module.exports = pool;
} catch (err) {
  console.error(`[${new Date().toISOString()}] Failed to initialize database pool: ${err.message}`);
  throw err;
}