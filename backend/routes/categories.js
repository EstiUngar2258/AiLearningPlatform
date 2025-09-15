const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.post('/', async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: -1 });
    res.json(cats);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});

module.exports = router;
