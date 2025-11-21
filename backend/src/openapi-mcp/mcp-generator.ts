import { getToolsFromOpenApi } from 'openapi-mcp-generator';

/**
 * Generate MCP tools from OpenAPI specification
 * @returns Array of MCP tool definitions
 */
export const generateMcpServer = async () => {
    // Extract MCP tool definitions from an OpenAPI spec
    const apiPort = process.env.API_PORT || 9487;
    const specUrl = `http://localhost:${apiPort}/api-docs.json`;
    const apiUrl = `http://localhost:${apiPort}/api/v1`;

    try {
        // Get tools from OpenAPI spec with options
        const tools = await getToolsFromOpenApi(specUrl, {
            baseUrl: apiUrl,
            dereference: true,
            // excludeOperationIds: ['deleteUser'], // Example: exclude specific operations
            // filterFn: (tool) => tool.method.toLowerCase() === 'get', // Example: only GET methods
        });

        console.log(`✅ Generated ${tools.length} MCP tools from OpenAPI spec`);
        
        // Log tool names for debugging
        if (tools.length > 0) {
            console.log('📋 Available MCP tools:');
            tools.forEach((tool) => {
                console.log(`   - ${tool.name} (${tool.method.toUpperCase()} ${tool.pathTemplate})`);
            });
        }

        return tools;
    } catch (error) {
        console.error('❌ Error generating MCP tools from OpenAPI spec:', error);
        throw error;
    }
}
