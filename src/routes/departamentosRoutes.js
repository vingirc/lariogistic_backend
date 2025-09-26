const express = require('express');
const router = express.Router();
const departamentosController = require('../controllers/departamentosController');
const { authenticate, restrictTo } = require('../middleware/auth');
const { validateDepartamentoCreate, validateDepartamentoUpdate } = require('../middleware/validate');
const { publicLimiter, privateLimiter } = require('../middleware/rateLimit');

/**
 * @swagger
 * components:
 *   schemas:
 *     Departamento:
 *       type: object
 *       properties:
 *         idDepartamento:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Ventas"
 *         descripcion:
 *           type: string
 *           example: "Departamento de ventas y marketing"
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           example: "2025-09-26T10:00:00Z"
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           example: "activo"
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
 * /api/departamentos:
 *   get:
 *     summary: Listar todos los departamentos
 *     description: Obtiene la lista completa de departamentos (solo administradores)
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de departamentos
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
 *                     $ref: '#/components/schemas/Departamento'
 *                 message:
 *                   type: string
 *                   example: "Departamentos obtenidos con éxito"
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Límite de tasa excedido
 */
router.get('/', authenticate, restrictTo([1]), publicLimiter, departamentosController.getAll);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   get:
 *     summary: Obtener un departamento por ID
 *     description: Detalles de un departamento específico (solo administradores)
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Departamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Departamento'
 *                 message:
 *                   type: string
 *                   example: "Departamento obtenido con éxito"
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
router.get('/:id', authenticate, restrictTo([1]), publicLimiter, departamentosController.getById);

/**
 * @swagger
 * /api/departamentos:
 *   post:
 *     summary: Crear un nuevo departamento
 *     description: Crea un departamento nuevo (solo administradores)
 *     tags: [Departamentos]
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
 *                 example: "Ventas"
 *               descripcion:
 *                 type: string
 *                 example: "Departamento de ventas y marketing"
 *             required:
 *               - nombre
 *     responses:
 *       201:
 *         description: Departamento creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Departamento'
 *                 message:
 *                   type: string
 *                   example: "Departamento creado con éxito"
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
router.post('/', authenticate, restrictTo([1]), privateLimiter, validateDepartamentoCreate, departamentosController.create);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   put:
 *     summary: Actualizar un departamento
 *     description: Actualiza datos de un departamento existente (solo administradores)
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Ventas Actualizado"
 *               descripcion:
 *                 type: string
 *                 example: "Departamento actualizado"
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *                 example: "activo"
 *     responses:
 *       200:
 *         description: Departamento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Departamento'
 *                 message:
 *                   type: string
 *                   example: "Departamento actualizado con éxito"
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
router.put('/:id', authenticate, restrictTo([1]), privateLimiter, validateDepartamentoUpdate, departamentosController.update);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   delete:
 *     summary: Inactivar un departamento
 *     description: Inactiva un departamento (soft delete, solo administradores)
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Departamento inactivado
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
 *                   example: "Departamento inactivado con éxito"
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
router.delete('/:id', authenticate, restrictTo([1]), privateLimiter, departamentosController.delete);

module.exports = router;