import { Router } from 'express';
import { CredentialController } from './credential.controller.js';
import authenticateJWT from '@/middleware/authenticate-jwt.js';

const router = Router();
const credentialController = new CredentialController();

// All routes require authentication
router.get('/', (req, res) => credentialController.getCredential(req, res));
router.post('/', (req, res) => credentialController.upsertCredential(req, res));
router.put('/', (req, res) => credentialController.upsertCredential(req, res));
router.delete('/', (req, res) => credentialController.deleteCredential(req, res));

export default router;

