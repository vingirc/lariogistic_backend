const TramitesService = require('../services/tramitesService');

class TramitesController {
    // Obtener todos los trámites de un usuario
    static async obtenerTramitesPorUsuario(req, res) {
        try {
            const { idUsuario } = req.params;
            
            // Validar parámetro
            if (!idUsuario || isNaN(idUsuario)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }
            
            const tramites = await TramitesService.obtenerTramitesPorUsuario(idUsuario);
            
            res.status(200).json({
                success: true,
                data: tramites
            });
        } catch (error) {
            console.error('Error al obtener trámites:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear nuevo trámite
    static async crearTramite(req, res) {
        try {
            const { 
                idUsuario, 
                idTipoTramite, 
                descripcion, 
                fechaInicio, 
                fechaFin 
            } = req.body;

            // Validaciones básicas
            if (!idUsuario || !idTipoTramite) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y tipo de trámite son requeridos'
                });
            }

            // Validar que el tipo de trámite existe
            const tipoTramiteExiste = await TramitesService.existeTipoTramite(idTipoTramite);
            if (!tipoTramiteExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de trámite especificado no existe'
                });
            }

            const datosTrami = {
                idUsuario,
                idTipoTramite,
                descripcion,
                fechaInicio,
                fechaFin
            };

            const tramiteCreado = await TramitesService.crearTramite(datosTrami);

            res.status(201).json({
                success: true,
                message: 'Trámite creado exitosamente',
                data: tramiteCreado
            });

        } catch (error) {
            console.error('Error al crear trámite:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar estado de trámite
    static async actualizarEstadoTramite(req, res) {
        try {
            const { idTramite } = req.params;
            const { estado } = req.body;

            // Validaciones
            if (!idTramite || isNaN(idTramite)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de trámite inválido'
                });
            }

            // Validar estado
            const estadosValidos = ['pendiente', 'aprobado', 'rechazado', 'en revision'];
            if (!estado || !estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado no válido. Estados permitidos: ' + estadosValidos.join(', ')
                });
            }

            // Verificar que el trámite existe
            const tramiteExiste = await TramitesService.existeTramite(idTramite);
            if (!tramiteExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Trámite no encontrado'
                });
            }

            const actualizado = await TramitesService.actualizarEstadoTramite(idTramite, estado);

            if (!actualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'No se pudo actualizar el trámite'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Estado actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener tipos de trámites disponibles
    static async obtenerTiposTramites(req, res) {
        try {
            const tipos = await TramitesService.obtenerTiposTramites();
            
            res.status(200).json({
                success: true,
                data: tipos
            });
        } catch (error) {
            console.error('Error al obtener tipos de trámites:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener trámite por ID
    static async obtenerTramitePorId(req, res) {
        try {
            const { idTramite } = req.params;
            
            if (!idTramite || isNaN(idTramite)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de trámite inválido'
                });
            }
            
            const tramite = await TramitesService.obtenerTramitePorId(idTramite);
            
            if (!tramite) {
                return res.status(404).json({
                    success: false,
                    message: 'Trámite no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                data: tramite
            });
        } catch (error) {
            console.error('Error al obtener trámite por ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = TramitesController;