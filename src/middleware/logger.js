const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // En Vercel, no se puede escribir en disco, así que omitimos File transport
    // Para producción, considera un transporte remoto (CloudWatch, Loggly) si es necesario
  ],
});

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const userInfo = req.user ? `userId: ${req.user.idUsuario}` : 'anonymous';
  logger.info(`${req.method} ${req.url} from ${req.ip} (${userInfo})`, {
    headers: { userAgent: req.get('User-Agent') },
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.url} ${res.statusCode} in ${duration}ms (${userInfo})`);
  });

  next();
};

module.exports = { logger, requestLogger };