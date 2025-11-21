// DB
import { User, UserType } from './auth.model.js';
import { db } from '@/db/index';
import { eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
// JWT
import { verifyToken } from '@/features/jwt/jwt.controller.js';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres/index.js';
import { PgTransaction } from 'drizzle-orm/pg-core/index.js';
import { AccountInfoResponse } from '../hedera/account/account.model.js';
import { HederaAccountRepository } from '../hedera/account/account.repository.js';
import { hashPassword } from '@/util/password-checker.js';

/**
 * Authentication Repository
 * Handles all database operations related to user authentication
 * 
 * @class AuthRepository
 */
export class AuthRepository {
  /**
   * Get user data by JWT token
   * 
   * @param {string} token - JWT access token
   * @returns {Promise<UserType | null>} User data or null if not found/invalid token
   * 
   * @example
   * const user = await authRepository.getUserDataByToken(token);
   */
  async getUserDataByToken(token: string): Promise<UserType | null> {
    try {
      const decodedToken = verifyToken(token);

      if (!decodedToken.username) {
        throw new Error('(getUserByToken) Invalid token: username not found');
      }

      const loginType = decodedToken.loginType;
      let user: UserType | null = null;
      let hederaAccount: AccountInfoResponse | null = null;

      if (loginType === 'EMAIL') {
        user = await this.getUserByEmail(decodedToken.username);
        if (!user) {
          throw new Error('User not found');
        }
        hederaAccount = await new HederaAccountRepository().getAccount(user?.accountId);
      } else if (loginType === 'CONTACT_NO') {
        user = await this.getUserByContactNo(decodedToken.username);
        if (!user) {
          throw new Error('User not found');
        }
        hederaAccount = await new HederaAccountRepository().getAccount(user?.accountId);
      }

      return user ? user : null;
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  /**
   * Get user by email address
   * 
   * @param {string} email - User email address
   * @returns {Promise<UserType | null>} User data or null if not found
   * 
   * @example
   * const user = await authRepository.getUserByEmail('user@example.com');
   */
  async getUserByEmail(email: string): Promise<UserType | null> { 
    const users = await db.select().from(User).where(eq(User.userEmail, email)).limit(1);
    return users.length > 0 && users[0].userId ? { ...users[0], balance: 0 } as UserType : null;
  }
    
  /**
   * Get user by contact number
   * 
   * @param {string} contactNo - User contact number
   * @returns {Promise<UserType | null>} User data or null if not found
   * 
   * @example
   * const user = await authRepository.getUserByContactNo('+1234567890');
   */
  async getUserByContactNo(contactNo: string): Promise<UserType | null> { 
    const users = await db.select().from(User).where(eq(User.userContactNo, contactNo)).limit(1);
    return users.length > 0 && users[0].userId ? { ...users[0], balance: 0 } as UserType : null;
  }

  /**
   * Create a new user
   * 
   * @param {UserType} userData - User data to create
   * @param {PgTransaction} [tx] - Optional database transaction
   * @returns {Promise<Array<UserType>>} Created user data
   * @throws {Error} If user data is missing
   * 
   * @example
   * const user = await authRepository.createUser({
   *   userEmail: 'user@example.com',
   *   userContactNo: '+1234567890',
   *   // ... other fields
   * });
   */
  async createUser(userData: UserType, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) {
    if (!userData) {
      throw new Error('Create User: User data is required');
    }
    
    if (tx) {
      return await tx.insert(User).values({
        ...userData,
        userId: sql`'USR_' || substr(gen_random_uuid()::text, 1, 32)`
      }).returning();
    }
    return await db.insert(User).values({
      ...userData,
      userId: sql`'USR_' || substr(gen_random_uuid()::text, 1, 32)`
    }).returning();
  }

  /**
   * Update user data
   * 
   * @param {string} userId - User ID to update
   * @param {Partial<UserType>} userData - Partial user data to update
   * @param {PgTransaction} [tx] - Optional database transaction
   * @returns {Promise<Array<UserType>>} Updated user data
   * @throws {Error} If userId or userData is missing
   * 
   * @example
   * const updatedUser = await authRepository.updateUser(userId, {
   *   userFirstName: 'John',
   *   userLastName: 'Doe'
   * });
   */
  async updateUser(userId: string, userData: Partial<UserType>, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) {
    if (!userId || !userData) {
      throw new Error('Update User: User ID and user data are required');
    }
    
    if (tx) {
      return await tx.update(User).set(userData).where(eq(User.userId, userId)).returning();
    }
    return await db.update(User).set(userData).where(eq(User.userId, userId)).returning();
  }

  /**
   * Initialize admin account if it doesn't exist
   * Creates an admin user with email admin@mail.com and password admin123
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * await authRepository.initAccount();
   */
  async initAccount(): Promise<void> {
    try {
      // Check if admin account already exists
      const existingAdmin = await this.getUserByEmail('admin@mail.com');
      
      if (existingAdmin) {
        console.log('✅ Admin account already exists');
        return;
      }

      // Hash the password
      const hashedPassword = await hashPassword('admin123');
      
      const adminUserData: Partial<UserType> = {
        userEmail: 'admin@mail.com',
        userContactNo: '+10000000000', // Placeholder contact number for admin
        userPassword: hashedPassword,
        userFirstName: 'Admin',
        userLastName: 'User',
        gender: 'MALE',
        accountId: '',
        roleId: null,
        sessionId: null,
        status: 'ACTIVE',
        kycStatus: 'verified',
        kycSubmittedAt: null,
        createdBy: 'system',
        updatedBy: 'system'
      };

      // Create admin user and Hedera account in a transaction
      await db.transaction(async (tx: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
        const createdUser = await this.createUser(adminUserData as UserType, tx);
        const createdHederaAccount = await new HederaAccountRepository().createAccount({ 
          accountName: adminUserData.userFirstName + ' ' + adminUserData.userLastName, 
          accountType: 'USER', 
          network: 'testnet', 
          isOperator: false 
        }, undefined, tx);
        adminUserData.accountId = createdHederaAccount.accountId;
        await this.updateUser(createdUser[0].userId, adminUserData, tx);
      });

      console.log('✅ Admin account created successfully (admin@mail.com / admin123)');
    } catch (error) {
      console.error('⚠️  Failed to initialize admin account:', error);
      // Don't throw - allow server to start even if admin account creation fails
    }
  }
}






