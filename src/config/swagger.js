const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Logistics Automation API',
      version: '1.0.0',
      description: 'API for automating logistics processes like vacation requests and document approvals, built for a Hackathon project.'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://logistics-backend.vercel.app'
          : 'http://localhost:3000',
        description: 'API server'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Endpoints for user authentication' },
      { name: 'Requests', description: 'Endpoints for managing logistics requests (e.g., vacations, permissions)' },
      { name: 'Approvals', description: 'Endpoints for approving or rejecting requests' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Indicates if the operation was successful' },
            data: { type: 'object', nullable: true, description: 'Response data' },
            message: { type: 'string', description: 'Response message' }
          },
          required: ['success', 'message']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            code: { type: 'integer', description: 'HTTP status code' }
          },
          required: ['error', 'code']
        },
        Request: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Unique request ID' },
            userId: { type: 'integer', description: 'ID of the requesting user' },
            type: { type: 'string', enum: ['vacation', 'permission', 'document'], description: 'Type of request' },
            startDate: { type: 'string', format: 'date', description: 'Start date (optional)' },
            endDate: { type: 'string', format: 'date', description: 'End date (optional)' },
            reason: { type: 'string', description: 'Reason for the request (optional)' },
            fileUrl: { type: 'string', format: 'uri', description: 'URL of uploaded file (optional)' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: 'Request status' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
          }
        },
        Approval: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Unique approval ID' },
            requestId: { type: 'integer', description: 'ID of the associated request' },
            approverId: { type: 'integer', description: 'ID of the approving user' },
            status: { type: 'string', enum: ['approved', 'rejected'], description: 'Approval status' },
            comments: { type: 'string', description: 'Optional comments' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;