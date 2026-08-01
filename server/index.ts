import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { generateRouter, healthRouter } from './routes/index.js';
import { getEnv } from './utils/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = getEnv();
const app = express();

// In production, serve the built React client
const isProduction = env.NODE_ENV === 'production';
const clientDistPath = path.resolve(__dirname, '../../dist');

// CORS — allow the configured origin (or all origins in production if fronted by Vercel)
app.use(
  cors({
    origin: isProduction ? true : env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '25kb' }));

// API routes
app.use(healthRouter);
app.use('/api', generateRouter);

// Serve static frontend in production (Render all-in-one mode)
if (isProduction) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[server] Port ${env.PORT} is already in use.`);
    process.exit(1);
  }
  console.error('[server]', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received — shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[server] SIGINT received — shutting down');
  server.close(() => process.exit(0));
});

export default app;
