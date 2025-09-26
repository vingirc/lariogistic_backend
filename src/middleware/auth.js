const jwt = require('jsonwebtoken');
const { publicKey } = require('../utils/env');
const usuarioService = require('../services/usuarioService');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    const error = new Error('No token provided');
    error.name = 'UnauthorizedError';
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    const user = await usuarioService.findById(decoded.idUsuario);
    if (!user || user.estado !== 'activo') {
      const error = new Error('Invalid or inactive user');
      error.name = 'UnauthorizedError';
      throw error;
    }
    req.user = user;
    next();
  } catch (err) {
    err.name = err.name === 'JsonWebTokenError' ? 'UnauthorizedError' : err.name;
    next(err);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  const userRole = req.user.idRol;
  const roleNames = ['Administrador', 'Vendedor', 'Cliente'];
  if (!roles.includes(userRole)) {
    const error = new Error(`Access denied: Role ${roleNames[userRole - 1]} not allowed`);
    error.name = 'ForbiddenError';
    return next(error);
  }
  next();
};

module.exports = { authenticate, restrictTo };