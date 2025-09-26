const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('../config/auth');
const authService = require('../services/authService');

passport.use(new GoogleStrategy({
  clientID: google.clientId,
  clientSecret: google.clientSecret,
  callbackURL: google.redirectUri,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, emails, displayName } = profile;
    const email = emails[0].value;
    const userData = await authService.loginWithGoogle(id, email, displayName);
    done(null, userData);
  } catch (err) {
    done(err);
  }
}));

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.loginWithPassword(email, password);
      res.json({
        success: true,
        data: { accessToken, refreshToken, user },
        message: 'Inicio de sesión exitoso',
      });
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const { accessToken, user } = await authService.refreshToken(refreshToken);
      res.json({
        success: true,
        data: { accessToken, user },
        message: 'Token refrescado con éxito',
      });
    } catch (err) {
      next(err);
    }
  }
};