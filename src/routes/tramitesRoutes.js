const express = require('express');
const TramitesController = require('../controllers/tramitesController');

const router = express.Router();

// Obtener tipos de trámites disponibles
router.get('/tipos', TramitesController.obtenerTiposTramites);

// Obtener trámites de un usuario
router.get('/usuario/:idUsuario', TramitesController.obtenerTramitesPorUsuario);

// Crear nuevo trámite
router.post('/', TramitesController.crearTramite);

// Actualizar estado de trámite
router.patch('/:idTramite/estado', TramitesController.actualizarEstadoTramite);

module.exports = router;