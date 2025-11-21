import { Request } from 'express';
import { AuthRepository } from '@/features/auth/auth.repository.js';
import { UserType } from '@/features/auth/auth.model.js';

/**
 * Get current user from JWT token in request
 * @param req Express request object
 * @returns User object or null if not authenticated
 */
export async function getUserFromRequest(req: Request): Promise<UserType | null> {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    return null;
  }

  const authRepository = new AuthRepository();
  return await authRepository.getUserDataByToken(token);
}

