// src/services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { privateKey } = require('../utils/env');
const usuarioService = require('./usuarioService');
const refreshTokenService = require('./refreshTokenService');

const authService = {
  async loginWithPassword(email, password) {
    const user = await usuarioService.findByEmail(email);
    if (!user || user.estado !== 'activo') {
      throw new Error('Credenciales inválidas');
    }
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Credenciales inválidas');
    }
    const accessToken = jwt.sign(
      { idUsuario: user.idUsuario, idRol: user.idRol },
      privateKey,
      { algorithm: 'RS256', expiresIn: '1h' }
    );
    const refreshToken = await refreshTokenService.create(user.idUsuario);
    const { password: userPassword, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  },

  async loginWithGoogle(googleId, email, nombre) {
    let user = await usuarioService.findByEmail(email);
    if (!user) {
      user = await usuarioService.createClient({
        nombre,
        email,
        googleId,
        idRol: 3, // Cliente
      });
    } else if (user.estado !== 'activo') {
      throw new Error('Usuario inactivo');
    } else if (user.googleId !== googleId) {
      throw new Error('El correo ya está registrado con otro método');
    }
    
    const accessToken = jwt.sign(
      { idUsuario: user.idUsuario, idRol: user.idRol },
      privateKey,
      { algorithm: 'RS256', expiresIn: '1h' }
    );
    const refreshToken = await refreshTokenService.create(user.idUsuario);
    const { password: userPassword, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  },

  async refreshToken(token) {
    const tokenData = await refreshTokenService.verify(token);
    const user = await usuarioService.findById(tokenData.idUsuario);
    if (!user || user.estado !== 'activo') {
      throw new Error('Usuario inválido o inactivo');
    }
    const accessToken = jwt.sign(
      { idUsuario: user.idUsuario, idRol: user.idRol },
      privateKey,
      { algorithm: 'RS256', expiresIn: '1h' }
    );
    const { password: userPassword, ...safeUser } = user;
    return { accessToken, user: safeUser };
  },

  async handleGoogleCallback(code) {
    const oAuth2Client = new OAuth2Client(
      google.clientId,
      google.clientSecret,
      google.mobileRedirectUri
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const userInfo = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: google.clientId,
    });
    const { sub: googleId, email, name: displayName } = userInfo.getPayload();

    return await this.loginWithGoogle(googleId, email, displayName);
  },
};

module.exports = authService;