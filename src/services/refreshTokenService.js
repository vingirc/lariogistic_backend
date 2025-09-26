const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { privateKey } = require('../utils/env');

const refreshTokenService = {
  async create(idUsuario) {
    const token = jwt.sign(
      { idUsuario },
      privateKey,
      { algorithm: 'RS256', expiresIn: '7d' } // Usa RS256
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO RefreshTokens (idUsuario, token, fechaExpiracion) VALUES (?, ?, ?)',
      [idUsuario, token, expiresAt]
    );
    return token;
  },

  async verify(token) {
    const [rows] = await pool.query(
      'SELECT * FROM RefreshTokens WHERE token = ? AND activo = TRUE AND fechaExpiracion > NOW()',
      [token]
    );
    if (!rows[0]) {
      throw new Error('Token de refresco inválido o expirado');
    }
    return rows[0];
  },

  async revoke(idUsuario) {
    await pool.query('UPDATE RefreshTokens SET activo = FALSE WHERE idUsuario = ?', [idUsuario]);
  },
};

module.exports = refreshTokenService;