const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyRecaptcha } = require('../services/recaptcha');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email: suppliedEmail, password: suppliedPassword, recaptchaToken } = req.body;
  // optional recaptcha verification when secret configured
  const rec = await verifyRecaptcha(recaptchaToken);
  if (!rec.ok) return res.status(400).json({ error: 'recaptcha_failed', details: rec });

  const email = suppliedEmail, password = suppliedPassword;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
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

module.exports = router;
