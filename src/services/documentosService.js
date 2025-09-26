// src/services/documentosService.js
const pool = require('../config/db');
const cloudinaryService = require('./cloudinaryService');
const historialService = require('./historialService'); // Asumiendo que existe para logs de acciones

const documentosService = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT d.*, t.idUsuario AS idSolicitante, u.nombre AS solicitante
      FROM Documentos d
      JOIN Tramites t ON d.idTramite = t.idTramite
      JOIN Usuarios u ON t.idUsuario = u.idUsuario
      ORDER BY d.fechaSubida DESC
    `);
    return rows;
  },

  async findById(idDocumento) {
    const [rows] = await pool.query(
      `
      SELECT d.*, t.idUsuario AS idSolicitante, u.nombre AS solicitante
      FROM Documentos d
      JOIN Tramites t ON d.idTramite = t.idTramite
      JOIN Usuarios u ON t.idUsuario = u.idUsuario
      WHERE d.idDocumento = ?
    `,
      [idDocumento]
    );
    return rows[0] || null;
  },

  async create({ idTramite, files }, userId) {
    // Validar: Verificar que el trámite existe y pertenece al usuario (o es admin, pero eso en controller)
    const [tramite] = await pool.query('SELECT idUsuario FROM Tramites WHERE idTramite = ?', [idTramite]);
    if (!tramite[0]) {
      throw new Error('Trámite no encontrado');
    }
    if (tramite[0].idUsuario !== userId) {
      throw new Error('No tienes permisos para adjuntar documentos a este trámite');
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Al menos un archivo es requerido');
    }

    const insertedDocuments = [];
    for (const file of files) {
      // Determinar tipo basado en mimetype
      let tipo;
      if (file.mimetype.startsWith('image/')) {
        tipo = 'imagen';
      } else if (file.mimetype === 'application/pdf') {
        tipo = 'pdf';
      } else if (file.mimetype.startsWith('application/') || file.mimetype.includes('document')) {
        tipo = 'documento';
      } else {
        tipo = 'otro';
      }

      // Subir a Cloudinary
      const resourceType = tipo === 'pdf' || tipo === 'documento' || tipo === 'otro' ? 'raw' : 'image';
      const { url: urlDocumento, publicId } = await cloudinaryService.upload(file, 'tramites/documentos', resourceType);

      // Insertar en DB
      const [result] = await pool.query(
        `INSERT INTO Documentos (idTramite, publicId, urlDocumento, tipo, nombreArchivo, tamano)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idTramite, publicId, urlDocumento, tipo, file.originalname, file.size]
      );

      insertedDocuments.push({ idDocumento: result.insertId, ...file, urlDocumento, publicId, tipo });

      // Log en historial
      await historialService.log(userId, idTramite, `Adjuntó documento: ${file.originalname}`);
    }

    return insertedDocuments;
  },

  async update(idDocumento, { idTramite, file, retained = true }, userId, isAdmin = false) {
    const documento = await this.findById(idDocumento);
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    // Verificar permisos: owner del trámite o admin
    if (!isAdmin && documento.idSolicitante !== userId) {
      throw new Error('No tienes permisos para actualizar este documento');
    }

    let updatedData = { idDocumento };

    if (file) {
      // Si hay nuevo archivo, eliminar el viejo de Cloudinary
      if (!retained) {
        const resourceType = documento.tipo === 'imagen' ? 'image' : 'raw';
        await cloudinaryService.delete(documento.publicId, resourceType);
      }

      // Determinar nuevo tipo
      let tipo;
      if (file.mimetype.startsWith('image/')) {
        tipo = 'imagen';
      } else if (file.mimetype === 'application/pdf') {
        tipo = 'pdf';
      } else if (file.mimetype.startsWith('application/') || file.mimetype.includes('document')) {
        tipo = 'documento';
      } else {
        tipo = 'otro';
      }

      // Subir nuevo
      const resourceType = tipo === 'pdf' || tipo === 'documento' || tipo === 'otro' ? 'raw' : 'image';
      const { url: urlDocumento, publicId } = await cloudinaryService.upload(file, 'tramites/documentos', resourceType);

      // Actualizar DB
      await pool.query(
        `UPDATE Documentos SET publicId = ?, urlDocumento = ?, tipo = ?, nombreArchivo = ?, tamano = ?
         WHERE idDocumento = ?`,
        [publicId, urlDocumento, tipo, file.originalname, file.size, idDocumento]
      );

      updatedData = { ...updatedData, urlDocumento, publicId, tipo, nombreArchivo: file.originalname, tamano: file.size };

      // Log
      await historialService.log(userId, documento.idTramite, `Actualizó documento: ${file.originalname}`);
    } else if (idTramite) {
      // Solo actualizar idTramite si proporcionado (raro, pero posible para admins)
      if (!isAdmin) {
        throw new Error('Solo administradores pueden cambiar el trámite asociado');
      }
      await pool.query('UPDATE Documentos SET idTramite = ? WHERE idDocumento = ?', [idTramite, idDocumento]);
      updatedData.idTramite = idTramite;
    }

    return { ...documento, ...updatedData };
  },

  async delete(idDocumento, userId) {
    const documento = await this.findById(idDocumento);
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    // Verificar permisos
    if (documento.idSolicitante !== userId) {
      throw new Error('No tienes permisos para eliminar este documento');
    }

    // Eliminar de Cloudinary
    const resourceType = documento.tipo === 'imagen' ? 'image' : 'raw';
    await cloudinaryService.delete(documento.publicId, resourceType);

    // Eliminar de DB
    await pool.query('DELETE FROM Documentos WHERE idDocumento = ?', [idDocumento]);

    // Log
    await historialService.log(userId, documento.idTramite, `Eliminó documento: ${documento.nombreArchivo}`);

    return { message: 'Documento eliminado con éxito' };
  }
};

module.exports = documentosService;