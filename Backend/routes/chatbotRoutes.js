import express from 'express';
import { generateChatResponse } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/', generateChatResponse);

export default router; 