const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimit');
const { validateLogin, validateRefresh } = require('../middleware/validate');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     description: Autentica a un usuario y devuelve un token de acceso y un token de refresco. Límite de 5 intentos por hora.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (mínimo 8 caracteres)
 *             required: [email, password]
 *           example:
 *             email: usuario@lariogistic.com
 *             password: Password123!
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 idUsuario: 1
 *                 nombre: Juan Pérez
 *                 email: usuario@lariogistic.com
 *                 idRol: 3
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El correo o la contraseña son requeridos
 *               code: 400
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Correo o contraseña incorrectos
 *               code: 401
 *       429:
 *         description: Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados intentos, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.post('/login', loginLimiter, validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Iniciar autenticación con Google
 *     description: Redirige al usuario a la página de autenticación de Google para OAuth 2.0.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirige a Google
 *         headers:
 *           Location:
 *             description: URL de redirección a Google
 *             schema:
 *               type: string
 *               format: uri
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback de Google OAuth para web
 *     description: Maneja la respuesta de Google tras la autenticación web y devuelve tokens y datos del usuario.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 idUsuario: 1
 *                 nombre: Juan Pérez
 *                 email: usuario@lariogistic.com
 *                 idRol: 3
 *               idUsuario: 1
 *       401:
 *         description: Autenticación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Autenticación con Google fallida
 *               code: 401
 */
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const { accessToken, refreshToken, user } = req.user;
  const redirectUrl = process.env.NODE_ENV === 'production'
    ? `https://carsget.com/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&idUsuario=${user.idUsuario}`
    : `http://localhost:4200/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&idUsuario=${user.idUsuario}`;
  res.redirect(redirectUrl);
});

/**
 * @swagger
 * /api/auth/google/callback:
 *   post:
 *     summary: Callback de Google OAuth para móviles
 *     description: Procesa el código de autorización de Google enviado desde la app móvil y devuelve tokens y datos del usuario. Límite de 5 intentos por hora.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código de autorización de Google
 *             required: [code]
 *           example:
 *             code: 4/0AX4Xf...
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 idUsuario: 1
 *                 nombre: Juan Pérez
 *                 email: usuario@lariogistic.com
 *                 idRol: 3
 *               idUsuario: 1
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Código de autorización requerido
 *               code: 400
 *       401:
 *         description: Autenticación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Autenticación con Google fallida
 *               code: 401
 *       429:
 *         description: Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados intentos, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.post('/google/callback', loginLimiter, authController.googleCallbackMobile);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     description: Genera un nuevo token de acceso usando un token de refresco válido. Límite de 5 intentos por hora.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco JWT
 *             required: [refreshToken]
 *           example:
 *             refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Nuevo token de acceso generado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 idUsuario: 1
 *                 nombre: Juan Pérez
 *                 email: usuario@lariogistic.com
 *                 idRol: 3
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El token de refresco es requerido
 *               code: 400
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Token de refresco inválido
 *               code: 401
 *       429:
 *         description: Demasiados intentos de refresco
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados intentos, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.post('/refresh', loginLimiter, validateRefresh, authController.refresh);

module.exports = router;