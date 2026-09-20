import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import handler from '../api/ai.js';

// Custom Vite plugin to serve /api/ai during local development (`npm run dev`)
function localApiPlugin() {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai' || req.url?.startsWith('/api/ai')) {
          if (req.method === 'OPTIONS') {
            res.writeHead(200, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            return res.end();
          }

          if (req.method === 'POST') {
            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                req.body = bodyStr ? JSON.parse(bodyStr) : {};
              } catch (_) {
                req.body = {};
              }

              // Always reload environment variables dynamically from .env on every request
              const freshClientEnv = loadEnv('development', process.cwd(), '');
              const freshRootEnv = loadEnv('development', path.resolve(process.cwd(), '..'), '');
              const freshEnv = { ...freshRootEnv, ...freshClientEnv };

              if (freshEnv.GEMINI_API_KEY) {
                process.env.GEMINI_API_KEY = freshEnv.GEMINI_API_KEY;
              }
              if (freshEnv.GEMINI_MODEL) {
                process.env.GEMINI_MODEL = freshEnv.GEMINI_MODEL;
              }

              // Mock Vercel res methods for local handler compatibility
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              try {
                await handler(req, res);
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables for local dev server (supporting both client and root .env)
  const clientEnv = loadEnv(mode, process.cwd(), '');
  const rootEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const env = { ...rootEnv, ...clientEnv };

  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  if (env.GEMINI_MODEL && !process.env.GEMINI_MODEL) {
    process.env.GEMINI_MODEL = env.GEMINI_MODEL;
  }

  return {
    plugins: [react(), localApiPlugin()],
    server: {
      port: 5173,
    },
  };
});
