"use strict";
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Prompt = require('../models/Prompt');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Create a file backend/.env with MONGO_URI or set the environment variable.');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const bcrypt = require('bcrypt');
    // create demo users with hashed password (password: password123)
    const pwd = 'password123';
    const hash = await bcrypt.hash(pwd, 10);
    const sampleUsers = [
      { name: 'Esti Demo 1', phone: '+972500000001', email: 'esti.demo1@example.com', password: hash },
      { name: 'Esti Demo 2', phone: '+972500000002', email: 'esti.demo2@example.com', password: hash }
    ];

    // upsert users to avoid duplicate key errors
    for (const u of sampleUsers) {
      await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
    }
    const inserted = await User.find({ email: { $in: sampleUsers.map(s => s.email) } });
    console.log('Upserted users:', inserted.map(u => u.name));

    const sampleCustomers = [
      { name: 'Alon Cohen', phone: '+972501234567' },
      { name: 'Maya Levi', phone: '+972502345678' }
    ];
    const insertedCustomers = await Customer.insertMany(sampleCustomers, { ordered: false });
    console.log('Inserted customers:', insertedCustomers.map(c => c.name));

    // categories & subcategories
    const cats = await Category.insertMany([
      { name: 'Math' },
      { name: 'Programming' }
    ], { ordered: false });
    console.log('Inserted categories:', cats.map(c => c.name));

    const subs = await SubCategory.insertMany([
      { name: 'Algebra', category: cats[0]._id },
      { name: 'Calculus', category: cats[0]._id },
      { name: 'JavaScript', category: cats[1]._id },
      { name: 'Python', category: cats[1]._id }
    ], { ordered: false });
    console.log('Inserted subcategories:', subs.map(s => s.name));

    // prompts: link to a user and category/subcategory
    const users = await User.find();
    const samplePrompts = [
      { user: users[0]._id, category: cats[1]._id, subCategory: subs[2]._id, prompt: 'How to use map in JS?', response: 'Use Array.prototype.map...' },
      { user: users[1]._id, category: cats[0]._id, subCategory: subs[0]._id, prompt: 'What is a linear equation?', response: 'A linear equation is...' }
    ];
    const insertedPrompts = await Prompt.insertMany(samplePrompts, { ordered: false });
    console.log('Inserted prompts:', insertedPrompts.map(p => p._id.toString()));
  } catch (err) {
    console.error('Error during seed:', err && err.message ? err.message : err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
