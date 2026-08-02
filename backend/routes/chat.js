import express from 'express';
import { chatWithGemini } from '../utils/geminiHelper.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const reply = await chatWithGemini(message, history || []);
    res.json({ text: reply });
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI response' });
  }
});

export default router;
