// Guardar las configuraciones de Google OAuth
// Agregar al .env:
// GOOGLE_CLIENT_ID=your-google-client-id
// GOOGLE_CLIENT_SECRET=your-google-client-secret

const { validateEnv } = require('../utils/env');

validateEnv(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']);

module.exports = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.NODE_ENV === 'production'
      ? 'https://financiera-backend.vercel.app/api/auth/google/callback'
      : 'http://localhost:3000/api/auth/google/callback',
    mobileRedirectUri: 'com.carsget.financiamiento:/oauthredirect',
  },
};