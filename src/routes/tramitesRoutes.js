const express = require('express');
const TramitesController = require('../controllers/tramitesController');

const router = express.Router();
const { authenticate, restrictTo } = require('../middleware/auth');
const { publicLimiter, privateLimiter } = require('../middleware/rateLimit');

// Obtener tipos de trámites disponibles
router.get('/tipos', authenticate, restrictTo(1), privateLimiter, TramitesController.obtenerTiposTramites);

// Obtener trámites de un usuario
router.get('/usuario/:idUsuario', authenticate, restrictTo(1), privateLimiter, TramitesController.obtenerTramitesPorUsuario);

// Crear nuevo trámite
router.post('/', authenticate, restrictTo(1), privateLimiter, TramitesController.crearTramite);

// Actualizar estado de trámite
router.patch('/:idTramite/estado', authenticate, restrictTo(1), privateLimiter, TramitesController.actualizarEstadoTramite);

module.exports = router;