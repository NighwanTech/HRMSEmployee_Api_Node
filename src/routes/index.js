import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise Backend API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API built with Node.js, Express.js, Sequelize ORM & MySQL',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
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

// Serve Swagger UI docs
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
