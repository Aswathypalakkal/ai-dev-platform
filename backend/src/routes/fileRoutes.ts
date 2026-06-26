import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => {
  // TODO: implement real file listing from dbService
  res.json({ files: [] });
});
export default router;
