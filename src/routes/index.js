import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createRequire } from 'module';
import path from 'path';
import express from 'express';

const require = createRequire(import.meta.url);

import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import exampleRoutes from '../modules/example/example.routes.js';
import companyRoutes from '../modules/company/company.routes.js';
import profileRoutes from '../modules/profile/profile.routes.js';
import documentTypeRoutes from '../modules/documentType/documentType.routes.js';
import dynamicFieldRoutes from '../modules/dynamicField/dynamicField.routes.js';
import templateMasterRoutes from '../modules/templateMaster/templateMaster.routes.js';
import templateContentRoutes from '../modules/templateContent/templateContent.routes.js';
import templateDocumentRoutes from '../modules/templateDocument/templateDocument.routes.js';
import generatedDocumentRoutes from '../modules/generatedDocument/generatedDocument.routes.js';

const router = Router();
// ... [rest remains the same but registering below] ...

// Swagger Documentation Configuration
// RENDER_EXTERNAL_URL is auto-set by Render — no manual config needed on the platform
const LIVE_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || null;
const LOCAL_URL = `http://localhost:${process.env.PORT || 5000}`;

// Build servers list: live URL first (if available), then localhost
const swaggerServers = [];
if (LIVE_URL) {
  swaggerServers.push({ url: LIVE_URL, description: '🌐 Live Production Server (Render)' });
}
swaggerServers.push({ url: LOCAL_URL, description: '💻 Local Development Server' });

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise Backend API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API built with Node.js, Express.js, Sequelize ORM & MySQL',
    },
    servers: swaggerServers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve swagger-ui-dist static assets directly to fix MIME type errors on Render
const swaggerUiDist = require('swagger-ui-dist');
const swaggerDistPath = swaggerUiDist.absolutePath();
router.use('/api-docs/swagger-ui-bundle.js', express.static(path.join(swaggerDistPath, 'swagger-ui-bundle.js')));
router.use('/api-docs/swagger-ui.css', express.static(path.join(swaggerDistPath, 'swagger-ui.css')));
router.use('/api-docs/swagger-ui-init.js', express.static(path.join(swaggerDistPath, 'swagger-ui-init.js')));

// Serve Swagger UI docs
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCssUrl: '/api-docs/swagger-ui.css',
  customJs: '/api-docs/swagger-ui-bundle.js',
}));

// API Module Routes Registration
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/examples', exampleRoutes);

// Company Module Routes
router.use('/api/v1/companies', companyRoutes);
router.use('/api/companies', companyRoutes);

// Profile Module Routes
router.use('/api/v1/profiles', profileRoutes);
router.use('/api/profiles', profileRoutes);

// DocumentType Module Routes
router.use('/api/v1/document-types', documentTypeRoutes);
router.use('/api/document-types', documentTypeRoutes);

// DynamicField Module Routes
router.use('/api/v1/dynamic-fields', dynamicFieldRoutes);
router.use('/api/dynamic-fields', dynamicFieldRoutes);

// TemplateMaster Module Routes
router.use('/api/v1/template-masters', templateMasterRoutes);
router.use('/api/template-masters', templateMasterRoutes);

// TemplateContent Phase 1 Module Routes
router.use('/api/v1/template-contents', templateContentRoutes);
router.use('/api/template-contents', templateContentRoutes);
router.use('/template-content', templateContentRoutes);

// TemplateDocument Module Routes
router.use('/api/v1/template-documents', templateDocumentRoutes);
router.use('/api/template-documents', templateDocumentRoutes);

// GeneratedDocument Module Routes
router.use('/api/v1/generated-documents', generatedDocumentRoutes);
router.use('/api/generated-documents', generatedDocumentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

export default router;
