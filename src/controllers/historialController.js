const historialService = require('../services/historialService');

module.exports = {
  /**
   * Obtiene todos los registros del historial.
   */
  getAll: async (req, res, next) => {
    try {
      if (!req.user || (req.user.idRol !== 1 && req.user.idRol !== 2)) {
        const err = new Error('Acceso restringido a administradores y gerentes');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const historial = await historialService.getAll();
      res.json({
        success: true,
        data: historial,
        message: 'Historial obtenido con éxito'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtiene un registro del historial por ID.
   */
  getById: async (req, res, next) => {
    try {
      if (!req.user || (req.user.idRol !== 1 && req.user.idRol !== 2)) {
        const err = new Error('Acceso restringido a administradores y gerentes');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const registro = await historialService.findById(parseInt(req.params.id));
      res.json({
        success: true,
        data: registro,
        message: 'Registro de historial obtenido con éxito'
      });
    } catch (err) {
      if (err.message === 'Registro de historial no encontrado') {
        const notFoundErr = new Error('Registro de historial no encontrado');
        notFoundErr.name = 'NotFoundError';
        return next(notFoundErr);
      }
      next(err);
    }
  },

  /**
   * Crea un nuevo registro en el historial (solo admins para logs manuales).
   */
  create: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const registro = await historialService.create(
        { ...req.body, userId: req.body.idUsuario },
        true // isAdmin
      );
      res.status(201).json({
        success: true,
        data: registro,
        message: 'Registro de historial creado con éxito'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Actualiza un registro del historial.
   */
  update: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const registro = await historialService.update(
        parseInt(req.params.id),
        req.body,
        true // isAdmin
      );
      res.json({
        success: true,
        data: registro,
        message: 'Registro de historial actualizado con éxito'
      });
    } catch (err) {
      if (err.message === 'Registro de historial no encontrado') {
        const notFoundErr = new Error('Registro de historial no encontrado');
        notFoundErr.name = 'NotFoundError';
        return next(notFoundErr);
      }
      next(err);
    }
  },

  /**
   * Elimina un registro del historial.
   */
  delete: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      await historialService.delete(parseInt(req.params.id), true); // isAdmin
      res.json({
        success: true,
        data: null,
        message: 'Registro de historial eliminado con éxito'
      });
    } catch (err) {
      if (err.message === 'Registro de historial no encontrado') {
        const notFoundErr = new Error('Registro de historial no encontrado');
        notFoundErr.name = 'NotFoundError';
        return next(notFoundErr);
      }
      next(err);
    }
  }
};