import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { generateRouter, healthRouter } from './routes/index.js';
import { getEnv } from './utils/env.js';

const env = getEnv();
const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '25kb' }));

app.use(healthRouter);
app.use('/api', generateRouter);

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
