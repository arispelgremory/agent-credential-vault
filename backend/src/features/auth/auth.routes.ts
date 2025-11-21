import { Router } from 'express';
import { AuthController } from '@/features/auth/auth.controller.js';
import authenticateJWT from '@/middleware/authenticate-jwt';

const router = Router();
const authController = new AuthController();

// Define routes
router.post('/login', (req, res) => authController.userLogin(req, res));
router.post('/register', (req, res) => authController.registerUser(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.get('/user/profile', authenticateJWT, (req, res) => authController.getUserByToken(req, res));
router.put('/user/verification-status', authenticateJWT, (req, res) => authController.updateUserVerificationStatus(req, res));

export default router;