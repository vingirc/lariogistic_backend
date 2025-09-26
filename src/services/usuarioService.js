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
        estado,
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

    if (!idDepartamento) {
      const [rows] = await pool.query('SELECT idDepartamento FROM Usuarios WHERE idUsuario = ?', [adminId]);
      
      if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      idDepartamento = rows[0].idDepartamento;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const [result] = await pool.query(
      'INSERT INTO Usuarios (nombre, email, password, googleId, idRol, idDepartamento) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, googleId, idRol, idDepartamento]
    );
    return { idUsuario: result.insertId, nombre, email, idRol, idDepartamento };
  },

  async update(idUsuario, { nombre, telefono, direccion, password, idRol, estado, googleId }, isAdmin = false, adminId = null) {
    const user = await this.findById(idUsuario);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    // Prevent admins from modifying another admin's account
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
    if (googleId) {
      updates.push('googleId = ?');
      values.push(googleId);
    }
    // Only allow idRol and estado updates for non-admin users
    if (isAdmin && idRol && user.idRol !== 1) {
      if (![2, 3].includes(idRol)) {
        throw new Error('Rol inválido: Solo se pueden asignar roles de vendedor o cliente');
      }
      updates.push('idRol = ?');
      values.push(idRol);
    }
    if (isAdmin && estado && user.idRol !== 1) {
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new Error('Estado inválido: Solo se puede asignar activo o inactivo');
      }
      updates.push('estado = ?');
      values.push(estado);
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
    // Prevent admins from changing another admin's password (except their own)
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
    // Prevent admins from deleting another admin's account
    if (user.idRol === 1 && user.idUsuario !== adminId) {
      throw new Error('No se puede eliminar la cuenta de otro administrador');
    }
    const [result] = await pool.query('DELETE FROM Usuarios WHERE idUsuario = ?', [idUsuario]);
    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }
  },
};

module.exports = usuarioService;