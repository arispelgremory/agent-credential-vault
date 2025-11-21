/**
 * OpenAPI 3.0 Schemas for Identity API
 * These schemas define the request/response structures for ERC-8004 agent registration endpoints
 */

export const identitySchemas = {
  RegisterAgentRequest: {
    type: 'object',
    required: ['name', 'description', 'endpoints'],
    properties: {
      type: {
        type: 'string',
        enum: ['Agent', 'MCP'],
        description: 'Type of registration: "Agent" creates agent entry, "MCP" creates MCP entry',
        example: 'MCP'
      },
      name: {
        type: 'string',
        description: 'Agent name',
        example: 'Hello Agent'
      },
      description: {
        type: 'string',
        description: 'Agent description',
        example: 'Hello Agent runs on the x402 Hedera Express server and offers a paid chat endpoint'
      },
      endpoints: {
        type: 'array',
        description: 'List of agent endpoints',
        items: {
          type: 'object',
          required: ['name', 'endpoint', 'version'],
          properties: {
            name: {
              type: 'string',
              example: 'MCP'
            },
            endpoint: {
              type: 'string',
              format: 'uri',
              example: 'https://mcp.agent.eth/'
            },
            capabilities: {
              type: 'object',
              description: 'Optional capabilities as per MCP spec',
              example: {}
            },
            version: {
              type: 'string',
              example: '2025-06-18'
            }
          }
        },
        minItems: 1
      },
      supportedTrust: {
        type: 'array',
        description: 'Supported trust mechanisms',
        items: {
          type: 'string'
        },
        example: ['reputation']
      },
      tokenId: {
        type: 'string',
        description: 'Optional: Hedera account ID (e.g., "0.0.1234567") or token ID as string',
        example: '0.0.1234567'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Owner private key (optional, falls back to env variable)',
        example: '0x...'
      }
    }
  },

  RegisterAgentResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Agent registered successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            description: 'Registered agent ID',
            example: '1234567890'
          },
          txHash: {
            type: 'string',
            description: 'Transaction hash',
            example: '0x...'
          },
          owner: {
            type: 'string',
            description: 'Agent owner address',
            example: '0x...'
          },
          registrationUri: {
            type: 'string',
            description: 'IPFS URI for agent metadata',
            example: 'ipfs://Qm...'
          },
          metadataCid: {
            type: 'string',
            description: 'IPFS CID for agent metadata',
            example: 'Qm...'
          }
        }
      }
    }
  },

  SetAgentUriRequest: {
    type: 'object',
    required: ['agentId', 'uri'],
    properties: {
      agentId: {
        type: 'string',
        description: 'Agent ID',
        example: '1234567890'
      },
      uri: {
        type: 'string',
        description: 'Agent URI (IPFS, HTTPS, etc.)',
        example: 'ipfs://Qm...'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Owner private key (optional)',
        example: '0x...'
      }
    }
  },

  SetAgentUriResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Agent URI updated successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          uri: {
            type: 'string',
            example: 'ipfs://Qm...'
          },
          txHash: {
            type: 'string',
            example: '0x...'
          }
        }
      }
    }
  },

  SetAgentMetadataRequest: {
    type: 'object',
    required: ['agentId', 'key', 'value'],
    properties: {
      agentId: {
        type: 'string',
        description: 'Agent ID',
        example: '1234567890'
      },
      key: {
        type: 'string',
        description: 'Metadata key',
        example: 'agentMetadata'
      },
      value: {
        type: 'string',
        description: 'Metadata value (JSON string)',
        example: '{"type":"https://eips.ethereum.org/EIPS/eip-8004#registration-v1",...}'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Owner private key (optional)',
        example: '0x...'
      }
    }
  },

  SetAgentMetadataResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Agent metadata updated successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          key: {
            type: 'string',
            example: 'agentMetadata'
          },
          value: {
            type: 'string',
            example: '{"type":"..."}'
          },
          txHash: {
            type: 'string',
            example: '0x...'
          }
        }
      }
    }
  },

  GetAgentMetadataResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Agent metadata retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          key: {
            type: 'string',
            example: 'agentMetadata'
          },
          value: {
            type: 'string',
            description: 'Metadata value as JSON string',
            example: '{"type":"https://eips.ethereum.org/EIPS/eip-8004#registration-v1",...}'
          }
        }
      }
    }
  },

  GetAgentOwnerResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Agent owner retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          owner: {
            type: 'string',
            description: 'Agent owner address',
            example: '0x...'
          }
        }
      }
    }
  },

  HCS10BroadcastRequest: {
    type: 'object',
    required: ['agentId', 'topicId'],
    properties: {
      agentId: {
        type: 'string',
        description: 'Agent ID',
        example: '1234567890'
      },
      topicId: {
        type: 'string',
        description: 'HCS topic ID',
        example: '0.0.7135055'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Owner private key (optional)',
        example: '0x...'
      }
    }
  },

  HCS10BroadcastResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'HCS-10 broadcast successful'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          topicId: {
            type: 'string',
            example: '0.0.7135055'
          },
          reference: {
            type: 'string',
            description: 'HCS reference (hcs://topicId/sequenceNumber)',
            example: 'hcs://0.0.7135055/12345'
          },
          txHash: {
            type: 'string',
            example: 'hcs-tx'
          }
        }
      }
    }
  },

  HCS11ProfileRequest: {
    type: 'object',
    required: ['agentId', 'topicId', 'displayName', 'description', 'maintainer', 'capabilities'],
    properties: {
      agentId: {
        type: 'string',
        description: 'Agent ID',
        example: '1234567890'
      },
      topicId: {
        type: 'string',
        description: 'HCS topic ID',
        example: '0.0.7135055'
      },
      displayName: {
        type: 'string',
        description: 'Agent display name',
        example: 'Hello Agent'
      },
      description: {
        type: 'string',
        description: 'Agent description',
        example: 'Agent registered on Hedera with ERC-8004 alignment'
      },
      maintainer: {
        type: 'string',
        description: 'Maintainer address',
        example: '0x...'
      },
      capabilities: {
        type: 'array',
        description: 'Agent capabilities',
        items: {
          type: 'string'
        },
        example: ['greetings', 'feedback']
      },
      websites: {
        type: 'array',
        description: 'Agent websites',
        items: {
          type: 'string',
          format: 'uri'
        },
        example: ['http://localhost:4021/a2a/.well-known/agent-card.json']
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Owner private key (optional)',
        example: '0x...'
      }
    }
  },

  HCS11ProfileResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'HCS-11 profile published successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          topicId: {
            type: 'string',
            example: '0.0.7135055'
          },
          reference: {
            type: 'string',
            description: 'HCS reference',
            example: 'hcs://0.0.7135055/12346'
          },
          profileUri: {
            type: 'string',
            description: 'IPFS URI for profile',
            example: 'ipfs://Qm...'
          },
          profileCid: {
            type: 'string',
            description: 'IPFS CID for profile',
            example: 'Qm...'
          }
        }
      }
    }
  },

  ValidationRequest: {
    type: 'object',
    required: ['agentId', 'validatorAddress', 'intent', 'referenceUri'],
    properties: {
      agentId: {
        type: 'string',
        description: 'Agent ID',
        example: '1234567890'
      },
      validatorAddress: {
        type: 'string',
        description: 'Validator address',
        example: '0x...'
      },
      intent: {
        type: 'string',
        description: 'Validation intent',
        example: 'baseline-quality-check'
      },
      referenceUri: {
        type: 'string',
        description: 'Reference URI',
        example: 'ipfs://Qm...'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Owner private key (optional)',
        example: '0x...'
      }
    }
  },

  ValidationRequestResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Validation request submitted successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          validatorAddress: {
            type: 'string',
            example: '0x...'
          },
          requestUri: {
            type: 'string',
            example: 'ipfs://Qm...'
          },
          requestHash: {
            type: 'string',
            description: 'Keccak256 hash of validation request',
            example: '0x...'
          },
          txHash: {
            type: 'string',
            example: '0x...'
          }
        }
      }
    }
  },

  ValidationResponse: {
    type: 'object',
    required: ['requestHash', 'response', 'responseUri', 'responseHash', 'tag'],
    properties: {
      requestHash: {
        type: 'string',
        description: 'Original validation request hash',
        example: '0x...'
      },
      response: {
        type: 'number',
        description: 'Validation response score (0-100)',
        example: 95
      },
      responseUri: {
        type: 'string',
        description: 'IPFS URI for validation response',
        example: 'ipfs://Qm...'
      },
      responseHash: {
        type: 'string',
        description: 'Keccak256 hash of validation response',
        example: '0x...'
      },
      tag: {
        type: 'string',
        description: 'Validation tag',
        example: 'validator:baseline-pass'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Validator private key (optional)',
        example: '0x...'
      }
    }
  },

  ValidationResponseResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Validation response submitted successfully'
      },
      data: {
        type: 'object',
        properties: {
          requestHash: {
            type: 'string',
            example: '0x...'
          },
          response: {
            type: 'number',
            example: 95
          },
          txHash: {
            type: 'string',
            example: '0x...'
          }
        }
      }
    }
  },

  FeedbackRequest: {
    type: 'object',
    required: ['agentId', 'score', 'feedbackUri', 'feedbackAuth'],
    properties: {
      agentId: {
        type: 'string',
        description: 'Agent ID',
        example: '1234567890'
      },
      score: {
        type: 'number',
        description: 'Feedback score (0-100)',
        example: 95,
        minimum: 0,
        maximum: 100
      },
      tag1: {
        type: 'string',
        description: 'First feedback tag',
        example: 'excellent'
      },
      tag2: {
        type: 'string',
        description: 'Second feedback tag',
        example: 'reliable'
      },
      feedbackUri: {
        type: 'string',
        description: 'HCS reference URI for feedback',
        example: 'hcs://0.0.7135055/12347'
      },
      feedbackAuth: {
        type: 'string',
        description: 'Signed feedback authorization',
        example: '0x...'
      },
      ownerPrivateKey: {
        type: 'string',
        description: 'Feedback giver private key (optional)',
        example: '0x...'
      }
    }
  },

  FeedbackResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Feedback submitted successfully'
      },
      data: {
        type: 'object',
        properties: {
          agentId: {
            type: 'string',
            example: '1234567890'
          },
          score: {
            type: 'number',
            example: 95
          },
          txHash: {
            type: 'string',
            example: '0x...'
          }
        }
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
        example: 'Invalid request'
      },
      data: {
        type: 'object',
        nullable: true,
        example: null
      },
      error: {
        type: 'string',
        description: 'Detailed error message',
        example: 'Agent ID is required'
      }
    }
  }
};

export const identityPaths = {
  '/identity/agent/register': {
    post: {
      tags: ['Identity'],
      summary: 'Register a new agent or MCP server',
      description: 'Register an agent with ERC-8004 protocol. Optionally specify tokenId for Hedera account ID registration.',
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
              $ref: '#/components/schemas/RegisterAgentRequest'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Agent registered successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterAgentResponse'
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
  },

  '/identity/agent/{agentId}/uri': {
    post: {
      tags: ['Identity'],
      summary: 'Set agent URI',
      description: 'Update the token URI for an agent',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'agentId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Agent ID',
          example: '1234567890'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SetAgentUriRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Agent URI updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SetAgentUriResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/{agentId}/metadata': {
    post: {
      tags: ['Identity'],
      summary: 'Set agent metadata',
      description: 'Set on-chain metadata for an agent',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'agentId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Agent ID',
          example: '1234567890'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SetAgentMetadataRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Agent metadata updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SetAgentMetadataResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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
    },
    get: {
      tags: ['Identity'],
      summary: 'Get agent metadata',
      description: 'Retrieve on-chain metadata for an agent',
      parameters: [
        {
          name: 'agentId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Agent ID',
          example: '1234567890'
        },
        {
          name: 'key',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            default: 'agentMetadata'
          },
          description: 'Metadata key',
          example: 'agentMetadata'
        }
      ],
      responses: {
        '200': {
          description: 'Agent metadata retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GetAgentMetadataResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/{agentId}/owner': {
    get: {
      tags: ['Identity'],
      summary: 'Get agent owner',
      description: 'Get the owner address of an agent',
      parameters: [
        {
          name: 'agentId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Agent ID',
          example: '1234567890'
        }
      ],
      responses: {
        '200': {
          description: 'Agent owner retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GetAgentOwnerResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/hcs10/broadcast': {
    post: {
      tags: ['Identity'],
      summary: 'Broadcast agent via HCS-10',
      description: 'Broadcast agent announcement via Hedera Consensus Service topic (HCS-10 standard)',
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
              $ref: '#/components/schemas/HCS10BroadcastRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'HCS-10 broadcast successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HCS10BroadcastResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/hcs11/publish': {
    post: {
      tags: ['Identity'],
      summary: 'Publish profile via HCS-11',
      description: 'Publish agent profile metadata via Hedera Consensus Service topic (HCS-11 standard)',
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
              $ref: '#/components/schemas/HCS11ProfileRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'HCS-11 profile published successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HCS11ProfileResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/validation/request': {
    post: {
      tags: ['Identity'],
      summary: 'Request validation',
      description: 'Request validation for an agent from a validator',
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
              $ref: '#/components/schemas/ValidationRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Validation request submitted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationRequestResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/validation/response': {
    post: {
      tags: ['Identity'],
      summary: 'Submit validation response',
      description: 'Submit validation response from a validator',
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
              $ref: '#/components/schemas/ValidationResponse'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Validation response submitted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationResponseResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

  '/identity/agent/feedback': {
    post: {
      tags: ['Identity'],
      summary: 'Give feedback',
      description: 'Submit feedback/reputation for an agent',
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
              $ref: '#/components/schemas/FeedbackRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Feedback submitted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/FeedbackResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
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

export const identitySecuritySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token obtained from login endpoint'
  }
};

export const openApiIdentitySpec = {
  openapi: '3.0.0',
  info: {
    title: 'Identity API',
    version: '1.0.0',
    description: 'ERC-8004 agent registration and identity management API endpoints'
  },
  // Server URL is set in swagger.config.ts to avoid duplication
  components: {
    securitySchemes: identitySecuritySchemes,
    schemas: identitySchemas
  },
  paths: identityPaths
};

