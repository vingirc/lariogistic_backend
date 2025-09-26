const tramitesService = require('../services/tramitesService');
const { ForbiddenError } = require('../middleware/error'); // Asume que está exportado

module.exports = {
  /**
   * Obtiene todos los trámites.
   */
  getAll: async (req, res, next) => {
    try {
      // Solo admins y gerentes pueden ver todos
      if (!req.user || (req.user.idRol !== 1 && req.user.idRol !== 2)) {
        throw new ForbiddenError('Solo administradores y gerentes pueden ver todos los trámites');
      }
      const tramites = await tramitesService.getAll();
      res.json({ 
        success: true, 
        data: tramites, 
        message: 'Trámites obtenidos con éxito' 
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtiene un trámite por ID.
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const tramite = await tramitesService.findById(parseInt(id));
      // Cualquier usuario autenticado puede ver, pero verifica ownership si es empleado
      if (req.user.idRol === 3 && tramite.idUsuario !== req.user.idUsuario) {
        throw new ForbiddenError('No tienes permisos para ver este trámite');
      }
      res.json({ 
        success: true, 
        data: tramite, 
        message: 'Trámite obtenido con éxito' 
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Crea un nuevo trámite.
   */
  create: async (req, res, next) => {
    try {
      // Solo empleados pueden solicitar
      if (!req.user || req.user.idRol !== 3) {
        throw new ForbiddenError('Solo empleados pueden solicitar trámites');
      }
      const { idTipoTramite, descripcion, fechaInicio, fechaFin } = req.body;
      const tramite = await tramitesService.create(
        { idTipoTramite: parseInt(idTipoTramite), descripcion, fechaInicio, fechaFin },
        req.user.idUsuario
      );
      res.status(201).json({ 
        success: true, 
        data: tramite, 
        message: 'Trámite creado con éxito' 
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Actualiza un trámite (e.g., aprobación).
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;
      const isAdmin = req.user.idRol === 1;
      // Solo admins y gerentes pueden actualizar (aprobar/rechazar)
      if (!req.user || (req.user.idRol !== 1 && req.user.idRol !== 2)) {
        throw new ForbiddenError('Solo administradores y gerentes pueden actualizar trámites');
      }
      const tramite = await tramitesService.update(
        parseInt(id), 
        { estado, observaciones }, 
        isAdmin
      );
      res.json({ 
        success: true, 
        data: tramite, 
        message: 'Trámite actualizado con éxito' 
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Elimina un trámite.
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      // Solo admins pueden eliminar
      if (!req.user || req.user.idRol !== 1) {
        throw new ForbiddenError('Solo administradores pueden eliminar trámites');
      }
      const result = await tramitesService.delete(parseInt(id), req.user.idUsuario);
      res.json({ 
        success: true, 
        data: result, 
        message: 'Trámite eliminado con éxito' 
      });
    } catch (err) {
      next(err);
    }
  }
};