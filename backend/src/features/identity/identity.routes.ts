import { Router } from 'express';
import { IdentityController } from './identity.controller.js';
import authenticateJWT from '@/middleware/authenticate-jwt.js';

const router = Router();
const identityController = new IdentityController();

// Agent Registration
router.post('/agent/register', (req, res) => identityController.registerAgent(req, res));
router.get('/agent', (req, res) => identityController.getAgent(req, res));
router.get('/agent/:agentId', (req, res) => identityController.getAgent(req, res));
router.post('/agent/:agentId/uri', (req, res) => identityController.setAgentUri(req, res));
router.post('/agent/:agentId/metadata', (req, res) => identityController.setAgentMetadata(req, res));
router.get('/agent/:agentId/metadata', (req, res) => identityController.getAgentMetadata(req, res));
router.get('/agent/:agentId/owner', (req, res) => identityController.getAgentOwner(req, res));

// HCS Standards
router.post('/agent/hcs10/broadcast', authenticateJWT, (req, res) => identityController.broadcastHCS10(req, res));
router.post('/agent/hcs11/publish', authenticateJWT, (req, res) => identityController.publishHCS11(req, res));

// Validation
router.post('/agent/validation/request', (req, res) => identityController.requestValidation(req, res));
router.post('/agent/validation/response', (req, res) => identityController.submitValidationResponse(req, res));

// Reputation/Feedback
router.post('/agent/feedback', authenticateJWT, (req, res) => identityController.giveFeedback(req, res));

export default router;

