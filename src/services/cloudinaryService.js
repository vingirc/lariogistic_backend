const cloudinary = require('cloudinary').v2;
const { cloudinaryConfig } = require('../utils/env');
const { Readable } = require('stream');
const { logger } = require('../middleware/logger');

cloudinary.config(cloudinaryConfig);
logger.info('Configuración de Cloudinary inicializada');

const cloudinaryService = {
  validateFile(file, resourceType) {
    if (!file) {
      throw new Error('Archivo no proporcionado');
    }
    // Validar los bytes iniciales para imágenes
    if (resourceType === 'image' && file.buffer) {
      const firstBytes = file.buffer.slice(0, 8).toString('hex').toLowerCase();
      const validSignatures = {
        '89504e470d0a1a0a': 'image/png',
        'ffd8ffe0': 'image/jpeg',
        'ffd8ffe1': 'image/jpeg',
        '474946383761': 'image/gif',
        '474946383961': 'image/gif',
      };
      let isValid = false;
      for (const signature in validSignatures) {
        if (firstBytes.startsWith(signature)) {
          isValid = true;
          if (validSignatures[signature] !== file.mimetype) {
            logger.warn(`Advertencia: MIME type (${file.mimetype}) no coincide con la firma (${validSignatures[signature]})`, {
              file: file.originalname,
            });
          }
          break;
        }
      }
      if (!isValid) {
        throw new Error(`Firma de archivo no válida para imagen: ${firstBytes}`);
      }
    }
  },

  async upload(file, folder, resourceType = 'image') {
    try {
      logger.info(`Subiendo archivo a Cloudinary: ${file.originalname}`, {
        mimetype: file.mimetype,
        size: file.size,
      });
      this.validateFile(file, resourceType === 'video' ? 'video' : 'image');

      if (!file.buffer || file.buffer.length === 0) {
        throw new Error('El buffer del archivo está vacío o no está definido');
      }

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'referencias',
            resource_type: resourceType === 'video' ? 'video' : 'image',
          },
          (error, result) => {
            if (error) {
              logger.error('Error en upload_stream', { error: error.message });
              reject(new Error(`Error al subir archivo a Cloudinary: ${error.message}`));
            } else {
              logger.info(`Archivo subido exitosamente: ${result.secure_url}`, {
                publicId: result.public_id,
              });
              resolve(result);
            }
          }
        );
        bufferStream.pipe(uploadStream);
      });

      return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
      logger.error('Error al subir archivo a Cloudinary', { error: error.message });
      throw error;
    }
  },

  async deleteMultiple(mediaToDelete) {
    if (!mediaToDelete || !Array.isArray(mediaToDelete) || mediaToDelete.length === 0) {
      return;
    }
    const deletePromises = mediaToDelete.map(({ publicId, resourceType }) =>
      this.delete(publicId, resourceType)
    );
    await Promise.all(deletePromises);
  },

  async uploadMultiple(files, folder, resourceType = 'auto') {
    if (!files || !Array.isArray(files)) {
      return [];
    }
    const results = [];
    for (const file of files) {
      // Determinar resourceType basado en el mimetype
      const isVideo = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.mimetype);
      const selectedResourceType = resourceType === 'auto' ? (isVideo ? 'video' : 'image') : resourceType;
      const result = await this.upload(file, folder, selectedResourceType);
      results.push({ ...result, resourceType: selectedResourceType });
    }
    return results;
  },

  async updateMedia(existingMedia, retainedIds, newFiles, folder) {
    const retained = [];
    const deleted = [];
    const added = [];

    for (const media of existingMedia) {
      if (retainedIds.includes(media.id)) {
        retained.push(media);
      } else {
        // Asumimos que media.tipo es 'image' o 'video'
        const resourceType = media.tipo === 'video' ? 'video' : 'image';
        deleted.push({ publicId: media.publicId, resourceType });
      }
    }

    if (deleted.length > 0) {
      await this.deleteMultiple(deleted);
    }

    if (newFiles && Array.isArray(newFiles)) {
      const uploaded = await this.uploadMultiple(newFiles, folder);
      added.push(...uploaded);
    }

    return { retained, deleted, added };
  }
};

module.exports = cloudinaryService;