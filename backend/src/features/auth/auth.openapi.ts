/**
 * OpenAPI 3.0 Schemas for Auth API
 * These schemas define the request/response structures for authentication endpoints
 */

export const authSchemas = {
  UserLogin: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        description: 'User email or contact number',
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        format: 'password',
        description: 'User password',
        example: 'SecurePassword123!'
      }
    }
  },
  
  UserRegister: {
    type: 'object',
    required: ['userEmail', 'userContactNo', 'userPassword', 'userFirstName', 'userLastName', 'gender'],
    properties: {
      userEmail: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'user@example.com'
      },
      userContactNo: {
        type: 'string',
        description: 'User contact number',
        example: '+1234567890'
      },
      userPassword: {
        type: 'string',
        format: 'password',
        description: 'User password (will be hashed)',
        example: 'SecurePassword123!'
      },
      userFirstName: {
        type: 'string',
        description: 'User first name',
        example: 'John'
      },
      userLastName: {
        type: 'string',
        description: 'User last name',
        example: 'Doe'
      },
      gender: {
        type: 'string',
        enum: ['MALE', 'FEMALE', 'OTHER'],
        description: 'User gender',
        example: 'MALE'
      },
      roleId: {
        type: 'string',
        nullable: true,
        description: 'User role ID (optional)',
        example: 'ROLE_USER'
      }
    }
  },
  
  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        description: 'Refresh token to generate new access token',
        example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },
  
  LoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: ''
      },
      data: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'JWT access token',
            example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refreshToken: {
            type: 'string',
            description: 'JWT refresh token',
            example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expiredAt: {
            type: 'number',
            description: 'Token expiration timestamp in milliseconds',
            example: 1735689600000
          },
          roleName: {
            type: 'string',
            description: 'User role name',
            example: 'USER'
          }
        }
      }
    }
  },
  
  RegisterResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'User registration successful'
      },
      data: {
        type: 'object',
        nullable: true,
        example: null
      }
    }
  },
  
  RefreshTokenResponse: {
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        description: 'New JWT access token',
        example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },
  
  UserProfile: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'Unique user identifier',
        example: 'USR_1234567890abcdef1234567890abcdef'
      },
      userEmail: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'user@example.com'
      },
      userContactNo: {
        type: 'string',
        description: 'User contact number',
        example: '+1234567890'
      },
      userFirstName: {
        type: 'string',
        description: 'User first name',
        example: 'John'
      },
      userLastName: {
        type: 'string',
        description: 'User last name',
        example: 'Doe'
      },
      gender: {
        type: 'string',
        description: 'User gender',
        example: 'MALE'
      },
      accountId: {
        type: 'string',
        description: 'Hedera account ID',
        example: '0.0.123456'
      },
      roleId: {
        type: 'string',
        nullable: true,
        description: 'User role ID',
        example: 'ROLE_USER'
      },
      balance: {
        type: 'number',
        description: 'User account balance',
        example: 0
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        description: 'User account status',
        example: 'ACTIVE'
      }
    }
  },
  
  UserProfileResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'User fetched successfully'
      },
      data: {
        type: 'object',
        properties: {
          userInfo: {
            $ref: '#/components/schemas/UserProfile'
          },
          hederaAccount: {
            type: 'object',
            description: 'Hedera account information',
            properties: {
              accountId: {
                type: 'string',
                example: '0.0.123456'
              },
              balance: {
                type: 'object',
                properties: {
                  hbars: {
                    type: 'string',
                    example: '100.0'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  UserVerificationStatus: {
    type: 'object',
    required: ['userId', 'kycStatus'],
    properties: {
      userId: {
        type: 'string',
        description: 'User ID',
        example: 'USR_1234567890abcdef1234567890abcdef'
      },
      kycStatus: {
        type: 'string',
        enum: ['pending_verification', 'in_progress', 'under_review', 'verified', 'rejected'],
        description: 'KYC status',
        example: 'pending_verification'
      },
      kycSubmittedAt: {
        type: 'string',
        format: 'date-time',
        description: 'KYC submitted at',
        example: '2025-11-17T04:01:32.591Z'
      }
    },
    kycStatus: {
      type: 'string',
      enum: ['pending_verification', 'in_progress', 'under_review', 'verified', 'rejected'],
      description: 'KYC status',
      example: 'pending_verification'
    }
  },
  
  UserVerificationStatusResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'User verification status updated successfully'
      },
      data: {
        type: 'object',
        nullable: true,
        example: null
      }
    }
  },
  
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        description: 'Error message',
        example: 'Invalid credentials'
      },
      data: {
        type: 'object',
        nullable: true,
        example: null
      }
    }
  }
};

export const authPaths = {
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user with username (email or contact number) and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserLogin'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing required fields',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - invalid credentials',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'User registration',
      description: 'Register a new user account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserRegister'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterResponse'
              }
            }
          }
        },
        '409': {
          description: 'Conflict - user already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  
  '/auth/refresh-token': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Generate a new access token using a valid refresh token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RefreshTokenRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'New access token generated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RefreshTokenResponse'
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - invalid or expired refresh token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  
  '/auth/user/profile': {
    get: {
      tags: ['Authentication'],
      summary: 'Get user profile',
      description: 'Get authenticated user profile information',
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfileResponse'
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - missing or invalid token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  
  '/auth/user/verification-status': {
    put: {
      tags: ['Authentication'],
      summary: 'Update user verification status',
      description: 'Update user verification status by user ID and KYC status',
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserVerificationStatus'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'User verification status updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserVerificationStatusResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing required fields',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - missing or invalid token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  }
};

export const authSecuritySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token obtained from login endpoint'
  }
};

export const openApiAuthSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Auth API',
    version: '1.0.0',
    description: 'Authentication and user management API endpoints'
  },
  // Server URL is set in swagger.config.ts to avoid duplication
  components: {
    securitySchemes: authSecuritySchemes,
    schemas: authSchemas
  },
  paths: authPaths
};

