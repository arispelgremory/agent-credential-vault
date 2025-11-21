#!/usr/bin/env node
/**
 * Standalone MCP Server for Cursor IDE
 * This server exposes your OpenAPI endpoints as MCP tools
 * 
 * Usage: tsx src/openapi-mcp/mcp-server.ts
 * Or configure in .cursor/mcp.json
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { getToolsFromOpenApi } from 'openapi-mcp-generator';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
// Try to load from backend directory (where .env should be)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../..'); // Go up from src/openapi-mcp to backend root

dotenv.config({ path: path.join(backendDir, '.env') });

// Configuration
const API_PORT = process.env.API_PORT || 9487;
const SPEC_URL = `http://localhost:${API_PORT}/api-docs.json`;
const API_BASE_URL = `http://localhost:${API_PORT}/api/v1`;

// Cache for tools
let cachedTools: any[] = [];
let toolsLoaded = false;

/**
 * Load MCP tools from OpenAPI specification
 */
async function loadTools(): Promise<any[]> {
  if (toolsLoaded && cachedTools.length > 0) {
    return cachedTools;
  }

  try {
    console.error(`[MCP Server] Loading tools from ${SPEC_URL}...`);
    const tools = await getToolsFromOpenApi(SPEC_URL, {
      baseUrl: API_BASE_URL,
      dereference: true,
    });

    cachedTools = tools;
    toolsLoaded = true;
    console.error(`[MCP Server] Loaded ${tools.length} tools`);
    return tools;
  } catch (error) {
    console.error(`[MCP Server] Error loading tools:`, error);
    throw error;
  }
}

/**
 * Convert OpenAPI tool definition to MCP Tool format
 */
function convertToMcpTool(tool: any): Tool {
  return {
    name: tool.name,
    description: tool.description || `Execute ${tool.method.toUpperCase()} ${tool.pathTemplate}`,
    inputSchema: tool.inputSchema,
  };
}

/**
 * Execute an API call based on tool definition
 */
async function executeToolCall(tool: any, args: Record<string, any>): Promise<CallToolResult> {
  try {
    // Build the URL by replacing path parameters
    let url = tool.pathTemplate;
    const pathParams = tool.executionParameters?.filter((p: any) => p.in === 'path') || [];
    pathParams.forEach((param: any) => {
      if (args[param.name]) {
        url = url.replace(`{${param.name}}`, encodeURIComponent(args[param.name]));
      }
    });

    // Build query parameters
    const queryParams = tool.executionParameters?.filter((p: any) => p.in === 'query') || [];
    const queryString = queryParams
      .map((param: any) => {
        if (args[param.name] !== undefined) {
          return `${encodeURIComponent(param.name)}=${encodeURIComponent(args[param.name])}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('&');

    if (queryString) {
      url += `?${queryString}`;
    }

    const fullUrl = `${tool.baseUrl || API_BASE_URL}${url}`;

    // Prepare request options
    const requestOptions: RequestInit = {
      method: tool.method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add request body for POST, PUT, PATCH
    if (['post', 'put', 'patch'].includes(tool.method.toLowerCase())) {
      const bodyParams = tool.executionParameters?.filter((p: any) => p.in === 'body') || [];
      if (bodyParams.length > 0 || tool.requestBodyContentType) {
        requestOptions.body = JSON.stringify(args);
      }
    }

    // Make the API call
    console.error(`[MCP Server] Calling ${tool.method.toUpperCase()} ${fullUrl}`);
    const response = await fetch(fullUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${response.status} ${response.statusText}\n${errorText}`,
          },
        ],
        isError: true,
      };
    }

    // Try to parse as JSON, fallback to text
    const contentType = response.headers.get('content-type');
    let responseData: any;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof responseData === 'string' 
            ? responseData 
            : JSON.stringify(responseData, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Main server function
 */
export async function startMcpServer() {
  // Create MCP server
  const server = new Server(
    {
      name: 'w3-identity-platform-api',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = await loadTools();
    return {
      tools: tools.map(convertToMcpTool),
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tools = await loadTools();
    const tool = tools.find((t) => t.name === request.params.name);

    if (!tool) {
      return {
        content: [
          {
            type: 'text',
            text: `Tool "${request.params.name}" not found`,
          },
        ],
        isError: true,
      };
    }

    return executeToolCall(tool, request.params.arguments || {});
  });

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP Server] W3 Identity Platform API MCP Server running on stdio');
}

// Run the server
startMcpServer().catch((error) => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});

