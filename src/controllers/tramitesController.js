const db = require('../config/database');

class TramitesController {
    // Obtener todos los trámites de un usuario
    static async obtenerTramitesPorUsuario(req, res) {
        try {
            const { idUsuario } = req.params;
            
            const query = `
                SELECT 
                    t.idTramite,
                    t.idUsuario,
                    t.fechaSolicitud,
                    t.estado,
                    t.descripcion,
                    t.fechaInicio,
                    t.fechaFin,
                    tt.nombre as tipoTramite
                FROM Tramites t
                INNER JOIN TiposTramites tt ON t.idTipoTramite = tt.idTipoTramite
                WHERE t.idUsuario = ?
                ORDER BY t.fechaSolicitud DESC
            `;
            
            const [tramites] = await db.execute(query, [idUsuario]);
            
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

            const query = `
                INSERT INTO Tramites (
                    idUsuario, 
                    idTipoTramite, 
                    descripcion, 
                    fechaInicio, 
                    fechaFin
                ) VALUES (?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                idUsuario,
                idTipoTramite,
                descripcion || null,
                fechaInicio || null,
                fechaFin || null
            ]);

            // Obtener el trámite recién creado con información completa
            const tramiteCreado = await TramitesController.obtenerTramitePorId(result.insertId);

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

    // Obtener trámite por ID (método auxiliar)
    static async obtenerTramitePorId(idTramite) {
        try {
            const query = `
                SELECT 
                    t.idTramite,
                    t.idUsuario,
                    t.fechaSolicitud,
                    t.estado,
                    t.descripcion,
                    t.fechaInicio,
                    t.fechaFin,
                    tt.nombre as tipoTramite
                FROM Tramites t
                INNER JOIN TiposTramites tt ON t.idTipoTramite = tt.idTipoTramite
                WHERE t.idTramite = ?
            `;
            
            const [tramites] = await db.execute(query, [idTramite]);
            return tramites[0];
        } catch (error) {
            console.error('Error al obtener trámite por ID:', error);
            throw error;
        }
    }

    // Actualizar estado de trámite
    static async actualizarEstadoTramite(req, res) {
        try {
            const { idTramite } = req.params;
            const { estado } = req.body;

            // Validar estado
            const estadosValidos = ['pendiente', 'aprobado', 'rechazado', 'en revision'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado no válido'
                });
            }

            const query = `
                UPDATE Tramites 
                SET estado = ?
                WHERE idTramite = ?
            `;

            const [result] = await db.execute(query, [estado, idTramite]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Trámite no encontrado'
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
            const query = 'SELECT * FROM TiposTramites ORDER BY nombre';
            const [tipos] = await db.execute(query);
            
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
}

module.exports = TramitesController;