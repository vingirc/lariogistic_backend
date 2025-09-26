const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authenticate, restrictTo } = require('../middleware/auth');
const { validateRegistro, validateUpdateUsuario, validatePasswordChange, validateAdminCreate } = require('../middleware/validate');
const { publicLimiter, registerLimiter, updateLimiter, passwordChangeLimiter, adminLimiter } = require('../middleware/rateLimit');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Devuelve una lista de todos los usuarios registrados. Solo accesible para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *             example:
 *               - idUsuario: 1
 *                 nombre: Juan Pérez
 *                 email: juan@financiera.com
 *                 telefono: +1234567890
 *                 direccion: Calle Falsa 123
 *                 idRol: 1
 *                 estado: activo
 *       403:
 *         description: Acceso denegado (no administrador)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: No tienes permisos para realizar esta acción
 *               code: 403
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.get('/', adminLimiter, authenticate, restrictTo(1), usuariosController.getAll);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Devuelve los detalles de un usuario. Los administradores pueden ver cualquier usuario, los clientes solo su propio perfil.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               idUsuario: 1
 *               nombre: Juan Pérez
 *               email: juan@financiera.com
 *               telefono: +1234567890
 *               direccion: Calle Falsa 123
 *               idRol: 1
 *               estado: activo
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: No tienes permisos para ver este usuario
 *               code: 403
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Usuario no encontrado
 *               code: 404
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.get('/:id', publicLimiter, authenticate, usuariosController.getById);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario (solo administradores)
 *     description: |
 *       Crea un nuevo usuario con un rol específico.
 *       Roles disponibles: 2 = Vendedor, 3 = Cliente.
 *       Solo accesible para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 8 caracteres)
 *               idRol:
 *                 type: integer
 *                 description: Rol del usuario (2 = Vendedor, 3 = Cliente)
 *                 enum: [2, 3]
 *             required: [nombre, email, password, idRol]
 *           example:
 *             nombre: María Gómez
 *             email: maria@financiera.com
 *             password: SecurePass123!
 *             idRol: 3
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               idUsuario: 2
 *               nombre: María Gómez
 *               email: maria@financiera.com
 *               idRol: 3
 *               estado: activo
 *       403:
 *         description: Acceso denegado (no administrador)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: No tienes permisos para realizar esta acción
 *               code: 403
 *       409:
 *         description: Correo ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El correo ya está registrado
 *               code: 409
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.post('/', adminLimiter, authenticate, restrictTo(1), validateAdminCreate, usuariosController.create);

/**
 * @swagger
 * /api/usuarios/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: |
 *       Registra un nuevo cliente en la plataforma.
 *       No requiere autenticación previa.
 *       El usuario registrado tendrá el rol de cliente (idRol = 3) por defecto.
 *       Límite de 5 registros por hora.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 8 caracteres, con letras y números)
 *             required: [nombre, email, password]
 *           example:
 *             nombre: Ana López
 *             email: ana.lopez@financiera.com
 *             password: SecurePass123!
 *     responses:
 *       201:
 *         description: Cliente registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               idUsuario: 2
 *               nombre: Ana López
 *               email: ana.lopez@financiera.com
 *               idRol: 3
 *               estado: activo
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El correo electrónico no es válido
 *               code: 400
 *       409:
 *         description: Correo ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El correo ya está registrado
 *               code: 409
 *       429:
 *         description: Demasiados intentos de registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados intentos, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.post('/register', registerLimiter, validateRegistro, usuariosController.register);

/**
 * @swagger
 * /api/usuarios/register-google:
 *   post:
 *     summary: Registrar un nuevo cliente con Google
 *     description: |
 *       Registra un nuevo cliente usando credenciales de Google.
 *       No requiere autenticación previa.
 *       Límite de 5 registros por hora.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico proporcionado por Google
 *               googleId:
 *                 type: string
 *                 description: ID único de Google
 *             required: [nombre, email, googleId]
 *           example:
 *             nombre: Ana López
 *             email: ana.lopez@financiera.com
 *             googleId: 1234567890
 *     responses:
 *       201:
 *         description: Cliente registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               idUsuario: 2
 *               nombre: Ana López
 *               email: ana.lopez@financiera.com
 *               idRol: 3
 *               estado: activo
 *       200:
 *         description: Usuario ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               idUsuario: 2
 *               nombre: Ana López
 *               email: ana.lopez@financiera.com
 *               idRol: 3
 *               estado: activo
 *       409:
 *         description: Correo ya registrado con otro método
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El correo ya está registrado con otro método
 *               code: 409
 *       429:
 *         description: Demasiados intentos de registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiados intentos, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.post('/register-google', registerLimiter, validateRegistro, usuariosController.registerWithGoogle);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar perfil de usuario
 *     description: |
 *       Actualiza los datos de un usuario.
 *       Los clientes pueden editar su propio perfil (nombre, teléfono, dirección, contraseña).
 *       Los administradores también pueden modificar el rol (1 = Admin, 2 = Vendedor, 3 = Cliente) y el estado.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               direccion:
 *                 type: string
 *                 description: Dirección del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *               idRol:
 *                 type: integer
 *                 description: Rol del usuario (solo administradores, 1 = Admin, 2 = Vendedor, 3 = Cliente)
 *                 enum: [1, 2, 3]
 *               estado:
 *                 type: string
 *                 description: Estado del usuario (solo administradores)
 *                 enum: [activo, inactivo]
 *           example:
 *             nombre: Ana López Actualizada
 *             telefono: +987654321
 *             direccion: Avenida Siempre Viva 456
 *             password: NewPass123!
 *             idRol: 3
 *             estado: activo
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               idUsuario: 2
 *               nombre: Ana López Actualizada
 *               email: ana.lopez@financiera.com
 *               telefono: +987654321
 *               direccion: Avenida Siempre Viva 456
 *               idRol: 3
 *               estado: activo
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Datos inválidos
 *               code: 400
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: No tienes permisos para modificar este usuario
 *               code: 403
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Usuario no encontrado
 *               code: 404
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.put('/:id', updateLimiter, authenticate, validateUpdateUsuario, usuariosController.update);

/**
 * @swagger
 * /api/usuarios/{id}/password:
 *   put:
 *     summary: Cambiar contraseña de usuario
 *     description: |
 *       Cambia la contraseña de un usuario.
 *       Los no administradores deben proporcionar la contraseña actual.
 *       Los administradores pueden cambiar la contraseña de cualquier usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual (requerida para no administradores)
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *             required: [newPassword]
 *           example:
 *             currentPassword: OldPass123!
 *             newPassword: NewPass123!
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *             example:
 *               message: Contraseña actualizada exitosamente
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: La nueva contraseña es requerida
 *               code: 400
 *       403:
 *         description: Acceso denegado o contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Contraseña actual incorrecta
 *               code: 403
 *       404:
 *         description: Registro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Usuario no encontrado
 *               code: 404
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.put('/:id/password', passwordChangeLimiter, authenticate, validatePasswordChange, usuariosController.updatePassword);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (soft delete)
 *     description: Marca un usuario como inactivo (soft delete). Solo accesible para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente (soft delete)
 *       403:
 *         description: Acceso denegado (no administrador)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: No tienes permisos para realizar esta acción
 *               code: 403
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Usuario no encontrado
 *               code: 404
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Demasiadas solicitudes, intenta de nuevo en 15 minutos
 *               code: 429
 */
router.delete('/:id', adminLimiter, authenticate, restrictTo(1), usuariosController.delete);

module.exports = router;