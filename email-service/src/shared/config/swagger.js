const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const docsGlob = path
  .join(__dirname, '..', '..', 'modules', '**', '*.docs.js')
  .replace(/\\/g, '/');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Email Service API',
      version: '1.0.0',
      description: 'Internal service. Sends transactional emails through Resend. Called by the worker only.',
    },
    servers: [{ url: '/api/v1', description: 'Version 1' }],
    security: [{ apiKey: [] }],
    components: {
      securitySchemes: {
        apiKey: { type: 'apiKey', in: 'header', name: 'x-api-key' },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fields: { type: 'string' },
                  message: { type: 'string' },
                  in: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [docsGlob],
});