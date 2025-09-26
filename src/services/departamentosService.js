const pool = require('../config/db');
const historialService = require('./historialService'); // Para logs de acciones si aplica

const departamentosService = {
  /**
   * Obtiene todos los departamentos.
   * @returns {Promise<Array>} Lista de departamentos.
   */
  async getAll() {
    const [rows] = await pool.query(`
      SELECT idDepartamento, nombre, descripcion, fechaCreacion, estado
      FROM Departamentos
      ORDER BY fechaCreacion DESC
    `);
    return rows;
  },

  /**
   * Obtiene un departamento por ID.
   * @param {number} id - ID del departamento.
   * @returns {Promise<Object>} Departamento encontrado.
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT idDepartamento, nombre, descripcion, fechaCreacion, estado FROM Departamentos WHERE idDepartamento = ?',
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Departamento no encontrado');
    }
    return rows[0];
  },

  /**
   * Crea un nuevo departamento.
   * @param {Object} data - Datos del departamento: { nombre, descripcion }.
   * @param {number} userId - ID del usuario que crea (para logs).
   * @returns {Promise<Object>} Departamento creado con ID.
   */
  async create({ nombre, descripcion }, userId) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del departamento es requerido');
    }
    if (nombre.length > 50) {
      throw new Error('El nombre del departamento no puede exceder 50 caracteres');
    }
    // Verificar unicidad
    const [existing] = await pool.query(
      'SELECT idDepartamento FROM Departamentos WHERE nombre = ?',
      [nombre]
    );
    if (existing.length > 0) {
      throw new Error('Ya existe un departamento con ese nombre');
    }

    const [result] = await pool.query(
      'INSERT INTO Departamentos (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    const newId = result.insertId;
    // Log en historial
    await historialService.log(userId, null, `Creación del departamento: ${nombre}`);
    return { idDepartamento: newId, nombre, descripcion, estado: 'activo' };
  },

  /**
   * Actualiza un departamento existente.
   * @param {number} id - ID del departamento.
   * @param {Object} data - Datos a actualizar: { nombre, descripcion, estado }.
   * @param {boolean} isAdmin - Indica si es admin (permite cambios completos).
   * @param {number} userId - ID del usuario que actualiza (para logs).
   * @returns {Promise<Object>} Departamento actualizado.
   */
  async update(id, { nombre, descripcion, estado }, isAdmin, userId) {
    const departamento = await this.findById(id);
    if (!isAdmin && departamento.estado === 'inactivo') {
      throw new Error('No se puede actualizar un departamento inactivo sin permisos de admin');
    }

    const updates = [];
    const params = [];
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        throw new Error('El nombre del departamento es requerido');
      }
      if (nombre.length > 50) {
        throw new Error('El nombre del departamento no puede exceder 50 caracteres');
      }
      // Verificar unicidad (excluyendo el actual)
      const [existing] = await pool.query(
        'SELECT idDepartamento FROM Departamentos WHERE nombre = ? AND idDepartamento != ?',
        [nombre, id]
      );
      if (existing.length > 0) {
        throw new Error('Ya existe un departamento con ese nombre');
      }
      updates.push('nombre = ?');
      params.push(nombre);
    }
    if (descripcion !== undefined) {
      if (descripcion.length > 255) { // Límite razonable para TEXT
        throw new Error('La descripción no puede exceder 255 caracteres');
      }
      updates.push('descripcion = ?');
      params.push(descripcion);
    }
    if (estado !== undefined && (estado === 'activo' || estado === 'inactivo')) {
      if (!isAdmin && estado === 'inactivo') {
        throw new Error('Solo administradores pueden inactivar departamentos');
      }
      updates.push('estado = ?');
      params.push(estado);
    }
    if (updates.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    params.unshift(updates.join(', '));
    params.unshift(id);
    await pool.query(
      `UPDATE Departamentos SET ${updates.join(', ')} WHERE idDepartamento = ?`,
      params
    );

    // Log en historial
    const accion = estado === 'inactivo' ? 'Inactivación' : 'Actualización';
    await historialService.log(userId, id, `${accion} del departamento: ${departamento.nombre}`);
    return { ...departamento, ...(nombre && { nombre }), ...(descripcion && { descripcion }), ...(estado && { estado }) };
  },

  /**
   * Elimina (inactiva) un departamento.
   * @param {number} id - ID del departamento.
   * @param {number} userId - ID del usuario que elimina (para logs).
   * @returns {Promise<void>}
   */
  async delete(id, userId) {
    const departamento = await this.findById(id);
    if (departamento.estado === 'inactivo') {
      throw new Error('El departamento ya está inactivo');
    }
    // Soft delete: actualizar estado a 'inactivo'
    await pool.query(
      'UPDATE Departamentos SET estado = "inactivo" WHERE idDepartamento = ?',
      [id]
    );
    // Log en historial
    await historialService.log(userId, id, `Inactivación del departamento: ${departamento.nombre}`);
  }
};

module.exports = departamentosService;