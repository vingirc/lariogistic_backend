const pool = require('../config/db');

const historialService = {
  /**
   * Obtiene todos los registros del historial.
   * @returns {Promise<Array>} Lista de registros del historial.
   */
  async getAll() {
    const [rows] = await pool.query(`
      SELECT h.*, u.nombre AS usuarioNombre, t.idTipoTramite
      FROM Historial h
      JOIN Usuarios u ON h.idUsuario = u.idUsuario
      LEFT JOIN Tramites t ON h.idTramite = t.idTramite
      ORDER BY fechaAccion DESC
    `);
    return rows;
  },

  /**
   * Obtiene un registro del historial por ID.
   * @param {number} id - ID del registro del historial.
   * @returns {Promise<Object>} Registro encontrado.
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT h.*, u.nombre AS usuarioNombre, t.idTipoTramite
       FROM Historial h
       JOIN Usuarios u ON h.idUsuario = u.idUsuario
       LEFT JOIN Tramites t ON h.idTramite = t.idTramite
       WHERE h.idHistorial = ?`,
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Registro de historial no encontrado');
    }
    return rows[0];
  },

  /**
   * Crea un nuevo registro en el historial (usado para logs automáticos).
   * @param {number} userId - ID del usuario que realiza la acción.
   * @param {number|null} tramiteId - ID del trámite relacionado (opcional).
   * @param {string} accion - Acción realizada (e.g., 'Creación de trámite').
   * @param {string|null} descripcion - Descripción detallada.
   * @returns {Promise<Object>} Registro creado con ID.
   */
  async create({ userId, tramiteId, accion, descripcion }, isAdmin) {
    if (!userId || !accion || accion.trim().length === 0) {
      throw new Error('ID de usuario y acción son requeridos');
    }
    if (accion.length > 100) {
      throw new Error('La acción no puede exceder 100 caracteres');
    }
    if (descripcion && descripcion.length > 65535) { // Límite TEXT en MySQL
      throw new Error('La descripción no puede exceder el límite de caracteres');
    }

    const [result] = await pool.query(
      'INSERT INTO Historial (idUsuario, idTramite, accion, descripcion) VALUES (?, ?, ?, ?)',
      [userId, tramiteId || null, accion, descripcion || null]
    );
    const newId = result.insertId;
    return { idHistorial: newId, idUsuario: userId, idTramite: tramiteId, accion, descripcion };
  },

  /**
   * Actualiza un registro del historial (solo para admins, e.g., correcciones).
   * @param {number} id - ID del registro.
   * @param {Object} data - Datos a actualizar: { accion, descripcion }.
   * @param {boolean} isAdmin - Indica si es admin (requerido para updates).
   * @returns {Promise<Object>} Registro actualizado.
   */
  async update(id, { accion, descripcion }, isAdmin) {
    if (!isAdmin) {
      throw new Error('Solo administradores pueden actualizar el historial');
    }
    const registro = await this.findById(id);

    const updates = [];
    const params = [];
    if (accion !== undefined) {
      if (!accion || accion.trim().length === 0) {
        throw new Error('La acción es requerida');
      }
      if (accion.length > 100) {
        throw new Error('La acción no puede exceder 100 caracteres');
      }
      updates.push('accion = ?');
      params.push(accion);
    }
    if (descripcion !== undefined) {
      if (descripcion.length > 65535) {
        throw new Error('La descripción no puede exceder el límite de caracteres');
      }
      updates.push('descripcion = ?');
      params.push(descripcion);
    }
    if (updates.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    params.unshift(updates.join(', '));
    params.unshift(id);
    await pool.query(
      `UPDATE Historial SET ${updates.join(', ')} WHERE idHistorial = ?`,
      params
    );

    return { ...registro, ...(accion && { accion }), ...(descripcion && { descripcion }) };
  },

  /**
   * Elimina un registro del historial (solo para admins, soft delete no aplica).
   * @param {number} id - ID del registro.
   * @param {boolean} isAdmin - Indica si es admin (requerido).
   * @returns {Promise<void>}
   */
  async delete(id, isAdmin) {
    if (!isAdmin) {
      throw new Error('Solo administradores pueden eliminar registros del historial');
    }
    const registro = await this.findById(id);
    await pool.query('DELETE FROM Historial WHERE idHistorial = ?', [id]);
  },

  /**
   * Log de acción (método auxiliar usado por otros services).
   * @param {number} userId - ID del usuario.
   * @param {number|null} tramiteId - ID del trámite.
   * @param {string} accion - Acción.
   * @param {string} descripcion - Descripción opcional.
   * @returns {Promise<void>}
   */
  async log(userId, tramiteId, accion, descripcion = null) {
    await this.create({ userId, tramiteId, accion, descripcion }, false);
  }
};

module.exports = historialService;