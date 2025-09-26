// src/controllers/usuariosController.js
const usuarioService = require('../services/usuarioService');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const users = await usuarioService.getAll();
      res.json({
        success: true,
        data: users,
        message: 'Usuarios obtenidos con éxito',
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (!req.user || (req.user.idUsuario !== userId && req.user.idRol !== 1)) {
        const err = new Error('Acceso denegado: Solo el usuario o un administrador pueden ver este perfil');
        err.name = 'ForbiddenError';
        throw err;
      }
      const user = await usuarioService.findById(userId);
      if (!user) {
        const err = new Error('Usuario no encontrado');
        err.name = 'NotFoundError';
        throw err;
      }
      const { password, ...safeUser } = user; // Excluir contraseña
      res.json({
        success: true,
        data: safeUser,
        message: 'Usuario obtenido con éxito',
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol === 3) {
        const err = new Error('Acceso denegado: Los empleados no pueden crear usuarios');
        err.name = 'ForbiddenError';
        throw err;
      }

      const { nombre, email, password, idRol } = req.body;
      let user;

      if (![2, 3].includes(idRol)) {
        const err = new Error('Rol inválido: Solo se pueden crear clientes o vendedores');
        err.name = 'BadRequestError';
        throw err;
      }

      if (req.user.idRol === 2 && idRol !== 3) {
        const err = new Error('Acceso denegado: Los gerentes solo pueden crear clientes');
        err.name = 'ForbiddenError';
        throw err;
      }

      if (req.user.idRol === 2 && idRol === 3) {
        user = await usuarioService.create({ nombre, email, password, idRol}, req.user.idUsuario);
      } else { // Admin creando cualquier tipo de usuario
        const { idDepartamento } = req.body;
        user = await usuarioService.create({ nombre, email, password, idRol, idDepartamento }, req.user.idUsuario);
      }

      const { password: _, ...safeUser } = user; // Excluir contraseña
      res.status(201).json({
        success: true,
        data: safeUser,
        message: 'Usuario creado con éxito',
      });
    } catch (err) {
      next(err);
    }
  },

  registerWithGoogle: async (req, res, next) => {
    try {
      const { nombre, email, googleId } = req.body;
      let user = await usuarioService.findByEmail(email);
      if (user) {
        if (!user.googleId) {
          const err = new Error('El correo ya está registrado con otro método');
          err.name = 'ConflictError';
          throw err;
        }
        const { password: _, ...safeUser } = user; // Excluir contraseña
        return res.json({
          success: true,
          data: safeUser,
          message: 'Usuario existente retornado con éxito',
        });
      }
      user = await usuarioService.createClient({ nombre, email, googleId });
      const { password: _, ...safeUser } = user; // Excluir contraseña
      res.status(201).json({
        success: true,
        data: safeUser,
        message: 'Cliente registrado con Google con éxito',
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (!req.user || (req.user.idUsuario !== userId && req.user.idRol !== 1)) {
        const err = new Error('Acceso denegado: Solo el usuario o un administrador pueden actualizar este perfil');
        err.name = 'ForbiddenError';
        throw err;
      }
      const isAdmin = req.user.idRol === 1;
      const user = await usuarioService.update(userId, req.body, isAdmin, isAdmin ? req.user.idUsuario : null);
      const { password: _, ...safeUser } = user; // Excluir contraseña
      res.json({
        success: true,
        data: safeUser,
        message: 'Usuario actualizado con éxito',
      });
    } catch (err) {
      next(err);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (!req.user || (req.user.idUsuario !== userId && req.user.idRol !== 1)) {
        const err = new Error('Acceso denegado: Solo el usuario o un administrador pueden cambiar esta contraseña');
        err.name = 'ForbiddenError';
        throw err;
      }
      const isAdmin = req.user.idRol === 1;
      const { currentPassword, newPassword } = req.body;
      await usuarioService.updatePassword(userId, currentPassword, newPassword, isAdmin, isAdmin ? req.user.idUsuario : null);
      res.json({
        success: true,
        data: null,
        message: 'Contraseña actualizada con éxito',
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      if (!req.user || req.user.idRol !== 1) {
        const err = new Error('Acceso denegado: Solo administradores pueden eliminar usuarios');
        err.name = 'ForbiddenError';
        throw err;
      }
      await usuarioService.delete(req.params.id, req.user.idUsuario);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Usuario eliminado permanentemente con éxito',
      });
    } catch (err) {
      next(err);
    }
  },
};