// src/controllers/documentosController.js
const documentosService = require('../services/documentosService');
const { ForbiddenError } = require('../middleware/error'); // RUTA CORREGIDA DEL PASO ANTERIOR

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const documentos = await documentosService.getAll();
            res.json({ success: true, data: documentos, message: 'Documentos obtenidos con éxito' });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const idDocumento = parseInt(req.params.id, 10);
            if (isNaN(idDocumento)) {
                throw new Error('ID de documento inválido');
            }
            const documento = await documentosService.findById(idDocumento);
            if (!documento) {
                throw new Error('Documento no encontrado');
            }
            res.json({ success: true, data: documento, message: 'Documento obtenido con éxito' });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            if (!req.user) {
                throw new ForbiddenError('Autenticación requerida');
            }
            const { idTramite } = req.body;
            const files = req.files;
            if (!idTramite) {
                throw new Error('ID de trámite requerido');
            }
            const documentos = await documentosService.create({ idTramite: parseInt(idTramite, 10), files }, req.user.idUsuario);
            res.status(201).json({ success: true, data: documentos, message: 'Documentos adjuntados con éxito' });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            if (!req.user) {
                throw new ForbiddenError('Autenticación requerida');
            }
            const idDocumento = parseInt(req.params.id, 10);
            if (isNaN(idDocumento)) {
                throw new Error('ID de documento inválido');
            }
            const { idTramite, retained } = req.body;
            const file = req.file;
            const isAdmin = req.user.idRol === 1;
            const documento = await documentosService.update(
                idDocumento,
                { idTramite: idTramite ? parseInt(idTramite, 10) : null, file, retained: retained === 'true' },
                req.user.idUsuario,
                isAdmin
            );
            res.json({ success: true, data: documento, message: 'Documento actualizado con éxito' });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            if (!req.user) {
                throw new ForbiddenError('Autenticación requerida');
            }
            const idDocumento = parseInt(req.params.id, 10);
            if (isNaN(idDocumento)) {
                throw new Error('ID de documento inválido');
            }
            await documentosService.delete(idDocumento, req.user.idUsuario);
            res.status(204).json({ success: true, data: null, message: 'Documento eliminado con éxito' });
        } catch (err) {
            next(err);
        }
    },
}; // <-- Asegúrate de que esta llave esté correctamente cerrada y que no haya código extra.