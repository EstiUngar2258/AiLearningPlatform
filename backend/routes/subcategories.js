const express = require('express');
const router = express.Router();
const SubCategory = require('../models/SubCategory');

router.post('/', async (req, res) => {
  try {
    const sc = await SubCategory.create(req.body);
    res.status(201).json(sc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const scs = await SubCategory.find().populate('category').sort({ createdAt: -1 });
    res.json(scs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
