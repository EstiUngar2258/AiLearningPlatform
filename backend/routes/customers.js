const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Create a customer
router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const customer = new Customer({ name, phone });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
