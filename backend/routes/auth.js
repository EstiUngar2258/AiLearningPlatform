const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyRecaptcha } = require('../services/recaptcha');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email: suppliedEmail, password: suppliedPassword, recaptchaToken } = req.body;
    
    // Input validation
    if (!suppliedEmail || !suppliedPassword) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'נדרש למלא אימייל וסיסמה',
        fields: {
          email: !suppliedEmail ? 'נדרש למלא אימייל' : null,
          password: !suppliedPassword ? 'נדרש למלא סיסמה' : null
        }
      });
    }

    if (suppliedEmail.length < 5 || !suppliedEmail.includes('@')) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'כתובת אימייל לא תקינה',
        field: 'email'
      });
    }

    // optional recaptcha verification when secret configured
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return res.status(400).json({ 
        error: 'RECAPTCHA_FAILED', 
        message: 'אנא אמת שאתה אנושי',
        details: rec 
      });
    }

    const email = suppliedEmail.toLowerCase().trim();
    const password = suppliedPassword;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ 
        error: 'AUTH_FAILED', 
        message: 'שם משתמש או סיסמה שגויים'
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ 
        error: 'AUTH_FAILED', 
        message: 'שם משתמש או סיסמה שגויים'
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        name: user.name,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return success with welcome message
    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email 
      },
      message: `ברוך הבא ${user.name}!`
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'SERVER_ERROR', 
      message: 'אירעה שגיאה. אנא נסה שוב מאוחר יותר'
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('Registration attempt with data:', { 
    name: req.body.name,
    email: req.body.email,
    hasPassword: !!req.body.password
  });

  const { name, email, password, recaptchaToken } = req.body;
  if (!name || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      error: 'name, email and password required',
      missing: {
        name: !name,
        email: !email,
        password: !password
      }
    });
  }

  // require recaptcha verification when configured
  const rec = await verifyRecaptcha(recaptchaToken);
  if (!rec.ok) return res.status(400).json({ error: 'recaptcha_failed', details: rec });

  try {
    console.log('Checking for existing user...');
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('User already exists with this email');
      return res.status(409).json({ error: 'user already exists' });
    }

    console.log('Creating password hash...');
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Creating new user...');
    const user = await User.create({ name, email, password: hash });
    console.log('User created successfully:', user._id);
    
    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error in registration:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(409).json({ error: 'user already exists' });
    }
    
    res.status(500).json({ 
      error: err.message,
      details: {
        name: err.name,
        code: err.code,
        message: err.message
      }
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  // For JWT stateless sessions, frontend can just drop the token. Return OK.
  res.json({ ok: true });
});

// GET /api/auth/check
router.get('/check', async (req, res) => {
  // Expect Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { _id: decoded.userId, name: decoded.name } });
  } catch (err) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }
});

module.exports = router;
