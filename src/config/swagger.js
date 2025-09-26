// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Financiera Backend API',
      version: '1.0.0',
      description: 'API for vehicle sales platform. Provides endpoints for user authentication, vehicle references management, user administration, credit application management, and fingerprint/attendance processing.'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://financiera-backend.vercel.app'
          : 'http://localhost:3000',
        description: 'Versión 1 de la API',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Endpoints for user authentication and session management.' },
      { name: 'Referencias', description: 'Endpoints for managing vehicle references and media.' },
      { name: 'Usuarios', description: 'Endpoints for user management and profile operations.' },
      { name: 'Solicitudes', description: 'Endpoints for managing credit applications.' },
      { name: 'Huellas', description: 'Endpoints for managing fingerprint registration and verification.' },
      { name: 'Asistencia', description: 'Endpoints for processing and retrieving attendance data.' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      parameters: {
        AuthorizationHeader: {
          in: 'header',
          name: 'Authorization',
          schema: { type: 'string' },
          required: true,
          description: 'Bearer token for authentication (e.g., Bearer <JWT>)',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Indicates if the operation was successful' },
            data: { type: 'object', nullable: true, description: 'Response data (null if no data is returned)' },
            message: { type: 'string', description: 'Response message' },
          },
          required: ['success', 'message'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            code: { type: 'integer', description: 'HTTP status code' },
          },
          required: ['error', 'code'],
        },
        Referencia: {
          type: 'object',
          properties: {
            idPublicacion: { type: 'integer', description: 'ID de la publicación' },
            idVehiculo: { type: 'integer', description: 'ID del vehículo' },
            descripcion: { type: 'string', description: 'Descripción de la referencia' },
            fecha: { type: 'string', format: 'date-time', description: 'Fecha de publicación' },
            modelo: { type: 'string', description: 'Modelo del vehículo' },
            ano: { type: 'integer', description: 'Año del vehículo' },
            marca: { type: 'string', description: 'Marca del vehículo' },
            medios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idMedio: { type: 'integer', description: 'ID del medio' },
                  urlMedio: { type: 'string', format: 'uri', description: 'URL del medio' },
                  tipo: { type: 'string', enum: ['image', 'video'], description: 'Tipo de medio' },
                  publicId: { type: 'string', description: 'ID público en Cloudinary' },
                },
              },
            },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            idUsuario: { type: 'integer', description: 'Unique user ID' },
            nombre: { type: 'string', description: 'Full name of the user' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            telefono: { type: 'string', description: 'User phone number' },
            direccion: { type: 'string', description: 'User address' },
            idRol: { type: 'integer', description: 'Role ID (1 = Admin, 2 = Vendedor, 3 = Cliente)' },
            estado: { type: 'string', enum: ['activo', 'inactivo'], description: 'User status' },
          },
        },
        Solicitud: {
          type: 'object',
          properties: {
            idSolicitud: { type: 'integer', description: 'Unique ID of the credit application' },
            idCliente: { type: 'integer', description: 'ID of the client submitting the application' },
            idVendedor: { type: 'integer', description: 'ID of the vendor associated with the vehicle or quotation' },
            idVehiculo: { type: 'integer', description: 'ID of the vehicle (optional)' },
            idCotizacion: { type: 'integer', description: 'ID of the quotation (optional)' },
            nombre_completo: { type: 'string', description: 'Full name of the applicant' },
            telefono: { type: 'string', description: 'Phone number of the applicant' },
            direccion: { type: 'string', description: 'Address of the applicant' },
            curp: { type: 'string', description: 'CURP of the applicant (18 characters)' },
            fecha_nacimiento: { type: 'string', format: 'date', description: 'Date of birth (YYYY-MM-DD)' },
            estado_civil: { type: 'string', enum: ['soltero', 'casado', 'divorciado', 'viudo', 'concubinato'], description: 'Marital status' },
            cantidad_dependientes: { type: 'integer', description: 'Number of dependents' },
            tipo_vivienda: { type: 'string', enum: ['propia', 'rentada', 'familiar'], description: 'Type of housing' },
            ingreso_familiar: { type: 'number', description: 'Monthly family income' },
            direccion_trabajo: { type: 'string', description: 'Work address (optional)' },
            empresa: { type: 'string', description: 'Employer name (optional)' },
            puesto: { type: 'string', description: 'Job position (optional)' },
            ingreso_mensual: { type: 'number', description: 'Monthly personal income' },
            tiempo_laborando: { type: 'integer', description: 'Months employed' },
            tipo_credito: { type: 'string', enum: ['ninguno', 'personal', 'automotriz', 'bancario'], description: 'Current credit type' },
            enganche_propuesto: { type: 'number', description: 'Proposed down payment (optional if idCotizacion is provided)' },
            plazos_propuestos: { type: 'integer', description: 'Proposed payment terms in months (optional if idCotizacion is provided)' },
            comprobante_ingresos: { type: 'boolean', description: 'Indicates if proof of income was provided' },
            estatus: { type: 'string', enum: ['pendiente', 'aprobada', 'rechazada'], description: 'Status of the application' },
            fecha: { type: 'string', format: 'date-time', description: 'Submission date' },
            descripcion_vehiculo_adicional: { type: 'string', description: 'Additional vehicle description (optional)' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'JWT access token' },
            refreshToken: { type: 'string', description: 'JWT refresh token' },
            user: { $ref: '#/components/schemas/Usuario' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
console.log(`[${new Date().toISOString()}] Swagger spec generated with keys:`, Object.keys(swaggerSpec));

if (process.env.NODE_ENV !== 'production') {
  try {
    fs.writeFileSync('debug-swagger-spec.json', JSON.stringify(swaggerSpec, null, 2));
    console.log(`[${new Date().toISOString()}] Debug Swagger spec saved to debug-swagger-spec.json`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to write debug-swagger-spec.json:`, error.message);
  }
} else {
  console.log(`[${new Date().toISOString()}] Skipping debug-swagger-spec.json write in production`);
}

module.exports = swaggerSpec;