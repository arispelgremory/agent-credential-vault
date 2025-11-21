import { Credential, CredentialType, CreateCredentialRequest, UpdateCredentialRequest } from './credential.model.js';
import { db } from '@/db/index.js';
import { eq, and } from 'drizzle-orm';
import { encryptPrivateKey, decryptPrivateKey } from '@/util/encryption.js';

/**
 * Credential Repository
 * Handles all database operations related to user credentials
 */
export class CredentialRepository {
  /**
   * Get credential by user ID
   */
  async getCredentialByUserId(userId: string): Promise<CredentialType | null> {
    const credentials = await db
      .select()
      .from(Credential)
      .where(
        and(
          eq(Credential.userId, userId),
          eq(Credential.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (credentials.length === 0) {
      return null;
    }

    const cred = credentials[0];
    
    // Decrypt credentialData
    let decryptedData: Record<string, unknown>;
    try {
      // credentialData from JSONB is already an object, not a string
      const rawData = cred.credentialData;
      
      // Check if it's already an object (JSONB) or a string
      let parsed: Record<string, unknown>;
      if (typeof rawData === 'string') {
        // If it's a string, try to parse it
        try {
          parsed = JSON.parse(rawData);
        } catch {
          // If not JSON, try decrypting the entire string (old format)
          parsed = JSON.parse(decryptPrivateKey(rawData));
        }
      } else {
        // Already an object (JSONB)
        parsed = rawData as Record<string, unknown>;
      }
      
      // If it's a Hedera credential with encrypted fields, decrypt each field
      if (cred.credentialType === 'hedera' && 
          typeof parsed.operatorAccountId === 'string' && 
          typeof parsed.privateKey === 'string' &&
          parsed.operatorAccountId.includes(':')) {
        decryptedData = {
          operatorAccountId: decryptPrivateKey(parsed.operatorAccountId),
          privateKey: decryptPrivateKey(parsed.privateKey),
          network: parsed.network && typeof parsed.network === 'string' ? decryptPrivateKey(parsed.network) : 'testnet',
        };
      } else {
        decryptedData = parsed;
      }
    } catch (error) {
      console.error('Error decrypting credential data:', error);
      decryptedData = {};
    }
    
    return {
      credentialId: cred.credentialId,
      userId: cred.userId,
      credentialType: cred.credentialType,
      credentialData: decryptedData,
      status: cred.status || 'ACTIVE',
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      createdBy: cred.createdBy,
      updatedBy: cred.updatedBy,
    };
  }

  /**
   * Get decrypted credential by user ID
   * Returns decrypted operatorAccountId and privateKey (for Hedera credentials)
   */
  async getDecryptedCredentialByUserId(userId: string): Promise<{ operatorAccountId: string; privateKey: string; network: string } | null> {
    // Get raw credential from database (not decrypted)
    const credentials = await db
      .select()
      .from(Credential)
      .where(
        and(
          eq(Credential.userId, userId),
          eq(Credential.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (credentials.length === 0) {
      return null;
    }

    const cred = credentials[0];
    
    if (cred.credentialType !== 'hedera' || !cred.credentialData) {
      return null;
    }

    try {
      // Get raw credentialData (could be object or string)
      const rawData = cred.credentialData;
      
      // Parse the credentialData
      let parsed: Record<string, unknown>;
      if (typeof rawData === 'string') {
        try {
          parsed = JSON.parse(rawData);
        } catch {
          // If not JSON, try decrypting the entire string (old format)
          parsed = JSON.parse(decryptPrivateKey(rawData));
        }
      } else {
        // Already an object (JSONB)
        parsed = rawData as Record<string, unknown>;
      }

      // Extract the fields
      const operatorAccountId = parsed.operatorAccountId;
      const privateKey = parsed.privateKey;
      const network = parsed.network;

      if (!operatorAccountId || !privateKey || 
          typeof operatorAccountId !== 'string' || 
          typeof privateKey !== 'string') {
        return null;
      }

      // Check if fields are already decrypted
      // Encrypted strings have format: "iv:tag:encrypted" where iv and tag are hex strings
      const isEncrypted = (str: string) => {
        if (typeof str !== 'string') {
          return false;
        }
        const parts = str.split(':');
        if (parts.length !== 3) {
          return false;
        }
        // Check if first two parts are valid hex (IV and tag)
        const hexPattern = /^[0-9a-fA-F]+$/;
        return hexPattern.test(parts[0]) && hexPattern.test(parts[1]) && parts[0].length > 0 && parts[1].length > 0;
      };

      let decryptedAccountId: string;
      let decryptedPrivateKey: string;
      let decryptedNetwork: string;

      if (isEncrypted(operatorAccountId)) {
        decryptedAccountId = decryptPrivateKey(operatorAccountId);
      } else {
        decryptedAccountId = operatorAccountId;
      }

      if (isEncrypted(privateKey)) {
        decryptedPrivateKey = decryptPrivateKey(privateKey);
      } else {
        decryptedPrivateKey = privateKey;
      }

      if (network && typeof network === 'string' && isEncrypted(network)) {
        decryptedNetwork = decryptPrivateKey(network);
      } else {
        decryptedNetwork = (network && typeof network === 'string') ? network : 'testnet';
      }
      
      return {
        operatorAccountId: decryptedAccountId,
        privateKey: decryptedPrivateKey,
        network: decryptedNetwork,
      };
    } catch (error) {
      console.error('Error getting decrypted credential:', error);
      throw new Error('Failed to get decrypted credential');
    }
  }

  /**
   * Create or update credential for a user
   */
  async upsertCredential(
    userId: string,
    data: CreateCredentialRequest,
    createdBy: string
  ): Promise<CredentialType> {
    // Validate credentialData exists
    if (!data.credentialData || typeof data.credentialData !== 'object') {
      throw new Error('credentialData must be a valid object');
    }

    // Check if credentialData fields are already encrypted (for Hedera credentials)
    // If they are already encrypted strings, use them as-is; otherwise encrypt the entire object
    let encryptedCredentialData: string;
    
    if (data.credentialType === 'hedera' && 
        typeof data.credentialData.operatorAccountId === 'string' &&
        typeof data.credentialData.privateKey === 'string' &&
        data.credentialData.operatorAccountId.includes(':') && // Encrypted strings contain colons
        data.credentialData.privateKey.includes(':')) {
      // Fields are already encrypted, just stringify the object
      encryptedCredentialData = JSON.stringify(data.credentialData);
    } else {
      // Encrypt the entire credentialData object
      encryptedCredentialData = encryptPrivateKey(JSON.stringify(data.credentialData));
    }

    // Check if credential exists
    const existing = await this.getCredentialByUserId(userId);

    if (existing) {
      // Update existing credential
      const [updated] = await db
        .update(Credential)
        .set({
          credentialType: data.credentialType,
          credentialData: encryptedCredentialData as any, // Type assertion for jsonb
          updatedAt: new Date(),
          updatedBy: createdBy,
        })
        .where(eq(Credential.credentialId, existing.credentialId!))
        .returning();

      // Decrypt for return
      let decryptedData: Record<string, unknown>;
      try {
        const rawData = updated.credentialData;
        
        // Check if it's already an object (JSONB) or a string
        let parsed: Record<string, unknown>;
        if (typeof rawData === 'string') {
          parsed = JSON.parse(rawData);
        } else {
          // Already an object (JSONB)
          parsed = rawData as Record<string, unknown>;
        }
        
        // If it's a Hedera credential with encrypted fields, decrypt each field
        if (updated.credentialType === 'hedera' && 
            typeof parsed.operatorAccountId === 'string' && 
            typeof parsed.privateKey === 'string' &&
            parsed.operatorAccountId.includes(':')) {
          decryptedData = {
            operatorAccountId: decryptPrivateKey(parsed.operatorAccountId),
            privateKey: decryptPrivateKey(parsed.privateKey),
            network: parsed.network && typeof parsed.network === 'string' ? decryptPrivateKey(parsed.network) : 'testnet',
          };
        } else {
          decryptedData = parsed;
        }
      } catch (error) {
        console.error('Error decrypting updated credential:', error);
        decryptedData = {};
      }

      return {
        credentialId: updated.credentialId,
        userId: updated.userId,
        credentialType: updated.credentialType,
        credentialData: decryptedData,
        status: updated.status || 'ACTIVE',
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        createdBy: updated.createdBy,
        updatedBy: updated.updatedBy,
      };
    } else {
      // Create new credential
      const [created] = await db
        .insert(Credential)
        .values({
          userId,
          credentialType: data.credentialType,
          credentialData: encryptedCredentialData as any, // Type assertion for jsonb
          status: 'ACTIVE',
          createdBy,
          updatedBy: createdBy,
        })
        .returning();

      // Decrypt for return
      let decryptedData: Record<string, unknown>;
      try {
        const rawData = created.credentialData;
        
        // Check if it's already an object (JSONB) or a string
        let parsed: Record<string, unknown>;
        if (typeof rawData === 'string') {
          parsed = JSON.parse(rawData);
        } else {
          // Already an object (JSONB)
          parsed = rawData as Record<string, unknown>;
        }
        
        // If it's a Hedera credential with encrypted fields, decrypt each field
        if (created.credentialType === 'hedera' && 
            typeof parsed.operatorAccountId === 'string' && 
            typeof parsed.privateKey === 'string' &&
            parsed.operatorAccountId.includes(':')) {
          decryptedData = {
            operatorAccountId: decryptPrivateKey(parsed.operatorAccountId),
            privateKey: decryptPrivateKey(parsed.privateKey),
            network: parsed.network && typeof parsed.network === 'string' ? decryptPrivateKey(parsed.network) : 'testnet',
          };
        } else {
          decryptedData = parsed;
        }
      } catch (error) {
        console.error('Error decrypting created credential:', error);
        decryptedData = {};
      }

      return {
        credentialId: created.credentialId,
        userId: created.userId,
        credentialType: created.credentialType,
        credentialData: decryptedData,
        status: created.status || 'ACTIVE',
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        createdBy: created.createdBy,
        updatedBy: created.updatedBy,
      };
    }
  }

  /**
   * Delete credential (soft delete by setting status to INACTIVE)
   */
  async deleteCredential(userId: string, updatedBy: string): Promise<boolean> {
    const existing = await this.getCredentialByUserId(userId);
    if (!existing) {
      return false;
    }

    await db
      .update(Credential)
      .set({
        status: 'INACTIVE',
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(Credential.credentialId, existing.credentialId!));

    return true;
  }
}

