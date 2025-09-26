const express = require('express');
const router = express.Router();
const tramitesController = require('../controllers/tramitesController');
const { authenticate, restrictTo } = require('../middleware/auth');
// const { validateTramiteCreate, validateTramiteUpdate } = require('../middleware/validate'); // Agregar estos en validate.js
const { privateLimiter } = require('../middleware/rateLimit'); // Usa privateLimiter para autenticados

/**
 * @swagger
 * tags:
 *   name: Tramites
 *   description: Operaciones CRUD para trámites (solicitudes de vacaciones, permisos, etc.)
 * components:
 *   schemas:
 *     Tramite:
 *       type: object
 *       properties:
 *         idTramite:
 *           type: integer
 *           example: 1
 *         idUsuario:
 *           type: integer
 *           example: 3
 *         idTipoTramite:
 *           type: integer
 *           example: 1
 *         fechaSolicitud:
 *           type: string
 *           format: date
 *           example: "2025-09-26"
 *         estado:
 *           type: string
 *           enum: [pendiente, aprobado, rechazado, en revision]
 *           example: pendiente
 *         descripcion:
 *           type: string
 *           example: "Solicitud de vacaciones anuales"
 *         fechaInicio:
 *           type: string
 *           format: date
 *           example: "2025-10-01"
 *         fechaFin:
 *           type: string
 *           format: date
 *           example: "2025-10-05"
 *         solicitante:
 *           type: string
 *           example: "Juan Pérez"
 *         tipoTramite:
 *           type: string
 *           example: "Vacaciones"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Error descriptivo"
 *         code:
 *           type: string
 *           example: "ValidationError"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-09-26T10:00:00.000Z"
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */

/**
 * @swagger
 * /api/tramites:
 *   get:
 *     summary: Listar todos los trámites
 *     tags: [Tramites]
 *     security:
 *       - bearerAuth: []
 *     # Authorization header is provided via the global bearerAuth security scheme in the Swagger UI
 *     responses:
 *       200:
 *         description: Lista de trámites obtenida
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
 *                     $ref: '#/components/schemas/Tramite'
 *                 message:
 *                   type: string
 *                   example: "Trámites obtenidos con éxito"
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, privateLimiter, tramitesController.getAll);

/**
 * @swagger
 * /api/tramites/{id}:
 *   get:
 *     summary: Obtener un trámite por ID
 *     tags: [Tramites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trámite
 *     responses:
 *       200:
 *         description: Trámite obtenido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tramite'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, privateLimiter, tramitesController.getById);

/**
 * @swagger
 * /api/tramites:
 *   post:
 *     summary: Crear un nuevo trámite
 *     tags: [Tramites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idTipoTramite:
 *                 type: integer
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 example: "Solicitud de vacaciones"
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-01"
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-05"
 *             required: [idTipoTramite, fechaInicio, fechaFin]
 *     responses:
 *       201:
 *         description: Trámite creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tramite'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, restrictTo(3), privateLimiter, tramitesController.create);
// router.post('/', authenticate, validateTramiteCreate, privateLimiter, tramitesController.create);

/**
 * @swagger
 * /api/tramites/{id}:
 *   put:
 *     summary: Actualizar un trámite (e.g., aprobar/rechazar)
 *     tags: [Tramites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trámite
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [aprobado, rechazado, en revision]
 *                 example: aprobado
 *               observaciones:
 *                 type: string
 *                 example: "Aprobado con reservas"
 *             required: [estado]
 *     responses:
 *       200:
 *         description: Trámite actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tramite'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticate, privateLimiter, tramitesController.update);
// router.put('/:id', authenticate, validateTramiteUpdate, privateLimiter, tramitesController.update);

/**
 * @swagger
 * /api/tramites/{id}:
 *   delete:
 *     summary: Eliminar un trámite (solo admins)
 *     tags: [Tramites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trámite
 *     responses:
 *       200:
 *         description: Trámite eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Trámite eliminado con éxito"
 *                     idTramite:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: "Trámite eliminado con éxito"
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticate, restrictTo(1), tramitesController.delete);
// router.delete('/:id', authenticate, restrictTo(1), privateLimiter, tramitesController.delete);

module.exports = router;