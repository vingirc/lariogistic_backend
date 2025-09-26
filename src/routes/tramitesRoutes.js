const express = require('express');
const TramitesController = require('../controllers/tramitesController');

const router = express.Router();
const { authenticate, restrictTo } = require('../middleware/auth');
const { publicLimiter, privateLimiter } = require('../middleware/rateLimit');

// Obtener tipos de trámites disponibles
router.get('/tipos', authenticate, restrictTo(1, 2, 3), privateLimiter, TramitesController.obtenerTiposTramites);

// **ESTA ES LA RUTA QUE NECESITAS AGREGAR**
router.get('/mis-tramites', authenticate, restrictTo(1, 2, 3), privateLimiter, TramitesController.obtenerMisTramites);

// Otras rutas...
router.get('/usuario/:idUsuario', authenticate, restrictTo(1), privateLimiter, TramitesController.obtenerTramitesPorUsuario);
router.get('/:idTramite', authenticate, restrictTo(1, 2, 3), privateLimiter, TramitesController.obtenerTramitePorId);
router.post('/', authenticate, restrictTo(1, 2, 3), privateLimiter, TramitesController.crearTramite);
router.patch('/:idTramite/estado', authenticate, restrictTo(1, 2), privateLimiter, TramitesController.actualizarEstadoTramite);

module.exports = router;