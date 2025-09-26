const pool = require('../config/db');
const bcrypt = require('bcrypt');

const usuarioService = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        idUsuario, 
        nombre, 
        email, 
        idRol, 
        estado, 
        telefono, 
        direccion,
        idDepartamento,
        googleId
      FROM Usuarios
      WHERE idRol != 1
      ORDER BY nombre DESC
    `);
    return rows;
  },

  async findById(idUsuario) {
    const [rows] = await pool.query(`
      SELECT 
        idUsuario, 
        nombre, 
        email, 
        telefono, 
        direccion, 
        idRol, 
        estado, 
        password, 
        idDepartamento,
        googleId
      FROM Usuarios
      WHERE idUsuario = ?
    `, [idUsuario]);
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`
      SELECT 
        idUsuario, 
        nombre, 
        email, 
        telefono, 
        direccion, 
        idRol, 
        estado, 
        password, 
        idDepartamento,
        googleId
      FROM Usuarios
      WHERE email = ?
    `, [email]);
    return rows[0];
  },

  async create({ nombre, email, password, googleId, idRol = 3, idDepartamento = null }, adminId = null) {
    if (![2, 3].includes(idRol)) {
      throw new Error('Rol inválido');
    }

    // Modificado: Solo consultar departamento si adminId existe y no se proporciona idDepartamento
    if (!idDepartamento && adminId) {
      const [rows] = await pool.query('SELECT idDepartamento FROM Usuarios WHERE idUsuario = ?', [adminId]);
      if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      idDepartamento = rows[0].idDepartamento;
    }
    // Si no hay adminId (e.g., registro Google), idDepartamento queda en null

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const [result] = await pool.query(
      'INSERT INTO Usuarios (nombre, email, password, googleId, idRol, idDepartamento) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, googleId, idRol, idDepartamento]
    );
    // Retornar datos completos consultando findById para consistencia
    return await this.findById(result.insertId);
  },

  async update(idUsuario, { nombre, telefono, direccion, password, idRol, estado, googleId, idDepartamento }, isAdmin = false, adminId = null) {
    const user = await this.findById(idUsuario);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    // Prevenir que admins modifiquen otra cuenta de admin
    if (isAdmin && user.idRol === 1 && user.idUsuario !== adminId) {
      throw new Error('No se puede modificar la cuenta de otro administrador');
    }
    const updates = [];
    const values = [];
    
    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (telefono) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (direccion) {
      updates.push('direccion = ?');
      values.push(direccion);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (googleId !== undefined) {
      updates.push('googleId = ?');
      values.push(googleId);
    }
    // Solo permitir actualizaciones de idRol y estado para usuarios no-admin
    if (isAdmin && idRol !== undefined && user.idRol !== 1) {
      if (![2, 3].includes(idRol)) {
        throw new Error('Rol inválido: Solo se pueden asignar roles de gerente o empleado');
      }
      updates.push('idRol = ?');
      values.push(idRol);
    }
    if (isAdmin && estado !== undefined && user.idRol !== 1) {
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new Error('Estado inválido: Solo se puede asignar activo o inactivo');
      }
      updates.push('estado = ?');
      values.push(estado);
    }
    // Nueva lógica: Permitir a admins actualizar idDepartamento para usuarios no-admin
    if (isAdmin && idDepartamento !== undefined && user.idRol !== 1) {
      updates.push('idDepartamento = ?');
      values.push(idDepartamento);
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(idUsuario);
    const query = `UPDATE Usuarios SET ${updates.join(', ')} WHERE idUsuario = ?`;
    const [result] = await pool.query(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }
    return await this.findById(idUsuario);
  },

  async updatePassword(idUsuario, currentPassword, newPassword, isAdmin = false, adminId = null) {
    const user = await this.findById(idUsuario);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    // Prevenir que admins cambien contraseña de otro admin (excepto la propia)
    if (isAdmin && user.idRol === 1 && user.idUsuario !== adminId) {
      throw new Error('No se puede cambiar la contraseña de otro administrador');
    }
    if (!isAdmin && (!user.password || !(await bcrypt.compare(currentPassword, user.password)))) {
      throw new Error('Contraseña actual incorrecta');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const [result] = await pool.query(
      'UPDATE Usuarios SET password = ? WHERE idUsuario = ?',
      [hashedPassword, idUsuario]
    );
    if (result.affectedRows === 0) {
      throw new Error('Error al actualizar la contraseña');
    }
  },

  async delete(idUsuario, adminId = null) {
    const user = await this.findById(idUsuario);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    // Prevenir que admins eliminen otra cuenta de admin
    if (user.idRol === 1 && user.idUsuario !== adminId) {
      throw new Error('No se puede eliminar la cuenta de otro administrador');
    }
    // Cambiado a soft delete: actualizar estado a 'inactivo' en lugar de DELETE para trazabilidad
    const [result] = await pool.query('UPDATE Usuarios SET estado = "inactivo" WHERE idUsuario = ?', [idUsuario]);
    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }
  },
};

module.exports = usuarioService;