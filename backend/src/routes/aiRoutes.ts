import { Router } from 'express';
const router = Router();
router.post('/generate', async (req, res) => {
  // Simple mock AI response
  const { prompt } = req.body;
  const result = await aiService.generateText(prompt);
  res.json({ result });
});
export default router;
