const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Prompt = require('../models/Prompt');
const ai = require('../services/ai');



router.post('/', async (req, res) => {
  try {
    // בדיקה שיש טוקן תקין
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'יש להתחבר למערכת כדי ליצור שיעור חדש' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'הסשן פג תוקף. יש להתחבר מחדש' });
    }
    
    // וידוא שה-user בבקשה תואם למשתמש המחובר
    if (!req.body.user || req.body.user !== req.user.userId) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'מזהה המשתמש לא תקין' });
    }

    // if OpenAI key is invalid, return clearer guidance
    if (!ai.hasValidKey()) {
      return res.status(400).json({ error: 'OPENAI_API_KEY_INVALID', message: 'OpenAI API key is not configured or invalid. Update OPENAI_API_KEY in backend/.env with a valid key from https://platform.openai.com/account/api-keys.' });
    }

    const { prompt: promptText, meta } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: 'MISSING_PROMPT', message: 'חסר טקסט השאלה' });
    }

    const userMeta = meta || {};
    const { raw, parsed } = await ai.generateLesson(userMeta, promptText);
    const p = await Prompt.create({ ...req.body, response: parsed ? parsed.lesson : raw, rawResponse: raw, parsedResponse: parsed });
    res.status(201).json(p);
  } catch (err) {
    // map known ai errors to friendly responses
    if (err.message && err.message.startsWith('OPENAI_API_KEY_INVALID')) {
      return res.status(400).json({ error: 'OPENAI_API_KEY_INVALID', message: 'OpenAI rejected the API key. Create a new API key at https://platform.openai.com/account/api-keys and update backend/.env' });
    }
    if (err.message && err.message.startsWith('OPENAI_ERROR')) {
      return res.status(502).json({ error: 'OPENAI_ERROR', message: 'OpenAI returned an error: ' + err.message });
    }
    console.error('Prompt handler error', err && err.original ? err.original : err);
    res.status(500).json({ error: err.message || String(err) });
  }
});



router.get('/', async (req, res) => {
  try {
    console.log('Fetching prompts...');
    const ps = await Prompt.find()
      .populate('user')
      .populate('category')
      .populate('subCategory')
      .sort({ createdAt: -1 })
      .limit(20);
    console.log(`Found ${ps.length} prompts`);
    res.json(ps);
  } catch (err) {
    console.error('Error fetching prompts:', err);
    res.status(500).json({ 
      error: 'Failed to fetch prompts',
      details: err.message,
      code: err.code 
    });
  }
});
router.get('/user/:userId', async (req, res) => {
  try {
    const prompts = await Prompt.find({ user: req.params.userId })
      .populate('category')
      .populate('subCategory')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
