const pool = require('../config/db');
const historialService = require('./historialService'); // Asume que existe para logs automáticos
const { ForbiddenError } = require('../middleware/error'); // Importa para lanzar errores de permisos desde service

const tramitesService = {
  /**
   * Obtiene trámites filtrados por rol de usuario.
   * - Admin (1): Todos.
   * - Gerente (2): Solo de su departamento.
   * - Empleado (3): Solo los propios.
   * @param {Object} user - Objeto user con idRol, idUsuario, idDepartamento.
   * @returns {Array} Lista de trámites filtrados.
   */
  async getAll(user) {
    if (!user || !user.idRol) {
      throw new Error('Usuario requerido para filtrar trámites');
    }

    let query = `
      SELECT 
        t.idTramite, t.idUsuario, t.idTipoTramite, t.fechaSolicitud, t.estado, 
        t.descripcion, t.fechaInicio, t.fechaFin,
        u.nombre AS solicitante, u.email AS emailSolicitante,
        tt.nombre AS tipoTramite,
        u.idDepartamento
      FROM Tramites t
      JOIN Usuarios u ON t.idUsuario = u.idUsuario
      JOIN TiposTramites tt ON t.idTipoTramite = tt.idTipoTramite
    `;
    const params = [];
    let whereClause = '';

    if (user.idRol === 1) {
      // Admin: todos
      whereClause = '';
    } else if (user.idRol === 2) {
      // Gerente: solo de su departamento
      whereClause = ' WHERE u.idDepartamento = ?';
      params.push(user.idDepartamento);
    } else if (user.idRol === 3) {
      // Empleado: solo propios
      whereClause = ' WHERE t.idUsuario = ?';
      params.push(user.idUsuario);
    } else {
      throw new ForbiddenError('Rol de usuario inválido para acceder a trámites');
    }

    query += whereClause + ' ORDER BY t.fechaSolicitud DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Obtiene un trámite por ID con joins y verifica permisos basados en rol.
   * @param {number} id - ID del trámite.
   * @param {Object} user - Objeto user con idRol, idUsuario, idDepartamento.
   * @returns {Object} Trámite encontrado.
   */
  async findById(id, user) {
    if (!user || !user.idRol) {
      throw new Error('Usuario requerido para verificar permisos');
    }

    const [rows] = await pool.query(`
      SELECT 
        t.idTramite, t.idUsuario, t.idTipoTramite, t.fechaSolicitud, t.estado, 
        t.descripcion, t.fechaInicio, t.fechaFin,
        u.nombre AS solicitante, u.email AS emailSolicitante,
        tt.nombre AS tipoTramite,
        u.idDepartamento
      FROM Tramites t
      JOIN Usuarios u ON t.idUsuario = u.idUsuario
      JOIN TiposTramites tt ON t.idTipoTramite = tt.idTipoTramite
      WHERE t.idTramite = ?
    `, [id]);

    if (rows.length === 0) {
      throw new Error('Trámite no encontrado');
    }

    const tramite = rows[0];

    // Verificación de permisos
    if (user.idRol === 1) {
      // Admin: puede ver todo
      return tramite;
    } else if (user.idRol === 2) {
      // Gerente: solo de su departamento
      if (tramite.idDepartamento !== user.idDepartamento) {
        throw new ForbiddenError('No tienes permisos para ver este trámite (fuera de tu departamento)');
      }
      return tramite;
    } else if (user.idRol === 3) {
      // Empleado: solo propio
      if (tramite.idUsuario !== user.idUsuario) {
        throw new ForbiddenError('No tienes permisos para ver este trámite');
      }
      return tramite;
    } else {
      throw new ForbiddenError('Rol de usuario inválido para acceder al trámite');
    }
  },

  /**
   * Crea un nuevo trámite.
   * @param {Object} data - Datos: { idTipoTramite, descripcion, fechaInicio, fechaFin }.
   * @param {number} userId - ID del usuario solicitante.
   * @returns {Object} Trámite creado.
   */
  async create({ idTipoTramite, descripcion, fechaInicio, fechaFin }, userId) {
    // Validaciones de negocio
    if (!idTipoTramite || !fechaInicio || !fechaFin) {
      throw new Error('ID de tipo de trámite y fechas son requeridas');
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }
    const estadoInicial = 'pendiente'; // Estado por defecto

    const [result] = await pool.query(
      `INSERT INTO Tramites (idUsuario, idTipoTramite, descripcion, fechaInicio, fechaFin, estado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, idTipoTramite, descripcion, fechaInicio, fechaFin, estadoInicial]
    );

    // Log en historial
    await historialService.log(userId, result.insertId, 'Creación de trámite');

    // Retorna datos con ID generado
    return { 
      idTramite: result.insertId, 
      idUsuario: userId, 
      idTipoTramite, 
      descripcion, 
      fechaInicio, 
      fechaFin, 
      estado: estadoInicial,
      fechaSolicitud: new Date().toISOString().split('T')[0]
    };
  },

  /**
   * Actualiza un trámite (e.g., cambio de estado por aprobación).
   * @param {number} id - ID del trámite.
   * @param {Object} data - Datos: { estado, observaciones? } (solo gerentes/admins).
   * @param {boolean} isAdmin - Si es admin (permite más acciones).
   * @param {Object} user - Objeto user para verificar departamento si gerente.
   * @returns {Object} Trámite actualizado.
   */
  async update(id, { estado, observaciones }, isAdmin, user) {
    const tramiteExistente = await this.findById(id, user); // Usa findById para verificar permisos
    const estadosValidos = ['pendiente', 'aprobado', 'rechazado', 'en revision'];

    if (!estadosValidos.includes(estado)) {
      throw new Error('Estado inválido para el trámite');
    }

    // Solo permite cambios si es admin o gerente (verificar en controller)
    if (!isAdmin && tramiteExistente.estado === 'aprobado') {
      throw new Error('No se puede modificar un trámite ya aprobado');
    }

    const camposActualizables = [];
    const params = [];
    if (estado) {
      camposActualizables.push('estado = ?');
      params.push(estado);
    }
    if (observaciones) {
      camposActualizables.push('descripcion = ?'); // Reutiliza descripcion para observaciones si aplica
      params.push(observaciones);
    }

    if (camposActualizables.length === 0) {
      throw new Error('Al menos un campo debe ser proporcionado para actualizar');
    }

    params.push(id);
    const [result] = await pool.query(
      `UPDATE Tramites SET ${camposActualizables.join(', ')} WHERE idTramite = ?`,
      params
    );

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el trámite');
    }

    // Log en historial (requiere userId del actualizador)
    await historialService.log(user.idUsuario, id, `Actualización de trámite a estado: ${estado}`);

    return { ...tramiteExistente, estado, descripcion: observaciones || tramiteExistente.descripcion };
  },

  /**
   * Elimina un trámite (solo admins, soft delete via estado si aplica).
   * @param {number} id - ID del trámite.
   * @param {number} userId - ID del usuario que elimina.
   * @param {Object} user - Objeto user para verificar permisos.
   * @returns {Object} Confirmación de eliminación.
   */
  async delete(id, userId, user) {
    const tramite = await this.findById(id, user); // Usa findById para verificar permisos (solo admin pasará)
    if (tramite.estado !== 'pendiente') {
      throw new Error('Solo se pueden eliminar trámites pendientes');
    }

    const [result] = await pool.query(
      'DELETE FROM Tramites WHERE idTramite = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar el trámite');
    }

    // Log en historial
    await historialService.log(userId, id, 'Eliminación de trámite');

    return { message: 'Trámite eliminado con éxito', idTramite: id };
  }
};

module.exports = tramitesService;