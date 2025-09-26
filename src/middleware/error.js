const { logger } = require('./logger');

const errorHandler = (err, req, res, next) => {
  const duration = req.startTime ? Date.now() - req.startTime : 0;
  const userInfo = req.user?.idUsuario ? `userId: ${req.user.idUsuario}` : 'anonymous';

  // Log error with stack trace
  logger.error(`Error in ${req.method} ${req.url} (${userInfo})`, {
    error: err.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    duration: `${duration}ms`,
  });

  const statusCodes = {
    ValidationError: 400,
    BadRequestError: 400,
    UnauthorizedError: 401,
    ForbiddenError: 403,
    NotFoundError: 404,
    ConflictError: 409,
    JsonWebTokenError: 401,
    MulterError: 400,
  };

  let status = statusCodes[err.name] || 500;
  let errorMessage = err.message || 'Internal Server Error';
  let code = err.name || 'InternalServerError';

  // Handle specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_COUNT') {
      errorMessage = 'Se excedió el número máximo de archivos (2)';
      code = 'TooManyFiles';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      errorMessage = 'Archivo no esperado';
      code = 'UnexpectedFile';
    } else {
      errorMessage = `Error de carga de archivo: ${err.message}`;
      code = 'FileUploadError';
    }
    status = 400;
  } else if (err.message.includes('Invalid resource type')) {
    errorMessage = 'Tipo de recurso inválido en Cloudinary. Debe ser "image" o "video".';
    code = 'InvalidResourceType';
    status = 400;
  } else if (err.message.includes('Cloudinary')) {
    errorMessage = `Error en Cloudinary: ${err.message}`;
    code = 'CloudinaryError';
    status = 400;
  } else if (err.message === 'Credenciales inválidas') {
    errorMessage = 'Credenciales inválidas';
    code = 'InvalidCredentials';
    status = 401;
  } else if (err.message === 'Usuario inactivo' || err.message === 'Usuario inválido o inactivo') {
    errorMessage = err.message;
    code = 'InactiveUser';
    status = 403;
  } else if (err.code === 'ER_DUP_ENTRY') {
    errorMessage = 'El correo ya está registrado';
    code = 'DuplicateEmail';
    status = 409;
  } else if (err.name === 'JsonWebTokenError') {
    errorMessage = 'Token inválido';
    code = 'InvalidToken';
    status = 401;
  } else if (err.message.includes('Route') && err.message.includes('not available')) {
    errorMessage = 'Ruta no encontrada';
    code = 'RouteNotFound';
    status = 404;
  }

  res.status(status).json({
    success: false,
    error: errorMessage,
    code,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler };