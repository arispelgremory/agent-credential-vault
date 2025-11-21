// Model
import { UserLogin, UserType } from '@/features/auth/auth.model.js';
// Repository
import { AuthRepository } from '@/features/auth/auth.repository.js';
import { HederaAccountRepository } from '@/features/hedera/account/account.repository.js';
// Types
import { Request, Response } from 'express';
// JWT
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/features/jwt/index.js';
import { UserTokenInfo } from '@/features/jwt/jwt.model.js';
// Error Types
import { Error } from '@/error/index.js';
// Util
import { isEmail } from '@/util/email-checker.js';
import { isContactNo } from '@/util/contact-number-checker.js';
import { hashPassword, comparePassword } from '@/util/password-checker.js';
import { db } from '@/db';
import z from 'zod';

export class AuthController {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  // User Login
  async userLogin(req: Request, res: Response) {
    try {
      const userInfo: UserLogin = req.body;
      // Validate input
      if (!userInfo.username || !userInfo.password) {
        return res.status(400).json({
          success: false,
          message: 'Username and Password are required',
          data: null,
        });
      }

      const username = userInfo.username;

      let user: UserType | null = null;
      let loginType = '';

      // Fetch user based on username type
      if (isEmail(username)) {
        user = await this.authRepository.getUserByEmail(username);
        loginType = 'EMAIL';  
      } else if (isContactNo(username)) {
        user = await this.authRepository.getUserByContactNo(username);
        loginType = 'CONTACT_NO';
      } 

      // User not found
      if (!user) {
        return res.status(401).json({
          success: false,
          message: Error.INVALID_CREDENTIALS,
          data: null,
        });
      }

      const userTokenInfo: UserTokenInfo = {
        username: userInfo.username,
        loginType: loginType as 'EMAIL' | 'CONTACT_NO', 
        roleName: user.roleId ? user.roleId : ''
      };

      const hashedPassword = user.userPassword; 

      this.verifyPassword(userTokenInfo, userInfo.password, hashedPassword, res);

    } catch (error) {
      console.error('User Login error:', error);
      res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // User Registration
  async registerUser(req: Request, res: Response) {
    const userInfo = req.body;
    try {
      // Check if a user with the same email or contact already exists
      const existingUser = await this.authRepository.getUserByEmail(userInfo.userEmail) 
        || await this.authRepository.getUserByContactNo(userInfo.userContactNo);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: Error.USER_ALREADY_EXISTS,
          data: null
        });
      }

      // Hash the password
      const hashedPassword = await hashPassword(userInfo.userPassword);
      
      const userData: UserType = {
        userEmail: userInfo.userEmail,
        balance: 0,
        userContactNo: userInfo.userContactNo,
        userPassword: hashedPassword,
        userFirstName: userInfo.userFirstName,
        userLastName: userInfo.userLastName,
        gender: userInfo.gender,
        accountId: '',
        roleId: userInfo.roleId,
        sessionId: null,
        status: 'ACTIVE',
        createdBy: 'system',
        updatedBy: 'system'
      };
      try {
        await db.transaction(async (tx) => {
          const createdUser = await this.authRepository.createUser(userData, tx);
          const createdHederaAccount = await new HederaAccountRepository().createAccount({ 
            accountName: userData.userFirstName + ' ' + userData.userLastName, 
            accountType: 'USER', 
              network: 'testnet', 
              isOperator: false 
            }, tx);
          userData.accountId = createdHederaAccount.accountId;
          await this.authRepository.updateUser(createdUser[0].userId, userData, tx);
        });
      } catch (error) {
        console.error('User Registration error:', error);
        return res.status(500).json({
          success: false,
          message: Error.INTERNAL_SERVER_ERROR,
          data: null
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User registration successful',
        data: null
      });

    } catch (error) {
      console.error('User Registration error:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: Error.UNAUTHORIZED,
        data: null
      });
    }

    const user = await this.authRepository.getUserDataByToken(token);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: Error.USER_NOT_FOUND,
        data: null
      });
    }
    const { userPassword, ...userWithoutPassword } = user;

    console.log("userWithoutPassword", userWithoutPassword);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: userWithoutPassword
    });
  }

  async getUserByToken(req: Request, res: Response) {
    // get Bearer token from header
    const token = req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null; // Check for Bearer prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: Error.TOKEN_IS_REQUIRED,
        data: null
      });
    }

    try {
      const { userPassword, ...userWithoutPassword } = await this.authRepository.getUserDataByToken(token);
      

      if (!userWithoutPassword) {
        return res.status(404).json({
          success: false,
          message: Error.USER_NOT_FOUND,
          data: null
        });
      }

      const hederaAccount = await new HederaAccountRepository().getAccountInfo(userWithoutPassword?.accountId);
      // const permissionId = await getRolePermissionByRoleId(user.roleId ? user.roleId : '');

      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: {
          userInfo: userWithoutPassword,
          hederaAccount: hederaAccount
        }
      });
    } catch (error) {
      console.error('Error in getUserByToken:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  async getCompanyAdminByToken(req: Request, res: Response) {
    // get Bearer token from header
    const token = req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null; // Check for Bearer prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: Error.UNAUTHORIZED,
        data: null
      });
    }

    const user = await this.authRepository.getUserDataByToken(token);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: Error.USER_NOT_FOUND,
        data: null
      });
    } 
  }

  async getSuperAdminByToken(req: Request, res: Response) {
    // get Bearer token from header
    const token = req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null; // Check for Bearer prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: Error.UNAUTHORIZED,
        data: null
      });
    }

    const user = await this.authRepository.getUserDataByToken(token);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: Error.USER_NOT_FOUND,
        data: null
      });
    } 
  }

  // Get Account Balance
  async getAccountBalance(req: Request, res: Response) {
    const accountId = req.body.accountId;
    const balance = await new HederaAccountRepository().getAccountBalance(accountId);
    return res.status(200).json({
      success: true,
      message: 'Account balance fetched successfully',
      data: balance
    });
  }

  async refreshToken(req: Request, res: Response) {
    // const cookies = req.headers.cookie;
    // const refreshToken = cookies?.split('=')[1];
    
    const body = req.body;
    console.log(body);
    const refreshToken = body.refreshToken;
    // console.log(refreshToken);

    // const refreshToken = '';

    if (!refreshToken) {
      return res.status(401).json({ message: Error.UNAUTHORIZED });
    }

    try {
      // Verify the refresh token
      const verifiedToken = verifyToken(refreshToken);

      if ('statusCode' in verifiedToken) {
        return res.status(401).json({ message: Error.UNAUTHORIZED });
      }

      let user: UserType | null = null;
      let loginType = '';

      // Generate a new access token using the information from the refresh token
      const newAccessToken = generateAccessToken({
        username: verifiedToken.username,
        loginType: "EMAIL",
        roleName: verifiedToken.roleName
      });

      // Return the new access token
      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ message: Error.INTERNAL_SERVER_ERROR });
    }
  }

  /* 
    Update user verification status by user ID and KYC status
    @param {Request} req - Express request object
    @param {Response} res - Express response object
    @returns {Promise<Response>} - Promise resolving to the response object
  */

  async updateUserVerificationStatus(req: Request, res: Response) {

    // Parameters
    const bodySchema = z.object({
      userId: z.string(),
      kycStatus: z.enum(['pending_verification', 'in_progress', 'under_review', 'verified', 'rejected']),
      kycSubmittedAt: z.iso.datetime(),
    });

    const body = req.body;
    const { success, data, error } = bodySchema.safeParse(body);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: z.prettifyError(error),
        data: null
      });
    }

    const { userId, kycStatus } = data;

    try {
      await this.authRepository.updateUser(userId, { kycStatus });
      return res.status(200).json({
        success: true,
        message: "User verification status updated successfully",
        data: null
      });
    } catch (error) {
      console.error('Error updating user verification status:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Verify Password
  private async verifyPassword(userTokenInfo: UserTokenInfo, password: string, hashedPassword: string, res: Response) {
    try {
      const isPasswordCorrect = await comparePassword(password, hashedPassword);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Username or Password Incorrect',
          data: null
        });
      }

      const accessToken = generateAccessToken(userTokenInfo);
      const refreshToken = generateRefreshToken(userTokenInfo);
      const accessTokenExpiration = verifyToken(accessToken).exp;

      if (accessTokenExpiration === undefined) {
        console.error('Verify Password Error: Token expiration is undefined');
        return res.status(500).json({
          success: false,
          message: Error.INTERNAL_SERVER_ERROR,
          data: null
        });
      }

      res.status(200).json({
        success: true,
        message: '',
        data: {
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiredAt: accessTokenExpiration * 1000,
          roleName: userTokenInfo.roleName
        }
      });
    } catch (error) {
      console.error('Password verification error:', error);
      res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }
}

