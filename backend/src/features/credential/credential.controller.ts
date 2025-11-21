import { Request, Response } from 'express';
import { CredentialRepository } from './credential.repository.js';
import { CreateCredentialRequest, UpdateCredentialRequest, CredentialResponse } from './credential.model.js';
import { Error as ErrorMessages } from '@/error/index.js';
import { AuthRepository } from '@/features/auth/auth.repository.js';
import { encryptPrivateKey } from '@/util/encryption.js';

export class CredentialController {
  private credentialRepository: CredentialRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.credentialRepository = new CredentialRepository();
    this.authRepository = new AuthRepository();
  }

  /**
   * Mask sensitive data before sending to frontend
   * NEVER send full decrypted private keys or account IDs to client
   */
  private maskSensitiveData(credentialData: Record<string, unknown> | undefined, credentialType: string): Record<string, unknown> {
    if (!credentialData) {
      return {};
    }

    // Helper function to mask a string (show only first 2 and last 2 characters)
    const maskString = (str: string, minLength: number = 6): string => {
      if (!str || str === 'N/A' || str.length < minLength) {
        return str || 'N/A';
      }
      if (str.length <= 4) {
        return '****';
      }
      return `${str.substring(0, 2)}${'*'.repeat(Math.max(0, str.length - 4))}${str.substring(str.length - 2)}`;
    };

    // For Hedera credentials, mask all sensitive data
    if (credentialType === 'hedera') {
      const data = credentialData as { operatorAccountId?: string; privateKey?: string; network?: string };
      const maskedData: Record<string, unknown> = {
        operatorAccountId: data.operatorAccountId ? maskString(data.operatorAccountId) : 'N/A',
        privateKey: data.privateKey ? maskString(data.privateKey) : 'N/A',
        network: data.network || 'testnet', // Network is not sensitive
      };

      return maskedData;
    }

    // For other credential types, mask all string values
    const maskedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(credentialData)) {
      if (typeof value === 'string' && value.length > 0) {
        // Mask all string values except common non-sensitive fields
        const nonSensitiveFields = ['network', 'status', 'type', 'name', 'description'];
        if (nonSensitiveFields.includes(key.toLowerCase())) {
          maskedData[key] = value;
        } else {
          maskedData[key] = maskString(value);
        }
      } else {
        maskedData[key] = value;
      }
    }

    return maskedData;
  }

  /**
   * Get current user from JWT token
   */
  private async getCurrentUser(req: Request): Promise<string | null> {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) {
      return null;
    }

    const user = await this.authRepository.getUserDataByToken(token);
    return user?.userId || null;
  }

  /**
   * Get credential for current user
   */
  async getCredential(req: Request, res: Response) {
    try {
      const userId = await this.getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
          data: null,
        });
      }

      const credential = await this.credentialRepository.getCredentialByUserId(userId);
      if (!credential) {
        return res.status(200).json({
          success: true,
          message: 'Credential not found',
          data: null,
        });
      }

      // Return response with SAFE credentialData (masked private key for display only)
      // NEVER send full decrypted private keys to frontend for security
      const safeCredentialData = this.maskSensitiveData(credential.credentialData, credential.credentialType);
      
      const response: CredentialResponse & { credentialData?: Record<string, unknown> } = {
        credentialId: credential.credentialId!,
        userId: credential.userId,
        credentialType: credential.credentialType,
        status: credential.status || 'ACTIVE',
        createdAt: credential.createdAt!,
        updatedAt: credential.updatedAt!,
        credentialData: safeCredentialData, // Include safe (masked) credential data
      };

      return res.status(200).json({
        success: true,
        message: 'Credential retrieved successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get credential error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  /**
   * Create or update credential for current user
   */
  async upsertCredential(req: Request, res: Response) {
    try {
      const userId = await this.getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
          data: null,
        });
      }

      const body = req.body;

      // Support both old format (operatorAccountId, privateKey) and new format (credentialType, credentialData)
      let createRequest: CreateCredentialRequest;
      
      if (body.operatorAccountId && body.privateKey) {
        // Old format - transform to new format for backward compatibility
        // Encrypt individual fields before storing
        const encryptedAccountId = encryptPrivateKey(body.operatorAccountId);
        const encryptedPrivateKey = encryptPrivateKey(body.privateKey);
        const encryptedNetwork = encryptPrivateKey(body.network || 'testnet');
        
        createRequest = {
          credentialType: 'hedera',
          credentialData: {
            operatorAccountId: encryptedAccountId,
            privateKey: encryptedPrivateKey,
            network: encryptedNetwork,
          },
        };
      } else if (body.credentialType && body.credentialData) {
        // New format
        createRequest = {
          credentialType: body.credentialType,
          credentialData: body.credentialData,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either (operatorAccountId and privateKey) or (credentialType and credentialData) are required',
          data: null,
        });
      }

      console.log('createRequest', createRequest);

      const credential = await this.credentialRepository.upsertCredential(
        userId,
        createRequest,
        userId // createdBy/updatedBy
      );

      // Return safe response
      const response: CredentialResponse = {
        credentialId: credential.credentialId!,
        userId: credential.userId,
        credentialType: credential.credentialType,
        status: credential.status || 'ACTIVE',
        createdAt: credential.createdAt!,
        updatedAt: credential.updatedAt!,
      };

      return res.status(200).json({
        success: true,
        message: 'Credential saved successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Upsert credential error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  /**
   * Delete credential for current user
   */
  async deleteCredential(req: Request, res: Response) {
    try {
      const userId = await this.getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
          data: null,
        });
      }

      const deleted = await this.credentialRepository.deleteCredential(userId, userId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Credential not found',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Credential deleted successfully',
        data: null,
      });
    } catch (error: any) {
      console.error('Delete credential error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  async getDecryptedCredentialByUserId(userId: string) {
    try {
      return await this.credentialRepository.getDecryptedCredentialByUserId(userId);
    } catch (error: any) {
      console.error('Get decrypted credential error:', error);
      throw new Error(error.message || ErrorMessages.INTERNAL_SERVER_ERROR);
    }
  }
}

