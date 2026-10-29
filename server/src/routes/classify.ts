import { Router } from 'express';
import { classifyText } from '../utils/classifier.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }
    const result = await classifyText(text);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Classification failed' });
  }
});

export default router;
