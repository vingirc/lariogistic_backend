// src/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentosController');
const { authenticate, restrictTo } = require('../middleware/auth');
const { validateDocumentoCreate, validateDocumentoUpdate } = require('../middleware/validate');
const { multipleUpload } = require('../middleware/uploadMiddleware');
const { publicLimiter } = require('../middleware/rateLimit'); // Asumiendo limiter para auth users

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Listar todos los documentos
 *     description: Devuelve una lista de todos los documentos adjuntos a trámites, con info del solicitante.
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Documento'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, restrictTo(1, 2, 3), publicLimiter, documentosController.getAll);

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Obtener un documento por ID
 *     description: Devuelve los detalles de un documento específico.
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Detalles del documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, restrictTo(1, 2, 3), publicLimiter, documentosController.getById);

/**
 * @swagger
 * /api/documentos:
 *   post:
 *     summary: Adjuntar documentos a un trámite
 *     description: Sube múltiples archivos (imágenes/PDFs) a un trámite específico. Soporta hasta 5 archivos de 5MB cada uno.
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idTramite:
 *                 type: integer
 *                 description: ID del trámite al que adjuntar
 *               archivos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos a subir (JPEG, PNG, GIF, PDF)
 *             required: [idTramite]
 *     responses:
 *       201:
 *         description: Documentos adjuntados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Documento'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticate,
  restrictTo(1, 2, 3),
  multipleUpload,
  validateDocumentoCreate,
  documentosController.create
);

/**
 * @swagger
 * /api/documentos/{id}:
 *   put:
 *     summary: Actualizar un documento
 *     description: Reemplaza o actualiza metadatos de un documento existente.
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idTramite:
 *                 type: integer
 *                 description: Nuevo ID de trámite (solo admins)
 *               retained:
 *                 type: boolean
 *                 description: Si true, retiene el archivo actual (default true)
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo para reemplazar
 *             required: [retained]
 *     responses:
 *       200:
 *         description: Documento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  authenticate,
  restrictTo(1, 2, 3),
  multipleUpload, // Reutilizando para single o multiple, pero para update quizás single
  validateDocumentoUpdate,
  documentosController.update
);

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Eliminar un documento
 *     description: Elimina un documento y su archivo de Cloudinary.
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       204:
 *         description: Documento eliminado
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticate, restrictTo(1, 2, 3), publicLimiter, documentosController.delete);

module.exports = router;