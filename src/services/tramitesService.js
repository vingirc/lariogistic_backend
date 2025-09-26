const db = require('../config/db');

class TramitesService {
    // Obtener todos los trámites de un usuario
    static async obtenerTramitesPorUsuario(idUsuario) {
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
        return tramites;
    }

    // Crear nuevo trámite
    static async crearTramite(datosTrami) {
        const { 
            idUsuario, 
            idTipoTramite, 
            descripcion, 
            fechaInicio, 
            fechaFin 
        } = datosTrami;

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
        const tramiteCreado = await this.obtenerTramitePorId(result.insertId);
        return tramiteCreado;
    }

    // Obtener trámite por ID
    static async obtenerTramitePorId(idTramite) {
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
    }

    // Actualizar estado de trámite
    static async actualizarEstadoTramite(idTramite, estado) {
        const query = `
            UPDATE Tramites 
            SET estado = ?
            WHERE idTramite = ?
        `;

        const [result] = await db.execute(query, [estado, idTramite]);
        return result.affectedRows > 0;
    }

    // Obtener tipos de trámites disponibles
    static async obtenerTiposTramites() {
        const query = 'SELECT * FROM TiposTramites ORDER BY nombre';
        const [tipos] = await db.execute(query);
        return tipos;
    }

    // Validar si existe un trámite
    static async existeTramite(idTramite) {
        const query = 'SELECT COUNT(*) as count FROM Tramites WHERE idTramite = ?';
        const [result] = await db.execute(query, [idTramite]);
        return result[0].count > 0;
    }

    // Validar si existe un tipo de trámite
    static async existeTipoTramite(idTipoTramite) {
        const query = 'SELECT COUNT(*) as count FROM TiposTramites WHERE idTipoTramite = ?';
        const [result] = await db.execute(query, [idTipoTramite]);
        return result[0].count > 0;
    }
}

module.exports = TramitesService;