const Joi = require('joi');

const usuarioSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  telefono: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null),
  direccion: Joi.string().max(100).allow(null),
  password: Joi.string().min(8).required().when('googleId', { is: Joi.exist(), then: Joi.allow(null) }),
  googleId: Joi.string().max(100).allow(null),
  idRol: Joi.number().integer().valid(2, 3).required().messages({
    'number.base': 'El rol debe ser un número',
    'number.valid': 'Rol inválido: debe ser 2 (vendedor) o 3 (cliente)',
  }),
  isAdmin: Joi.boolean().optional(),
});

const registroSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().when('googleId', { is: Joi.exist(), then: Joi.allow(null) }),
  googleId: Joi.string().max(100).allow(null),
});

const adminCreateSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  idRol: Joi.number().integer().valid(2, 3).required().messages({
    'number.base': 'El rol debe ser un número',
    'number.valid': 'Rol inválido: debe ser 2 (gerente) o 3 (empleado)',
  }),
  idDepartamento: Joi.number().integer().optional().allow(null),
  isAdmin: Joi.boolean().optional(),
});

const updateUsuarioSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).optional(),
  telefono: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(null),
  direccion: Joi.string().max(100).optional().allow(null),
  password: Joi.string().min(8).optional(),
  idRol: Joi.number().integer().valid(1, 2, 3).optional(),
  estado: Joi.string().valid('activo', 'inactivo').optional(),
  isAdmin: Joi.boolean().optional(),
}).min(1);

const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().min(8).when('isAdmin', { is: true, then: Joi.allow(null), otherwise: Joi.required() }),
  newPassword: Joi.string().min(8).required(),
  isAdmin: Joi.boolean().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const referenciaCreateSchema = Joi.object({
  idVehiculo: Joi.number().integer().optional().allow(null),
  descripcion: Joi.string().min(3).max(500).required(),
  isAdmin: Joi.boolean().optional(),
});

const referenciaUpdateSchema = Joi.object({
  idVehiculo: Joi.number().integer().optional().allow(null),
  descripcion: Joi.string().min(3).max(500).required(),
  retainedMediaIds: Joi.string().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || !parsed.every(id => Number.isInteger(parseInt(id, 10)))) {
        return helpers.error('any.invalid');
      }
      return parsed;
    } catch (e) {
      return helpers.error('any.invalid');
    }
  }, 'JSON array of integers').optional(),
  isAdmin: Joi.boolean().optional(),
});

const solicitudCreateSchema = Joi.object({
  idVendedor: Joi.number().integer().optional().allow(null),
  idVehiculo: Joi.number().integer().optional().allow(null),
  idCotizacion: Joi.number().integer().optional().allow(null),
  nombre_completo: Joi.string().min(3).max(100).required(),
  telefono: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(null),
  direccion: Joi.string().max(255).optional().allow(null),
  curp: Joi.string().length(18).pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/).required(),
  fecha_nacimiento: Joi.date().less('now').required(),
  estado_civil: Joi.string().valid('soltero', 'casado', 'divorciado', 'viudo', 'concubinato').required(),
  cantidad_dependientes: Joi.number().integer().min(0).required(),
  tipo_vivienda: Joi.string().valid('propia', 'rentada', 'familiar').required(),
  ingreso_familiar: Joi.number().min(0).required(),
  direccion_trabajo: Joi.string().max(255).optional().allow(null),
  empresa: Joi.string().max(100).optional().allow(null),
  puesto: Joi.string().max(50).optional().allow(null),
  ingreso_mensual: Joi.number().min(0).required(),
  tiempo_laborando: Joi.number().integer().min(0).required(),
  tipo_credito: Joi.string().valid('ninguno', 'personal', 'automotriz', 'bancario').required(),
  enganche_propuesto: Joi.number().min(0).optional().allow(null)
    .when('idCotizacion', { is: Joi.exist(), then: Joi.allow(null), otherwise: Joi.required() }),
  plazos_propuestos: Joi.number().integer().min(1).optional().allow(null)
    .when('idCotizacion', { is: Joi.exist(), then: Joi.allow(null), otherwise: Joi.required() }),
  comprobante_ingresos: Joi.boolean().optional().default(false),
  descripcion_vehiculo_adicional: Joi.string().max(500).optional().allow(null)
    .when('idVehiculo', { is: Joi.exist(), then: Joi.allow(null), otherwise: Joi.required() }),
});

const fingerprintRequestSchema = Joi.object({
  idUsuario: Joi.number().integer().required().messages({
    'number.base': 'El idUsuario debe ser un número entero',
    'any.required': 'El idUsuario es requerido',
  }),
});

const fingerprintConfirmSchema = Joi.object({
  idHuella: Joi.number().integer().min(1).max(300).optional().allow(null).messages({
    'number.base': 'El idHuella debe ser un número entero si se proporciona',
    'number.min': 'El idHuella debe estar entre 1 y 300',
    'number.max': 'El idHuella debe estar entre 1 y 300',
  }),
});

const fingerprintPaseListaSchema = Joi.object({
  idHuella: Joi.number().integer().min(1).max(300).required().messages({
    'number.base': 'El idHuella debe ser un número entero',
    'number.min': 'El idHuella debe estar entre 1 y 300',
    'number.max': 'El idHuella debe estar entre 1 y 300',
    'any.required': 'El idHuella es requerido',
  }),
});

const fingerprintAsistenciasSchema = Joi.object({
  idUsuario: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'El idUsuario debe ser un número entero si se proporciona',
  }),
  startDate: Joi.date().optional().allow(null).messages({
    'date.base': 'startDate debe ser una fecha válida',
  }),
  endDate: Joi.date().optional().allow(null).messages({
    'date.base': 'endDate debe ser una fecha válida',
  }),
});

// Esquemas para historial
const historialCreateSchema = Joi.object({
  idUsuario: Joi.number().integer().required(),
  idTramite: Joi.number().integer().optional().allow(null),
  accion: Joi.string().required().max(100).trim(),
  descripcion: Joi.string().allow(null, '').optional()
});

const historialUpdateSchema = Joi.object({
  accion: Joi.string().max(100).trim().optional(),
  descripcion: Joi.string().allow(null, '').optional()
}).min(1);

// Esquemas para departamentos
const departamentoCreateSchema = Joi.object({
  nombre: Joi.string().required().max(50).trim(),
  descripcion: Joi.string().max(255).allow(null, '').optional()
});

const departamentoUpdateSchema = Joi.object({
  nombre: Joi.string().max(50).trim().optional(),
  descripcion: Joi.string().max(255).allow(null, '').optional(),
  estado: Joi.string().valid('activo', 'inactivo').optional()
}).min(1); // Al menos un campo para actualizar

const validate = (schema) => (req, res, next) => {
  const schemasWithIsAdmin = [
    passwordChangeSchema,
    updateUsuarioSchema,
    adminCreateSchema,
    usuarioSchema,
    referenciaCreateSchema,
    referenciaUpdateSchema,
  ];
  const payload = schemasWithIsAdmin.includes(schema) && req.user
    ? { ...req.body, isAdmin: req.user.idRol === 1 }
    : req.body;
  const { error } = schema.validate(payload, { abortEarly: false });
  if (error) {
    const err = new Error(error.details.map(detail => detail.message).join(', '));
    err.name = 'ValidationError';
    err.code = 400;
    return next(err);
  }
  next();
};

module.exports = {
  validateUsuario: validate(usuarioSchema),
  validateRegistro: validate(registroSchema),
  validateAdminCreate: validate(adminCreateSchema),
  validateUpdateUsuario: validate(updateUsuarioSchema),
  validatePasswordChange: validate(passwordChangeSchema),
  validateLogin: validate(loginSchema),
  validateRefresh: validate(refreshTokenSchema),
  validateReferenciaCreate: validate(referenciaCreateSchema),
  validateReferenciaUpdate: validate(referenciaUpdateSchema),
  validateSolicitudCreate: validate(solicitudCreateSchema),
  validateFingerprintRequest: validate(fingerprintRequestSchema),
  validateFingerprintConfirm: validate(fingerprintConfirmSchema),
  validateFingerprintPaseLista: validate(fingerprintPaseListaSchema),
  validateFingerprintAsistencias: validate(fingerprintAsistenciasSchema),
  validateDepartamentoCreate: validate(departamentoCreateSchema),
  validateDepartamentoUpdate: validate(departamentoUpdateSchema),
  validateHistorialCreate: validate(historialCreateSchema),
  validateHistorialUpdate: validate(historialUpdateSchema),
};