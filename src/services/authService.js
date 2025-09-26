const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { privateKey, google } = require('../utils/env');
const usuarioService = require('./usuarioService');
const refreshTokenService = require('./refreshTokenService');
const { OAuth2Client } = require('google-auth-library');

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
      throw new Error('Usuario no registrado. Contacte al administrador.');
    }
    
    if (user.estado !== 'activo') {
      throw new Error('Usuario inactivo');
    }
    
    // If user exists but has no googleId, update with the provided googleId
    if (!user.googleId) {
      await usuarioService.update(user.idUsuario, { googleId });
      user = await usuarioService.findByEmail(email);
    } else if (user.googleId !== googleId) {
      throw new Error('El correo está asociado a un ID de Google diferente');
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
    try {
      const oAuth2Client = new OAuth2Client(
        google.clientId,
        google.clientSecret,
        google.redirectUri // Updated to use redirectUri
      );

      const { tokens } = await oAuth2Client.getToken(code).catch(err => {
        console.error('Token exchange error:', err.response?.data || err.message);
        throw new Error(`Unauthorized: Token exchange failed - ${err.message}`);
      });
      oAuth2Client.setCredentials(tokens);

      const userInfo = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: google.clientId,
      }).catch(err => {
        console.error('ID token verification error:', err.response?.data || err.message);
        throw new Error(`Unauthorized: ID token verification failed - ${err.message}`);
      });

      const { sub: googleId, email, name: displayName } = userInfo.getPayload();
      return await this.loginWithGoogle(googleId, email, displayName);
    } catch (error) {
      console.error('Google callback error:', error);
      throw new Error(`Unauthorized: ${error.message}`);
    }
  },
};

module.exports = authService;