// src/middleware/uploadMiddleware.js
const multer = require('multer');

const storage = multer.memoryStorage(); // En memoria para prototipo; cambia a diskStorage() si necesitas persistencia local
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max por archivo, para impacto en performance
    files: 10 // Máx 10 archivos por request, escalable para trámites complejos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/; // Tipos comunes para docs logísticos
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF) y PDFs. Revisa el archivo.'), false);
    }
  }
});

// Middleware para un solo archivo (default para trámites simples)
const singleUpload = upload.single('archivo');

// Middleware para múltiples archivos (ej. adjuntos en solicitud de vacaciones)
const multipleUpload = upload.array('archivos', 5); // Máx 5, ajustable

module.exports = { singleUpload, multipleUpload };