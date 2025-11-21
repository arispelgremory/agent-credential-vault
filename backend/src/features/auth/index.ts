import { AuthController } from '@/features/auth/auth.controller.js';
import authRoutes from '@/features/auth/auth.routes.js';
import { openApiAuthSpec, authSchemas, authPaths, authSecuritySchemes } from '@/features/auth/auth.openapi.js';

export {
    AuthController,
    authRoutes,
    openApiAuthSpec,
    authSchemas,
    authPaths,
    authSecuritySchemes
}