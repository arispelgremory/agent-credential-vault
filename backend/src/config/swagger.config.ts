import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';
import { openApiAuthSpec } from '@/features/auth/index.js';
import { openApiIdentitySpec } from '@/features/identity/index.js';

/**
 * Swagger/OpenAPI Configuration
 * Combines all OpenAPI specs from different features
 */
export const swaggerSpec = {
  ...openApiAuthSpec,
  info: {
    title: 'W3 Identity Platform API',
    version: '1.0.0',
    description: 'API documentation for W3 Identity Platform - Authentication, User Management, and ERC-8004 Agent Registration',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:9487/api/v1',
      description: 'Development server'
    },
    {
      url: 'https://api.example.com/api/v1',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Identity',
      description: 'ERC-8004 agent registration and identity management endpoints'
    }
  ],
  components: {
    ...openApiAuthSpec.components,
    schemas: {
      ...openApiAuthSpec.components?.schemas,
      ...openApiIdentitySpec.components?.schemas
    },
    securitySchemes: {
      ...openApiAuthSpec.components?.securitySchemes,
      ...openApiIdentitySpec.components?.securitySchemes
    }
  },
  paths: {
    ...openApiAuthSpec.paths,
    ...openApiIdentitySpec.paths
  }
};

/**
 * Swagger UI options
 */
export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'W3 Identity Platform API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true, // Keep authorization token after page refresh
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

/**
 * Setup Swagger middleware
 */
export const setupSwagger = (app: Application) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Serve OpenAPI JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📚 API Documentation available at: http://localhost:9487/api-docs');
  console.log('📄 OpenAPI JSON spec available at: http://localhost:9487/api-docs.json');
};

