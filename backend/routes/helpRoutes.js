import express from 'express';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();

// Post a new message (from user or admin)
router.post('/message', async (req, res) => {
  try {
    const { userEmail, userName, message, from } = req.body;
    if (!userEmail || !message) return res.status(400).json({ error: 'Missing fields' });
    const msg = new ChatMessage({ userEmail, userName, message, from: from || 'user' });
    await msg.save();
    res.json({ ok: true, msg });
  } catch (err) {
    console.error('Help message save error', err);
    res.status(500).json({ error: 'Unable to save message' });
  }
});

// Get messages for a user (query ?email=...)
router.get('/messages', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const messages = await ChatMessage.find({ userEmail: email }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Help messages fetch error', err);
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
});

// Admin: list all recent threads (grouped by userEmail)
router.get('/threads', async (req, res) => {
  try {
    const threads = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$userEmail', lastMessage: { $first: '$$ROOT' }, count: { $sum: 1 } } },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    res.json(threads);
  } catch (err) {
    console.error('Help threads error', err);
    res.status(500).json({ error: 'Unable to fetch threads' });
  }
});

// Admin: get messages for a specific thread
router.get('/thread/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const messages = await ChatMessage.find({ userEmail: email }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Help thread fetch error', err);
    res.status(500).json({ error: 'Unable to fetch thread' });
  }
});

export default router;
