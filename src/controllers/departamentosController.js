const departamentosService = require('../services/departamentosService');

module.exports = {
  /**
   * Obtiene todos los departamentos.
   */
  getAll: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const departamentos = await departamentosService.getAll();
      res.json({
        success: true,
        data: departamentos,
        message: 'Departamentos obtenidos con éxito'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtiene un departamento por ID.
   */
  getById: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const departamento = await departamentosService.findById(parseInt(req.params.id));
      res.json({
        success: true,
        data: departamento,
        message: 'Departamento obtenido con éxito'
      });
    } catch (err) {
      if (err.message === 'Departamento no encontrado') {
        const notFoundErr = new Error('Departamento no encontrado');
        notFoundErr.name = 'NotFoundError';
        return next(notFoundErr);
      }
      next(err);
    }
  },

  /**
   * Crea un nuevo departamento.
   */
  create: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const departamento = await departamentosService.create(req.body, req.user.idUsuario);
      res.status(201).json({
        success: true,
        data: departamento,
        message: 'Departamento creado con éxito'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Actualiza un departamento.
   */
  update: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      const departamento = await departamentosService.update(
        parseInt(req.params.id),
        req.body,
        true, // isAdmin: true para administradores
        req.user.idUsuario
      );
      res.json({
        success: true,
        data: departamento,
        message: 'Departamento actualizado con éxito'
      });
    } catch (err) {
      if (err.message === 'Departamento no encontrado') {
        const notFoundErr = new Error('Departamento no encontrado');
        notFoundErr.name = 'NotFoundError';
        return next(notFoundErr);
      }
      next(err);
    }
  },

  /**
   * Elimina (inactiva) un departamento.
   */
  delete: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso restringido a administradores');
        err.name = 'ForbiddenError';
        return next(err);
      }
      await departamentosService.delete(parseInt(req.params.id), req.user.idUsuario);
      res.json({
        success: true,
        data: null,
        message: 'Departamento inactivado con éxito'
      });
    } catch (err) {
      if (err.message === 'Departamento no encontrado') {
        const notFoundErr = new Error('Departamento no encontrado');
        notFoundErr.name = 'NotFoundError';
        return next(notFoundErr);
      }
      next(err);
    }
  }
};