import { Router } from 'express';
import { generateController } from '../controllers/generate.controller.js';

export const generateRouter = Router();

generateRouter.post('/generate', generateController);
