import { Router } from 'express';
import { aiService } from '../services/aiService';

const router = Router();

router.post('/action', async (req, res) => {
  try {
    console.log("asking to AI")
    const { action, filePath, fileContent } = req.body;
    console.log("file path is :",fileContent)
    
    let prompt = '';
    switch (action) {
      case 'explain':
        prompt = `Explain what this code does in detail. File: ${filePath}\n\n${fileContent}`;
        break;
      case 'review':
        prompt = `Please review this pull request / code for security and performance issues. File: ${filePath}\n\n${fileContent}`;
        break;
      case 'fix':
        prompt = `Fix the bugs in this code. File: ${filePath}\n\n${fileContent}`;
        break;
      case 'document':
        prompt = `Write API documentation or comments for this code. File: ${filePath}\n\n${fileContent}`;
        break;
      default:
        prompt = `${action} this file: ${filePath}\n\n${fileContent}`;
    }
    
    const result = await aiService.generateResponse(prompt);
    res.json({ result });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await aiService.generateResponse(prompt);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});
export default router;
