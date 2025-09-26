const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { authenticate, restrictTo } = require('../middleware/auth');
const { validateHistorialCreate, validateHistorialUpdate } = require('../middleware/validate');
const { publicLimiter, privateLimiter } = require('../middleware/rateLimit');

/**
 * @swagger
 * components:
 *   schemas:
 *     Historial:
 *       type: object
 *       properties:
 *         idHistorial:
 *           type: integer
 *           example: 1
 *         idUsuario:
 *           type: integer
 *           example: 1
 *         idTramite:
 *           type: integer
 *           example: 5
 *         accion:
 *           type: string
 *           example: "Creación de trámite"
 *         descripcion:
 *           type: string
 *           example: "Solicitud de vacaciones enviada"
 *         fechaAccion:
 *           type: string
 *           format: date-time
 *           example: "2025-09-26T10:00:00Z"
 *         usuarioNombre:
 *           type: string
 *           example: "Juan Pérez"
 *         idTipoTramite:
 *           type: integer
 *           example: 1
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error descriptivo"
 */

/**
 * @swagger
 * /api/historial:
 *   get:
 *     summary: Listar todos los registros del historial
 *     description: Obtiene la lista completa del historial (administradores y gerentes)
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de historial
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Historial'
 *                 message:
 *                   type: string
 *                   example: "Historial obtenido con éxito"
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Límite de tasa excedido
 */
router.get('/', authenticate, restrictTo([1, 2]), publicLimiter, historialController.getAll);

/**
 * @swagger
 * /api/historial/{id}:
 *   get:
 *     summary: Obtener un registro del historial por ID
 *     description: Detalles de un registro específico (administradores y gerentes)
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Registro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Historial'
 *                 message:
 *                   type: string
 *                   example: "Registro de historial obtenido con éxito"
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, restrictTo([1, 2]), publicLimiter, historialController.getById);

/**
 * @swagger
 * /api/historial:
 *   post:
 *     summary: Crear un nuevo registro en el historial
 *     description: Crea un log manual (solo administradores)
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idUsuario:
 *                 type: integer
 *                 example: 1
 *               idTramite:
 *                 type: integer
 *                 example: 5
 *               accion:
 *                 type: string
 *                 example: "Aprobación de trámite"
 *               descripcion:
 *                 type: string
 *                 example: "Aprobado por gerente"
 *             required:
 *               - idUsuario
 *               - accion
 *     responses:
 *       201:
 *         description: Registro creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Historial'
 *                 message:
 *                   type: string
 *                   example: "Registro de historial creado con éxito"
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Límite de tasa excedido
 */
router.post('/', authenticate, restrictTo(1), privateLimiter, validateHistorialCreate, historialController.create);

/**
 * @swagger
 * /api/historial/{id}:
 *   put:
 *     summary: Actualizar un registro del historial
 *     description: Actualiza un log (solo administradores)
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accion:
 *                 type: string
 *                 example: "Actualización de aprobación"
 *               descripcion:
 *                 type: string
 *                 example: "Modificado por admin"
 *     responses:
 *       200:
 *         description: Registro actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Historial'
 *                 message:
 *                   type: string
 *                   example: "Registro de historial actualizado con éxito"
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Límite de tasa excedido
 */
router.put('/:id', authenticate, restrictTo(1), privateLimiter, validateHistorialUpdate, historialController.update);

/**
 * @swagger
 * /api/historial/{id}:
 *   delete:
 *     summary: Eliminar un registro del historial
 *     description: Elimina un log (solo administradores)
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Registro eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Registro de historial eliminado con éxito"
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Límite de tasa excedido
 */
router.delete('/:id', authenticate, restrictTo(1), privateLimiter, historialController.delete);

module.exports = router;