import express from "express";
import ViteExpress from "vite-express";
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Router
import v1Router from "@/router/v1.js";

// Socket.IO Service
import { initializeSocketService } from "@/socket/socket.service.js";

// Swagger/OpenAPI Documentation
import { setupSwagger } from "@/config/swagger.config.js";


// Admin account initialization
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateMcpServer } from "./openapi-mcp/mcp-generator";
import { startMcpServer } from "./openapi-mcp/mcp-server";
import { AuthRepository } from "@/features/auth/auth.repository.js";

const execAsync = promisify(exec);

const app = express();

// Helper function to run migrations
async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');
    await execAsync('pnpm run migrate');
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.warn('⚠️  Migrations warning (might already be applied):', error);
  }
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend origins
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Allow common headers
  optionsSuccessStatus: 200 // For legacy browser support
};

// Global middlewares
app.use(cors(corsOptions)); // Enable CORS with configuration
app.use(helmet()); // For security headers
app.use(morgan('dev')); // For logging requests
app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded request bodies

// Serve static files
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine public directory based on environment
// In Docker: UPLOADS_PATH is set to /app/public/uploads, so serve from /app/public
// In local dev: serve from dist/public
const publicDir = process.env.UPLOADS_PATH 
  ? path.dirname(process.env.UPLOADS_PATH)  // Extract /app/public from /app/public/uploads
  : path.join(process.cwd(), 'public'); // Local dev: use project root public

app.use(express.static(publicDir));

// Router
app.use('/api/v1', v1Router);

// Setup Swagger/OpenAPI Documentation
setupSwagger(app);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO service
const socketService = initializeSocketService(server);

// Start server
const PORT = process.env.PORT || 9487;

// Run migrations, initialize accounts, and load FUNGIBLE_TOKEN_ID before starting the server
runMigrations()
.then(async () => {
  // Initialize admin account
  try {
    const authRepository = new AuthRepository();
    await authRepository.initAccount();
  } catch (error) {
    console.error('⚠️  Failed to initialize admin account:', error);
  }

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  // Generate MCP tools from OpenAPI spec
  try {
    const mcpTools = await generateMcpServer();
    if (mcpTools.length > 0) {
      console.log(`✅ MCP tools generated successfully (${mcpTools.length} tools)`);
    }
  } catch (error) {
    console.error('⚠️  Failed to generate MCP tools:', error);
  }


  // Start MCP server
  startMcpServer()

})
.catch((error) => {
  console.error('Error running migrations:', error);
  process.exit(1);
});
