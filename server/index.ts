import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { generateRouter, healthRouter } from './routes/index.js';
import { getEnv } from './utils/env.js';

const env = getEnv();
const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use(healthRouter);
app.use('/api', generateRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`);
});

export default app;
