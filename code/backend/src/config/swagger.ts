import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UmiCV API',
      version: '1.0.0',
      description: 'API Documentation for UmiCV Backend',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token here. Prefix with "Bearer " is automatically handled by Swagger UI.',
        },
      },
    },
    // Make bearerAuth the default for all endpoints, but we can override per endpoint if needed
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Look for Swagger annotations in all route files
  apis: ['./src/modules/**/*.route.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
