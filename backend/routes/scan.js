import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'Saved scan history' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Fetched scan history' });
});

export default router;
