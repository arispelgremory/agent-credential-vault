import express from 'express';

// Import feature routes
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import { handleUpload } from '@/features/upload/index.js';
// import { schedulerRoutes } from '@/features/scheduler/index.js';
import mcpRoutes from '@/features/mcp/mcp.routes.js';
import authenticateJWT from '@/middleware/authenticate-jwt';
import topicRoutes from '@/features/hedera/topic/topic.routes';
import uploadRoutes from '@/features/upload/upload.routes';
import { identityRoutes } from '@/features/identity/index.js';
import credentialRoutes from '@/features/credential/credential.routes.js';

const v1Router = express.Router();

// Use the feature routes
v1Router.use('/health', healthRoutes);

v1Router.use('/auth', authRoutes);

v1Router.use('/mcp', mcpRoutes);
v1Router.use('/upload', uploadRoutes);

v1Router.use('/topic', topicRoutes);

v1Router.use('/identity', identityRoutes);

v1Router.use('/credential', credentialRoutes);

export default v1Router;