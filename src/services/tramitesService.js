const pool = require('../config/db');
const historialService = require('./historialService'); // Asume que existe para logs automáticos

const tramitesService = {
  /**
   * Obtiene todos los trámites con joins a Usuarios y TiposTramites.
   * @returns {Array} Lista de trámites.
   */
  async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        t.idTramite, t.idUsuario, t.idTipoTramite, t.fechaSolicitud, t.estado, 
        t.descripcion, t.fechaInicio, t.fechaFin,
        u.nombre AS solicitante, u.email AS emailSolicitante,
        tt.nombre AS tipoTramite
      FROM Tramites t
      JOIN Usuarios u ON t.idUsuario = u.idUsuario
      JOIN TiposTramites tt ON t.idTipoTramite = tt.idTipoTramite
      ORDER BY t.fechaSolicitud DESC
    `);
    return rows;
  },

  /**
   * Obtiene un trámite por ID con joins.
   * @param {number} id - ID del trámite.
   * @returns {Object} Trámite encontrado.
   */
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT 
        t.idTramite, t.idUsuario, t.idTipoTramite, t.fechaSolicitud, t.estado, 
        t.descripcion, t.fechaInicio, t.fechaFin,
        u.nombre AS solicitante, u.email AS emailSolicitante,
        tt.nombre AS tipoTramite
      FROM Tramites t
      JOIN Usuarios u ON t.idUsuario = u.idUsuario
      JOIN TiposTramites tt ON t.idTipoTramite = tt.idTipoTramite
      WHERE t.idTramite = ?
    `, [id]);
    if (rows.length === 0) {
      throw new Error('Trámite no encontrado');
    }
    return rows[0];
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
   * @returns {Object} Trámite actualizado.
   */
  async update(id, { estado, observaciones }, isAdmin) {
    const tramiteExistente = await this.findById(id);
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

    // Log en historial (requiere userId del actualizador, pasarlo desde controller si aplica)
    // await historialService.log(actualizadorId, id, `Actualización de trámite a estado: ${estado}`);

    return { ...tramiteExistente, estado, descripcion: observaciones || tramiteExistente.descripcion };
  },

  /**
   * Elimina un trámite (solo admins, soft delete via estado si aplica).
   * @param {number} id - ID del trámite.
   * @param {number} userId - ID del usuario que elimina.
   * @returns {Object} Confirmación de eliminación.
   */
  async delete(id, userId) {
    const tramite = await this.findById(id);
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