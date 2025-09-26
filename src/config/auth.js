const { validateEnv } = require('../utils/env');

validateEnv(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']);

module.exports = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.NODE_ENV === 'production'
      ? 'https://lariogistic-backend.vercel.app/api/auth/google/callback'
      : 'http://localhost:3000/api/auth/google/callback',
  },
};