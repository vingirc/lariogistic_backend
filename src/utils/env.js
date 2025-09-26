const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { Settings } = require('luxon');

dotenv.config();

// Set luxon default time zone
Settings.defaultZone = process.env.APP_TIMEZONE || 'America/Mexico_City';

const validateEnv = (requiredVars) => {
  const missing = requiredVars.filter(varName => !process.env[varName] && varName !== 'DB_PASSWORD');
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'PORT',
  'NODE_ENV',
  'APP_TIMEZONE', // Replaced TZ
  ...(process.env.NODE_ENV !== 'development' ? ['JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY'] : []),
];

validateEnv(requiredVars);

let privateKey, publicKey;

if (process.env.NODE_ENV === 'development') {
  try {
    privateKey = fs.readFileSync(path.join(__dirname, '../../keys/private.pem'), 'utf8');
    publicKey = fs.readFileSync(path.join(__dirname, '../../keys/public.pem'), 'utf8');
  } catch (err) {
    throw new Error('Failed to load PEM files: ' + err.message);
  }
} else {
  privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
}

module.exports = {
  validateEnv,
  dbConfig: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  },
  cloudinaryConfig: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  privateKey,
  publicKey,
};