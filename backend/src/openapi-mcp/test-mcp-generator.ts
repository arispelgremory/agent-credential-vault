/**
 * Test script for MCP Generator
 * Run with: pnpm tsx src/openapi-mcp/test-mcp-generator.ts
 */

import { generateMcpServer } from './mcp-generator.js';

async function testMcpGenerator() {
  console.log('🧪 Testing MCP Generator...\n');

  try {
    // Test 1: Check if OpenAPI spec is accessible
    const apiPort = process.env.API_PORT || 9487;
    const specUrl = `http://localhost:${apiPort}/api-docs.json`;
    
    console.log(`📡 Checking OpenAPI spec at: ${specUrl}`);
    const response = await fetch(specUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }
    
    const spec = await response.json();
    console.log(`✅ OpenAPI spec is accessible`);
    console.log(`   - Title: ${spec.info?.title || 'N/A'}`);
    console.log(`   - Version: ${spec.info?.version || 'N/A'}`);
    console.log(`   - Paths: ${Object.keys(spec.paths || {}).length}\n`);

    // Test 2: Generate MCP tools
    console.log('🔧 Generating MCP tools...\n');
    const tools = await generateMcpServer();

    // Test 3: Validate tools
    console.log('\n📊 Tool Validation:');
    console.log(`   - Total tools: ${tools.length}`);
    
    if (tools.length === 0) {
      console.warn('⚠️  No tools generated. Check your OpenAPI spec for defined paths.');
      return;
    }

    // Group tools by method
    const toolsByMethod: Record<string, number> = {};
    tools.forEach(tool => {
      const method = tool.method.toUpperCase();
      toolsByMethod[method] = (toolsByMethod[method] || 0) + 1;
    });

    console.log('   - Tools by method:');
    Object.entries(toolsByMethod).forEach(([method, count]) => {
      console.log(`     ${method}: ${count}`);
    });

    // Test 4: Show sample tool details
    console.log('\n📋 Sample Tool Details (first 3):');
    tools.slice(0, 3).forEach((tool, index) => {
      console.log(`\n   ${index + 1}. ${tool.name}`);
      console.log(`      Method: ${tool.method.toUpperCase()}`);
      console.log(`      Path: ${tool.pathTemplate}`);
      console.log(`      Description: ${tool.description || 'N/A'}`);
      console.log(`      Operation ID: ${tool.operationId}`);
      console.log(`      Parameters: ${tool.parameters?.length || 0}`);
      if (tool.requestBodyContentType) {
        console.log(`      Request Body: ${tool.requestBodyContentType}`);
      }
    });

    // Test 5: Check for required fields
    console.log('\n✅ Validation Results:');
    const invalidTools = tools.filter(tool => 
      !tool.name || !tool.method || !tool.pathTemplate || !tool.inputSchema
    );
    
    if (invalidTools.length > 0) {
      console.error(`   ❌ Found ${invalidTools.length} tools with missing required fields`);
    } else {
      console.log('   ✅ All tools have required fields (name, method, pathTemplate, inputSchema)');
    }

    console.log('\n🎉 MCP Generator test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Make sure your server is running on port', process.env.API_PORT || 9487);
        console.error('   2. Verify the OpenAPI spec is accessible at /api-docs.json');
        console.error('   3. Check if CORS is blocking the request');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testMcpGenerator();

